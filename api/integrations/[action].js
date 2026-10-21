// Single serverless function for every /api/integrations/<action> URL. Vercel's Hobby plan
// allows at most 12 functions per deployment, so the individual endpoints live in
// api/_lib/handlers/integrations/ (folders starting with "_" aren't deployed as functions)
// and this file routes to them. URLs are unchanged, e.g. /api/integrations/save?id=… still
// works; req.query carries both the "action" path segment and the normal query string.
//
// Static requires (not a computed path) so Vercel bundles every handler.
const HANDLERS = {
  'create-client-folder': require('../_lib/handlers/integrations/create-client-folder'),
  'drive-decks-sync': require('../_lib/handlers/integrations/drive-decks-sync'),
  'events-status': require('../_lib/handlers/integrations/events-status'),
  'events': require('../_lib/handlers/integrations/events'),
  'live-notify': require('../_lib/handlers/integrations/live-notify'),
  'new-client-notify': require('../_lib/handlers/integrations/new-client-notify'),
  'pull': require('../_lib/handlers/integrations/pull'),
  'remove': require('../_lib/handlers/integrations/remove'),
  'save-pull-config': require('../_lib/handlers/integrations/save-pull-config'),
  'save': require('../_lib/handlers/integrations/save'),
  'status': require('../_lib/handlers/integrations/status'),
  'webhook': require('../_lib/handlers/integrations/webhook'),
};

module.exports = async function handler(req, res) {
  const action = String((req.query && req.query.action) || '');
  const fn = Object.prototype.hasOwnProperty.call(HANDLERS, action) ? HANDLERS[action] : null;
  if (!fn) {
    res.status(404).json({ error: 'Unknown integrations endpoint: ' + action });
    return;
  }
  return fn(req, res);
};
