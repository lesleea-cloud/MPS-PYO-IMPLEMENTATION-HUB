const { restFetch } = require('../_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const id = String(req.query.id || '').trim();
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }
  try {
    const r = await restFetch(
      '/integrations?id=eq.' + encodeURIComponent(id) + '&select=id,status,key_last4,configured_by,configured_at,base_url,endpoint_path,auth_type,auth_header_name'
    );
    if (!r.ok) {
      res.status(502).json({ error: 'Lookup failed' });
      return;
    }
    const rows = await r.json();
    if (!rows.length) {
      res.status(200).json({ status: 'not_configured' });
      return;
    }
    const row = rows[0];
    res.status(200).json({
      status: row.status || 'configured',
      last4: row.key_last4,
      configuredBy: row.configured_by,
      configuredAt: row.configured_at,
      baseUrl: row.base_url,
      endpointPath: row.endpoint_path,
      authType: row.auth_type,
      headerName: row.auth_header_name,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
