// Posts "client is now LIVE" to the Implementers Google Chat Space when a client's status
// turns Live in the app (Status dropdown set to Live, or Live Run / Post Live ticked).
//
// Like new-client-notify, the message is built only from the client row already saved in
// Supabase — the request just names the client number — and the row must actually be Live,
// so this endpoint can't be used to post arbitrary text. Each client is announced at most
// once (clients.live_notified_at), so toggling the status back and forth doesn't spam.
//
// Environment variables:
//   GOOGLE_CHAT_IMPLEMENTERS_WEBHOOK_URL - the Implementers Space's incoming webhook. If not
//                                          set, falls back to GOOGLE_CHAT_WEBHOOK_URL.
//   SUPABASE_SERVICE_ROLE_KEY
const { restFetch } = require('../../supabaseAdmin');
const { postToChat, mentionsFor, plain } = require('../../chat');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const no = parseInt((body && body.no), 10);
  const markedBy = plain(body && body.markedBy).slice(0, 60);
  if (!no) {
    res.status(400).json({ error: 'Missing no' });
    return;
  }

  try {
    const lookup = await restFetch('/clients?no=eq.' + no + '&select=client,service,remarks,resource,pm,gov,otk_impl,pd_impl,pod_impl,live_notified_at');
    if (!lookup.ok) throw new Error('Client lookup failed: ' + (await lookup.text()));
    const rows = await lookup.json();
    if (!rows.length) {
      res.status(404).json({ error: 'Client ' + no + ' not found' });
      return;
    }
    const c = rows[0];
    if (c.remarks !== 'Live') {
      res.status(200).json({ posted: false, reason: 'Client is not Live' });
      return;
    }
    if (c.live_notified_at) {
      res.status(200).json({ posted: false, reason: 'Already announced' });
      return;
    }

    const people = Array.from(new Set([c.resource, c.gov, c.otk_impl, c.pd_impl, c.pod_impl]
      .map((p) => String(p || '').trim()).filter(Boolean)));
    const cc = await mentionsFor(people);
    const lines = [
      '🚀 *' + plain(c.client) + '* is now *LIVE*!',
      'Service: ' + (plain(c.service) || '—') + (plain(c.pm) ? '  ·  PM: ' + plain(c.pm) : ''),
    ];
    if (cc.length) lines.push('Team: ' + cc.join(', '));
    if (markedBy) lines.push('Marked Live by ' + markedBy + ' in the Implem Tool');
    await postToChat(lines.join('\n'), process.env.GOOGLE_CHAT_IMPLEMENTERS_WEBHOOK_URL);

    const mark = await restFetch('/clients?no=eq.' + no, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ live_notified_at: new Date().toISOString() }),
    });
    if (!mark.ok) console.warn('Failed to mark client ' + no + ' as announced Live');

    res.status(200).json({ posted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
