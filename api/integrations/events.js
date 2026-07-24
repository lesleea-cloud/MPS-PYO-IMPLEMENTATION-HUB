const { restFetch } = require('../_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const id = String(req.query.id || '').trim();
  try {
    let path = '/integration_events?select=id,integration_id,payload,received_at,status,applied_to_client,applied_at&order=received_at.desc&limit=200';
    if (id) path += '&integration_id=eq.' + encodeURIComponent(id);
    const r = await restFetch(path);
    if (!r.ok) {
      res.status(502).json({ error: 'Lookup failed' });
      return;
    }
    const rows = await r.json();
    res.status(200).json({ events: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
