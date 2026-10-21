// Posts "new client" to the team Google Chat Space when a client is added through the app's
// Add client form (step 1 of the client intake flow; the "2026 Implem" Sheet is retired).
//
// The message is built only from the client row already saved in Supabase — the request
// just names the client number — so this endpoint can't be used to post arbitrary text.
// Each client is announced at most once (clients.new_client_notified_at).
//
// Required environment variables: GOOGLE_CHAT_WEBHOOK_URL, SUPABASE_SERVICE_ROLE_KEY.
const { restFetch } = require('../_lib/supabaseAdmin');
const { postToChat, plain } = require('../_lib/chat');

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
  const addedBy = plain(body && body.addedBy).slice(0, 60);
  if (!no) {
    res.status(400).json({ error: 'Missing no' });
    return;
  }

  try {
    const lookup = await restFetch('/clients?no=eq.' + no + '&select=client,service,month,resource,pm,gov,otk_impl,pd_impl,new_client_notified_at');
    if (!lookup.ok) throw new Error('Client lookup failed: ' + (await lookup.text()));
    const rows = await lookup.json();
    if (!rows.length) {
      res.status(404).json({ error: 'Client ' + no + ' not found' });
      return;
    }
    const c = rows[0];
    if (c.new_client_notified_at) {
      res.status(200).json({ posted: false, reason: 'Already announced' });
      return;
    }

    const team = [
      ['Implementer', c.resource], ['Gov Resource', c.gov], ['OTK Implementer', c.otk_impl],
      ['PD Implementer', c.pd_impl], ['Project Manager', c.pm],
    ].filter((t) => plain(t[1])).map((t) => t[0] + ': ' + plain(t[1]));
    const lines = [
      '🆕 *New client:* ' + plain(c.client),
      'Service: ' + (plain(c.service) || '—') + (plain(c.month) ? '  ·  Month: ' + plain(c.month) : ''),
    ];
    if (team.length) lines.push(team.join('  ·  '));
    if (addedBy) lines.push('Added by ' + addedBy + ' in the Implem Tool');
    await postToChat(lines.join('\n'));

    const mark = await restFetch('/clients?no=eq.' + no, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ new_client_notified_at: new Date().toISOString() }),
    });
    if (!mark.ok) console.warn('Failed to mark client ' + no + ' as announced');

    res.status(200).json({ posted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
