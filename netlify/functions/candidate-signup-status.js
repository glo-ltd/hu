// Tiny public GET endpoint so the static become-a-candidate page can know
// whether CANDIDATE_SIGNUPS_OPEN is true without exposing any secret. The
// page defaults to showing the waitlist form and only switches to the full
// registration form if this confirms signups are open, so a failed/slow
// request here fails safe (waitlist, not the full form).
//
// Also returns the Turnstile *site* key — this is the public half of the
// Turnstile key pair, meant to be visible in page source (unlike
// TURNSTILE_SECRET, which never leaves the server). There isn't another
// way to get a server-configured value onto a fully static page.
const { signupsOpen } = require('../shared/candidate-common');

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }
  // Only reports open when the flag is on AND both Turnstile keys are set,
  // so the page never shows a form whose human check can't load.
  var open = signupsOpen();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    body: JSON.stringify({ open: open, turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null }),
  };
};
