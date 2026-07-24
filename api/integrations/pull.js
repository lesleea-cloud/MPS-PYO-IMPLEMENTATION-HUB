// Outbound fetch for the PM Tool "pull" flow (§67/§68): reads the stored
// base URL, endpoint path, auth method, and API key for an integration,
// calls the tool's API, and stages each returned record into
// integration_events — the same table/shape the push webhook uses, so the
// existing PM Tool Data viewer (§57/§64) can review and assign pulled
// records without any changes.
const { restFetch } = require('../_lib/supabaseAdmin');

function applyAuth(url, headers, authType, headerName, apiKey) {
  if (authType === 'bearer') {
    headers['Authorization'] = 'Bearer ' + apiKey;
  } else if (authType === 'custom_header') {
    headers[headerName || 'X-Api-Key'] = apiKey;
  } else if (authType === 'basic') {
    headers['Authorization'] = 'Basic ' + Buffer.from(apiKey).toString('base64');
  } else if (authType === 'query_param') {
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'api_key=' + encodeURIComponent(apiKey);
  }
  return url;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const id = String((body && body.id) || '').trim();
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }
  try {
    const lookup = await restFetch(
      '/integrations?id=eq.' + encodeURIComponent(id) +
      '&select=api_key,status,base_url,endpoint_path,auth_type,auth_header_name'
    );
    if (!lookup.ok) {
      res.status(502).json({ error: 'Lookup failed' });
      return;
    }
    const rows = await lookup.json();
    if (!rows.length || rows[0].status !== 'configured') {
      res.status(400).json({ error: 'Integration is not configured' });
      return;
    }
    const cfg = rows[0];
    if (!cfg.base_url || !cfg.endpoint_path) {
      res.status(400).json({ error: 'Base URL and endpoint path must be saved first' });
      return;
    }
    let url = cfg.base_url.replace(/\/$/, '') + cfg.endpoint_path;
    const headers = { Accept: 'application/json' };
    url = applyAuth(url, headers, cfg.auth_type, cfg.auth_header_name, cfg.api_key);

    const upstream = await fetch(url, { method: 'GET', headers: headers });
    if (!upstream.ok) {
      const t = await upstream.text();
      res.status(502).json({ error: 'PM Tool API returned ' + upstream.status + ': ' + t.slice(0, 300) });
      return;
    }
    const json = await upstream.json();
    const records = Array.isArray(json) ? json : Array.isArray(json && json.data) ? json.data : null;
    if (!records) {
      res.status(502).json({ error: 'Unexpected response shape from PM Tool API' });
      return;
    }
    if (!records.length) {
      res.status(200).json({ fetched: 0, stored: 0 });
      return;
    }
    const insert = await restFetch('/integration_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(records.map(function (record) {
        return { integration_id: id, payload: record };
      })),
    });
    if (!insert.ok) {
      const t = await insert.text();
      res.status(502).json({ error: 'Fetched but failed to store: ' + t });
      return;
    }
    res.status(200).json({ fetched: records.length, stored: records.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
