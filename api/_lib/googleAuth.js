// Shared Google service-account auth (hand-rolled RS256 JWT via Node's built-in
// crypto — no googleapis/google-auth-library dependency, matching this project's
// zero-npm-dependency /api functions). Used by any integration that needs to call a
// Google API as the service account, with whatever OAuth scope that call needs.
//
// Requires GOOGLE_SA_EMAIL and GOOGLE_SA_PRIVATE_KEY to be set as Vercel environment
// variables (the service account's client_email / private_key from its JSON key).
const crypto = require('crypto');

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(scope) {
  const email = process.env.GOOGLE_SA_EMAIL;
  const key = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('GOOGLE_SA_EMAIL / GOOGLE_SA_PRIVATE_KEY is not set on the server');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = { iss: email, scope: scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  const unsigned = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(claims));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = base64url(signer.sign(key));
  const jwt = unsigned + '.' + signature;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + encodeURIComponent(jwt),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Google token exchange failed: ' + JSON.stringify(json));
  return json.access_token;
}

module.exports = { getAccessToken };
