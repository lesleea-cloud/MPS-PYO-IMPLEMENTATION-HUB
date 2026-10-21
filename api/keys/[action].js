// Single serverless function for every /api/keys/<action> URL (Hobby plan: max 12
// functions per deployment). The endpoints live in api/_lib/handlers/keys/; URLs are
// unchanged. See api/integrations/[action].js.
const HANDLERS = {
  'generate': require('../_lib/handlers/keys/generate'),
  'list': require('../_lib/handlers/keys/list'),
  'revoke': require('../_lib/handlers/keys/revoke'),
};

module.exports = async function handler(req, res) {
  const action = String((req.query && req.query.action) || '');
  const fn = Object.prototype.hasOwnProperty.call(HANDLERS, action) ? HANDLERS[action] : null;
  if (!fn) {
    res.status(404).json({ error: 'Unknown keys endpoint: ' + action });
    return;
  }
  return fn(req, res);
};
