// Receiving endpoint for external tools (e.g. a PM tool) to push data into
// Sprout PYO Hub. Auth is a bearer key matching what was saved via
// /api/integrations/save for this integration id. Payloads are logged as-is
// for now — mapping them into Clients/Implementation Projects is future work.
const { restFetch } = require('../_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const id = String(req.query.id || '').trim();
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }
  const auth = req.headers['authorization'] || '';
  const providedKey = auth.indexOf('Bearer ') === 0
    ? auth.slice(7).trim()
    : String(req.headers['x-api-key'] || '').trim();
  if (!providedKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }
  try {
    const lookup = await restFetch(
      '/integrations?id=eq.' + encodeURIComponent(id) + '&select=api_key,status'
    );
    if (!lookup.ok) {
      res.status(502).json({ error: 'Lookup failed' });
      return;
    }
    const rows = await lookup.json();
    if (!rows.length || rows[0].status !== 'configured' || rows[0].api_key !== providedKey) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) { /* keep as raw string */ }
    }
    const insert = await restFetch('/integration_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify([{ integration_id: id, payload: payload || {} }]),
    });
    if (!insert.ok) {
      const t = await insert.text();
      res.status(502).json({ error: 'Log failed: ' + t });
      return;
    }
    res.status(200).json({ received: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
