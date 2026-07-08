// Public-facing stats endpoint for external tools. Auth is a hashed API key
// issued from Settings → External API Access (X-Api-Key header). Always
// returns all six metrics — the checkboxes in the UI are a consent record
// for the admin, not a server-side filter. Revisit if per-key filtering is
// ever needed.
const crypto = require('crypto');
const { restFetch } = require('../_lib/supabaseAdmin');

function isPYO(service) { return /PYO/i.test(service || ''); }
function isPS(service) { return (service || '').trim() === 'Payroll Starter'; }
function isLive(remarks) { return remarks === 'Live'; }
function isActive(remarks) { return remarks !== 'Live' && remarks !== 'Churned'; }

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const providedKey = String(req.headers['x-api-key'] || '').trim();
  if (!providedKey) {
    res.status(401).json({ error: 'Missing X-Api-Key header' });
    return;
  }
  const keyHash = crypto.createHash('sha256').update(providedKey).digest('hex');

  try {
    const lookup = await restFetch('/external_api_keys?key_hash=eq.' + encodeURIComponent(keyHash) + '&select=id,status');
    if (!lookup.ok) {
      res.status(502).json({ error: 'Lookup failed' });
      return;
    }
    const rows = await lookup.json();
    if (!rows.length || rows[0].status !== 'active') {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    const keyId = rows[0].id;

    const clientsRes = await restFetch('/clients?select=service,remarks');
    if (!clientsRes.ok) {
      res.status(502).json({ error: 'Data lookup failed' });
      return;
    }
    const clients = await clientsRes.json();

    const counts = { pyoActive: 0, pyoLive: 0, psActive: 0, psLive: 0, allActive: 0, allLive: 0 };
    clients.forEach(function (c) {
      const svc = c.service, rem = c.remarks;
      const active = isActive(rem), live = isLive(rem);
      if (active) counts.allActive++;
      if (live) counts.allLive++;
      if (isPYO(svc)) { if (active) counts.pyoActive++; if (live) counts.pyoLive++; }
      if (isPS(svc)) { if (active) counts.psActive++; if (live) counts.psLive++; }
    });

    restFetch('/external_api_keys?id=eq.' + encodeURIComponent(keyId), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_used_at: new Date().toISOString() }),
    }).catch(function () {});

    res.status(200).json({
      pyo: { activeCount: counts.pyoActive, liveCount: counts.pyoLive },
      payrollStarter: { activeCount: counts.psActive, liveCount: counts.psLive },
      allClients: { activeCount: counts.allActive, liveCount: counts.allLive },
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
