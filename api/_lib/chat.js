// Google Chat helpers — posts to the team Space through an incoming webhook, replacing the
// old "checkForNewFolders" Apps Script poller (the app now announces things itself).
//
// Requires GOOGLE_CHAT_WEBHOOK_URL (Space → Apps & integrations → Webhooks) as a Vercel
// environment variable.
//
// @mentions: webhooks authenticate as an app, and Chat only accepts numeric user IDs for
// app-authenticated mentions (<users/123…>), not email aliases. Those IDs are captured into
// the chat_user_ids table each time someone signs in to the app with Google (see
// _saveChatUserId in index.html). A name with no captured ID is shown as plain text instead.
const { restFetch } = require('./supabaseAdmin');

// webhookUrl is optional; without it the message goes to the main team Space
// (GOOGLE_CHAT_WEBHOOK_URL).
async function postToChat(text, webhookUrl) {
  const url = webhookUrl || process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!url) throw new Error('GOOGLE_CHAT_WEBHOOK_URL is not set on the server');
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ text: text }),
  });
  if (!resp.ok) throw new Error('Chat webhook failed: ' + resp.status + ' ' + (await resp.text()));
}

// Plain text that can't inject a mention or Chat formatting.
function plain(s) {
  return String(s || '').replace(/[<>*_~`]/g, '').trim();
}

// names → ["<users/ID>" | "Plain Name"], de-duplicated, matched case-insensitively against
// the captured username, nickname, or email local part.
async function mentionsFor(names) {
  const list = Array.from(new Set((names || []).map((n) => plain(n)).filter(Boolean)));
  if (!list.length) return [];
  let rows = [];
  try {
    const r = await restFetch('/chat_user_ids?select=email,username,nickname,google_id');
    if (r.ok) rows = await r.json();
  } catch (e) { /* fall back to plain names */ }
  const seenIds = new Set();
  const out = [];
  list.forEach((name) => {
    const k = name.toLowerCase();
    const m = rows.find((u) => [u.username, u.nickname, String(u.email || '').split('@')[0]]
      .some((x) => x && String(x).trim().toLowerCase() === k));
    if (m && /^\d+$/.test(String(m.google_id))) {
      if (!seenIds.has(m.google_id)) { seenIds.add(m.google_id); out.push('<users/' + m.google_id + '>'); }
    } else {
      out.push(name);
    }
  });
  return out;
}

module.exports = { postToChat, mentionsFor, plain };
