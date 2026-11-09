// Every admin-* function starts here. Verifies the Supabase Auth access
// token (from the magic-link sign-in on /admin/) with the service-role
// client, then checks the email is in ADMIN_EMAILS. Only after both checks
// does the function get to use the service role.
const P = require('./profile-common');

function adminEmails() {
  return String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(function (e) { return e.trim().toLowerCase(); })
    .filter(Boolean);
}

function bearer(event) {
  var h = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  var m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : '';
}

// Returns { supabase, email, data } or { response }.
async function requireAdmin(event) {
  if (event.httpMethod !== 'POST') return { response: P.json(405, { error: 'Method not allowed.' }) };
  var token = bearer(event);
  if (!token) return { response: P.json(401, { error: 'Please sign in.' }) };
  var supabase = P.serviceClient();
  if (!supabase) {
    console.error('Supabase is not configured.');
    return { response: P.json(500, { error: 'Not configured.' }) };
  }
  var allowed = adminEmails();
  var user;
  try {
    var res = await supabase.auth.getUser(token);
    user = res && res.data && res.data.user;
    if (res.error || !user) return { response: P.json(401, { error: 'Your sign-in has expired. Please sign in again.' }) };
  } catch (err) {
    console.error('admin auth getUser threw:', err);
    return { response: P.json(401, { error: 'Your sign-in has expired. Please sign in again.' }) };
  }
  var email = String(user.email || '').toLowerCase();
  if (!email || allowed.indexOf(email) === -1) {
    console.log(JSON.stringify({ admin_denied: true, reason: 'not_in_ADMIN_EMAILS' }));
    return { response: P.json(403, { error: 'This account is not allowed to use the team tool.' }) };
  }
  var data = P.parseBody(event);
  if (!data) return { response: P.json(400, { error: 'Invalid request.' }) };
  return { supabase: supabase, email: email, data: data };
}

// Who did what, to which record id. No candidate personal data.
function logAction(email, action, candidateId) {
  console.log(JSON.stringify({ admin_action: action, by: email, candidate_id: candidateId || null, at: new Date().toISOString() }));
}

var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v) { return typeof v === 'string' && UUID.test(v); }

module.exports = { requireAdmin, logAction, isUuid, adminEmails };
