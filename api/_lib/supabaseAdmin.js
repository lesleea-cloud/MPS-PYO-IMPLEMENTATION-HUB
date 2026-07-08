// Server-side only. Talks to Supabase's REST API (PostgREST) directly with
// the service_role key, which bypasses RLS. Never import this from client code
// and never send SUPABASE_SERVICE_ROLE_KEY to the browser.
const SUPABASE_URL = 'https://jchqgxyectvsqfmrnype.supabase.co';

function restHeaders(extra) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set on the server');
  return Object.assign(
    {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    extra || {}
  );
}

async function restFetch(path, opts) {
  opts = opts || {};
  return fetch(SUPABASE_URL + '/rest/v1' + path, Object.assign({}, opts, {
    headers: restHeaders(opts.headers),
  }));
}

module.exports = { SUPABASE_URL, restFetch };
