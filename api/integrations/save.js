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
  const toolName = String((body && body.toolName) || id).trim();
  const apiKey = String((body && body.apiKey) || '').trim();
  const configuredBy = String((body && body.configuredBy) || '').trim();
  if (!id || !apiKey) {
    res.status(400).json({ error: 'id and apiKey are required' });
    return;
  }
  const last4 = apiKey.slice(-4);
  const now = new Date().toISOString();
  try {
    const r = await restFetch('/integrations', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify([{
        id: id,
        tool_name: toolName,
        api_key: apiKey,
        key_last4: last4,
        status: 'configured',
        configured_by: configuredBy,
        configured_at: now,
        updated_at: now,
      }]),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Save failed: ' + t });
      return;
    }
    res.status(200).json({ status: 'configured', last4: last4 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
