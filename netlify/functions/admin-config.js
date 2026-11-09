// Public values the /admin/ page needs to start Supabase Auth: the project
// URL and the publishable (anon) key. The anon key alone reads nothing:
// every table has RLS on with no policies.
exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }
  var ok = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  return {
    statusCode: ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
    body: JSON.stringify(ok
      ? { supabaseUrl: process.env.SUPABASE_URL, supabaseAnonKey: process.env.SUPABASE_ANON_KEY }
      : { error: 'SUPABASE_URL or SUPABASE_ANON_KEY is not set.' }),
  };
};
