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
    const r = await restFetch('/integrations?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        api_key: null,
        key_last4: null,
        status: 'not_configured',
        configured_by: null,
        configured_at: null,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Remove failed: ' + t });
      return;
    }
    res.status(200).json({ status: 'not_configured' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
