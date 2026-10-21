// Creates (or finds) a client's Drive folder from the app — the replacement for the retired
// "2026 Implem" Google Sheet + "Client folder automation" Apps Script. Called when a client
// is added through the Add client form (and, as a fallback for older clients with no folder
// yet, when a PYO/Starter client first gets a resource assigned).
//
// Before creating anything it checks for a folder with the exact same name under the
// destination parent (same safety check the Apps Script's createClientFolder() did), so a
// folder made earlier by the old Sheet flow is reused instead of duplicated.
//
// After a NEW folder is created, this function itself posts "folder is now uploaded" to the
// team Google Chat Space, @mentioning the client's assigned people (Implementer / Gov /
// OTK / PD / PoD). This replaces the old "checkForNewFolders" Apps Script poller — turn that
// script's time trigger off, or every folder is announced twice. The resource names are
// still also written to the folder's Drive description, as before.
//
// Required environment variables:
//   GOOGLE_SA_EMAIL / GOOGLE_SA_PRIVATE_KEY - the service account's credentials
//   GOOGLE_CHAT_WEBHOOK_URL                 - the Space's incoming webhook (for the message)
//
// The service account needs Editor access on the destination parent folders below, and
// Viewer access on the two template folders (or domain-wide delegation — see §126/§134).
const { getAccessToken } = require('../_lib/googleAuth');
const { restFetch } = require('../_lib/supabaseAdmin');
const { postToChat, mentionsFor, plain } = require('../_lib/chat');

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

// Ported from the Apps Script's CONFIG.SERVICES. Any service containing "PYO"
// (case-insensitive) is PYO-family, so new combos (e.g. "PYO + HR + Statutory
// Disbursement") get the PYO folder without a code change. Services with no template get a
// plain empty folder, exactly like the Apps Script. Final Pay on Demand and Special
// Projects had no mapping in the Apps Script either, so they're skipped.
const PYO_TEMPLATE_ID = '1KblDw7y1ZoKX9I5o6yeRmpuObZxLha_o';
const PYO_DEST_PARENT_ID = '1znixNUtIFC4xDd7Y482FwrSKmRDNZVrs';
const STARTER_TEMPLATE_ID = '1WI6YZBQyLTDotVtMYDUfbcQZS24a2FJg';
const STARTER_DEST_PARENT_ID = '1KTBdPYLICcZEZxLAKIZZV0Cvleh4rQ-v';
const PLAIN_SERVICES = {
  'Annualization on Demand': '1f1194VUdXIpCZZUNQywAOY-WFKA8kjN7',
  'Payroll on Demand': '1OGcZh3WCp-P4qEdhRn1L0gZHbg95V4hb',
  'Sprout Gov': '1l9vBbbOKj3gdpqiWn6m1uDqnxXtpMR30',
  'Statutory Disbursement': '1l9vBbbOKj3gdpqiWn6m1uDqnxXtpMR30',
  'Payroll Disbursement': '1GOz8fhGXSQqytK_KQuAt2PuN_XGAP_ix',
  'Outsourced Timekeeping': '1DbvDdRCVyNmvvlMKV2yDi2GNWxVEz7p9', // "OTK" in the Apps Script
  'OTK': '1DbvDdRCVyNmvvlMKV2yDi2GNWxVEz7p9',
};

function resolveMapping(service) {
  if (service === 'Payroll Starter') {
    return { templateId: STARTER_TEMPLATE_ID, destParentId: STARTER_DEST_PARENT_ID, suffix: '_Starter' };
  }
  if (/pyo/i.test(service || '')) {
    return { templateId: PYO_TEMPLATE_ID, destParentId: PYO_DEST_PARENT_ID, suffix: '' };
  }
  if (PLAIN_SERVICES[service]) {
    return { templateId: null, destParentId: PLAIN_SERVICES[service], suffix: '' };
  }
  return null;
}

// supportsAllDrives / includeItemsFromAllDrives make every call work whether these folders
// live in My Drive or a shared drive (without them, shared-drive files are invisible).
function withDriveFlags(path, isList) {
  return path + (path.indexOf('?') >= 0 ? '&' : '?') + 'supportsAllDrives=true' + (isList ? '&includeItemsFromAllDrives=true' : '');
}
async function driveGet(path, token, isList) {
  const resp = await fetch('https://www.googleapis.com/drive/v3/' + withDriveFlags(path, isList), { headers: { Authorization: 'Bearer ' + token } });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Drive GET ' + path + ' failed: ' + JSON.stringify(json));
  return json;
}
async function drivePost(path, token, body) {
  const resp = await fetch('https://www.googleapis.com/drive/v3/' + withDriveFlags(path), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Drive POST ' + path + ' failed: ' + JSON.stringify(json));
  return json;
}
async function drivePatch(path, token, body) {
  const resp = await fetch('https://www.googleapis.com/drive/v3/' + withDriveFlags(path), {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Drive PATCH ' + path + ' failed: ' + JSON.stringify(json));
  return json;
}

async function findChildFolderByName(parentId, name, token) {
  const q = "'" + parentId + "' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder' and name = '" + name.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const json = await driveGet('files?q=' + encodeURIComponent(q) + '&fields=' + encodeURIComponent('files(id,name,webViewLink)'), token, true);
  return (json.files && json.files[0]) || null;
}

async function createFolder(parentId, name, token) {
  return drivePost('files?fields=' + encodeURIComponent('id,name,webViewLink'), token, {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  });
}

async function copyFolderContentsRecursive(sourceId, targetId, token) {
  const q = "'" + sourceId + "' in parents and trashed = false";
  const json = await driveGet('files?q=' + encodeURIComponent(q) + '&fields=' + encodeURIComponent('files(id,name,mimeType)') + '&pageSize=1000', token, true);
  const items = json.files || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      const newSub = await createFolder(targetId, item.name, token);
      await copyFolderContentsRecursive(item.id, newSub.id, token);
    } else {
      await drivePost('files/' + item.id + '/copy', token, { name: item.name, parents: [targetId] });
    }
  }
}

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
  const clientName = String((body && body.clientName) || '').trim();
  const service = String((body && body.service) || '').trim();
  if (!no || !clientName || !service) {
    res.status(400).json({ error: 'Missing no, clientName, or service' });
    return;
  }

  const mapping = resolveMapping(service);
  if (!mapping) {
    res.status(200).json({ skipped: true, reason: 'No folder mapping for service "' + service + '"' });
    return;
  }

  try {
    // Already recorded on a prior call? Short-circuit without touching Drive at all. The
    // assigned people are read from the saved row (not the request) for the description
    // and the Chat @mentions.
    let saved = {};
    const lookup = await restFetch('/clients?no=eq.' + no + '&select=folder_link,resource,gov,otk_impl,pd_impl,pod_impl');
    if (lookup.ok) {
      const rows = await lookup.json();
      if (rows.length) saved = rows[0];
      if (saved.folder_link) {
        res.status(200).json({ created: false, url: saved.folder_link });
        return;
      }
    }
    const people = [saved.resource, saved.gov, saved.otk_impl, saved.pd_impl, saved.pod_impl]
      .map((p) => String(p || '').trim()).filter(Boolean);
    const uniquePeople = Array.from(new Set(people));

    const token = await getAccessToken(DRIVE_SCOPE);
    const folderName = clientName + mapping.suffix;

    let folder = await findChildFolderByName(mapping.destParentId, folderName, token);
    let created = false;
    if (!folder) {
      folder = await createFolder(mapping.destParentId, folderName, token);
      if (mapping.templateId) await copyFolderContentsRecursive(mapping.templateId, folder.id, token);
      created = true;
    }
    if (uniquePeople.length) {
      await drivePatch('files/' + folder.id, token, { description: uniquePeople.join(', ') });
    }
    const url = folder.webViewLink || ('https://drive.google.com/drive/folders/' + folder.id);

    const save = await restFetch('/clients?no=eq.' + no, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ folder_link: url }),
    });
    if (!save.ok) console.warn('Failed to save folder_link for client ' + no);

    // Announce only folders this call actually created (a reused folder was announced
    // when it was first made).
    let chatError = null;
    if (created) {
      try {
        let parentName = '';
        try { parentName = (await driveGet('files/' + mapping.destParentId + '?fields=name', token)).name || ''; } catch (e) { /* optional */ }
        const cc = await mentionsFor(uniquePeople);
        const lines = ['📁 *' + plain(folderName) + "*'s folder is now uploaded" + (parentName ? ' in *' + plain(parentName) + '*' : '') + '.', url];
        if (cc.length) lines.push('cc: ' + cc.join(', '));
        await postToChat(lines.join('\n'));
      } catch (e) {
        chatError = e.message;
        console.warn('Folder created but the Chat message failed: ' + e.message);
      }
    }

    res.status(200).json({ created: created, url: url, chatError: chatError });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
