// Marks a staged PM Tool event as assigned (to a client) / dismissed / back
// to unassigned. The actual field mapping happens client-side (index.html);
// this endpoint only persists which client an event was applied to, since
// integration_events has no anon/authenticated Supabase policies.
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
  const status = String((body && body.status) || '').trim();
  if (!id || !status) {
    res.status(400).json({ error: 'Missing id or status' });
    return;
  }
  if (['assigned', 'dismissed', 'unassigned'].indexOf(status) === -1) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  const patch = { status };
  if (status === 'assigned' && body.clientNo) {
    patch.applied_to_client = parseInt(body.clientNo, 10) || null;
    patch.applied_at = new Date().toISOString();
  } else {
    patch.applied_to_client = null;
    patch.applied_at = null;
  }
  try {
    const r = await restFetch('/integration_events?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Update failed: ' + t });
      return;
    }
    res.status(200).json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
