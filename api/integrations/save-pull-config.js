// Saves the "how to pull data from this tool" settings for an already-
// configured integration: base URL, endpoint path, and how the API key
// should be authenticated. This is separate from /api/integrations/save.js
// (which only saves the key itself) so re-saving pull settings never
// requires re-pasting the key. Actually calling the external API happens
// in a separate endpoint once these are filled in.
const { restFetch } = require('../_lib/supabaseAdmin');

const VALID_AUTH_TYPES = ['bearer', 'custom_header', 'basic', 'query_param'];

function pathnameOf(url) {
  try { return new URL(url).pathname.replace(/\/$/, ''); } catch (e) { return ''; }
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
  const baseUrl = String((body && body.baseUrl) || '').trim();
  const endpointPath = String((body && body.endpointPath) || '').trim();
  const authType = String((body && body.authType) || '').trim();
  const headerName = String((body && body.headerName) || '').trim();
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }
  if (authType && VALID_AUTH_TYPES.indexOf(authType) === -1) {
    res.status(400).json({ error: 'Invalid authType' });
    return;
  }
  if (authType === 'custom_header' && !headerName) {
    res.status(400).json({ error: 'headerName is required for custom_header auth' });
    return;
  }
  const basePath = pathnameOf(baseUrl);
  const endpointPathOnly = endpointPath.split('?')[0].replace(/\/$/, '');
  if (basePath && endpointPathOnly && endpointPathOnly.indexOf(basePath) === 0) {
    res.status(400).json({
      error: 'Base URL already ends with "' + basePath + '" and Endpoint path starts with it again — ' +
        'the request would hit "' + basePath + endpointPathOnly + '". Remove "' + basePath + '" from one of the two fields.',
    });
    return;
  }
  try {
    const r = await restFetch('/integrations?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        base_url: baseUrl || null,
        endpoint_path: endpointPath || null,
        auth_type: authType || null,
        auth_header_name: authType === 'custom_header' ? headerName : null,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Save failed: ' + t });
      return;
    }
    res.status(200).json({ saved: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
