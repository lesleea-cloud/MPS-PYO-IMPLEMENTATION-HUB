const { restFetch } = require('../_lib/supabaseAdmin');

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
    const r = await restFetch('/external_api_keys?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'revoked' }),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Revoke failed: ' + t });
      return;
    }
    res.status(200).json({ status: 'revoked' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
