// Scheduled job (see vercel.json "crons") that keeps Implementation Vault -> Decks
// in sync with a Google Drive folder where generated decks land, with zero manual
// step. Runs on a timer rather than being triggered from the browser, because the
// app's Google sign-in goes through Supabase Auth and never gives the client a
// standing Google API token — this needs its own service-account credential.
//
// Required environment variables (set in Vercel project settings):
//   GOOGLE_SA_EMAIL          - the service account's client_email
//   GOOGLE_SA_PRIVATE_KEY    - the service account's private_key (keep the \n escapes;
//                              they're unescaped below)
//   DRIVE_DECKS_FOLDER_ID    - the Drive folder ID to watch (Drive Folder 2:
//                              1HnVHw-apZ37UMVu1u8l5s8tRyBTi4PQL)
//   CRON_SECRET              - optional; if set, this endpoint only runs when called
//                              with "Authorization: Bearer <CRON_SECRET>" (Vercel
//                              Cron sends this automatically when the env var exists)
//
// The service account itself must be given read access to that Drive folder — share
// the folder with the service account's email address, same as sharing with any
// other Google account.
const { getAccessToken } = require('../_lib/googleAuth');
const { restFetch } = require('../_lib/supabaseAdmin');

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';

async function listDriveFiles(folderId, accessToken) {
  const q = "'" + folderId + "' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'";
  const url = 'https://www.googleapis.com/drive/v3/files'
    + '?q=' + encodeURIComponent(q)
    + '&fields=' + encodeURIComponent('files(id,name,webViewLink,createdTime)')
    + '&pageSize=1000';
  const resp = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Drive files.list failed: ' + JSON.stringify(json));
  return json.files || [];
}

// Expected naming convention: "{Client Name}_[Phase N] {Deck description}"
// e.g. "Trade Window Incorporated_[Phase 1] PYO KOM"
function parseDeckFilename(rawName) {
  const name = rawName.replace(/\.[^/.]+$/, '');
  const us = name.indexOf('_');
  const clientName = (us === -1 ? name : name.slice(0, us)).trim();
  const rest = (us === -1 ? '' : name.slice(us + 1)).trim();
  const m = rest.match(/^\[Phase\s*\d+\]\s*(.+)$/i);
  const desc = (m ? m[1] : rest).trim();
  const d = desc.toLowerCase();
  let deckType = desc || 'Deck';
  if (d.indexOf('kom') >= 0) deckType = 'KOM Deck';
  else if (d.indexOf('payroll discussion') >= 0) deckType = 'Payroll Discussion Deck';
  else if (d.indexOf('parallel run') >= 0) deckType = 'Parallel Run Deck';
  else if (d.indexOf('fitgap results') >= 0) deckType = 'Fitgap Results Deck';
  else if (d.indexOf('fitgap') >= 0) deckType = 'Fitgap Deck';
  else if (d.indexOf('simulation') >= 0) deckType = 'Simulation Deck';
  return { clientName: clientName || null, deckType };
}

function today() {
  const d = new Date();
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== 'Bearer ' + secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const folderId = process.env.DRIVE_DECKS_FOLDER_ID;
  if (!folderId) {
    res.status(500).json({ error: 'DRIVE_DECKS_FOLDER_ID is not set on the server' });
    return;
  }
  try {
    const accessToken = await getAccessToken(DRIVE_SCOPE);
    const files = await listDriveFiles(folderId, accessToken);
    if (!files.length) {
      res.status(200).json({ checked: 0, imported: 0 });
      return;
    }

    const existing = await restFetch('/vault_items?select=drive_file_id&drive_file_id=not.is.null');
    if (!existing.ok) throw new Error('Lookup of already-synced files failed');
    const existingIds = new Set((await existing.json()).map(function (r) { return r.drive_file_id; }));

    const newFiles = files.filter(function (f) { return !existingIds.has(f.id); });
    if (!newFiles.length) {
      res.status(200).json({ checked: files.length, imported: 0 });
      return;
    }

    const rows = newFiles.map(function (f) {
      const parsed = parseDeckFilename(f.name);
      const when = today();
      return {
        id: 'v_drivesync_' + f.id,
        name: parsed.deckType + (parsed.clientName ? ' — ' + parsed.clientName : '') + ' — ' + when,
        category: 'Decks',
        client_name: parsed.clientName,
        type: 'link',
        url: f.webViewLink || null,
        notes: 'Auto-synced from Drive folder',
        uploaded_by: 'Drive Sync',
        uploaded_at: when,
        deck_type: parsed.deckType,
        drive_file_id: f.id,
      };
    });

    const insert = await restFetch('/vault_items', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(rows),
    });
    if (!insert.ok) {
      const t = await insert.text();
      throw new Error('Insert failed: ' + t);
    }
    res.status(200).json({ checked: files.length, imported: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
