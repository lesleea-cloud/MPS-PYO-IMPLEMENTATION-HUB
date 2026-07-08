const { restFetch } = require('../_lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const r = await restFetch(
      '/external_api_keys?status=eq.active&select=id,label,key_prefix,created_at,last_used_at&order=created_at.desc'
    );
    if (!r.ok) {
      res.status(502).json({ error: 'Lookup failed' });
      return;
    }
    const rows = await r.json();
    res.status(200).json({
      keys: rows.map(function (row) {
        return {
          id: row.id,
          label: row.label,
          prefix: row.key_prefix,
          createdAt: row.created_at,
          lastUsedAt: row.last_used_at,
        };
      }),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
