// Issues a new external API key. The raw key is returned exactly once in
// this response and is never stored — only its SHA-256 hash + a display
// prefix are persisted, so it truly cannot be shown again after this call.
const crypto = require('crypto');
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
  const label = String((body && body.label) || '').trim();
  const metrics = (body && body.metrics && typeof body.metrics === 'object') ? body.metrics : {};
  if (!label) {
    res.status(400).json({ error: 'label is required' });
    return;
  }

  const rawKey = 'sk-sprout-' + crypto.randomBytes(24).toString('hex');
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 20);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const r = await restFetch('/external_api_keys', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify([{
        id: id,
        label: label,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        metrics: metrics,
        status: 'active',
        created_at: now,
      }]),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Save failed: ' + t });
      return;
    }
    res.status(200).json({ id: id, label: label, key: rawKey, prefix: keyPrefix, createdAt: now });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
