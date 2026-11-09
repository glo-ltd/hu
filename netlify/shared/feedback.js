// The R21 feedback link: its own token (60 days), separate from his page.
const P = require('./profile-common');
const CC = require('./client-common');
const { json, parseBody } = require('./request-utils');

const PERMISSION_VERSION = 'en-2026-12-feedback-v1';
// TODO(James): counsel to approve.
const PERMISSION_TEXT = 'I give Heritage Union written permission to publish this in my own words, with';
const OPTIONS = [
  { value: 'none', label: 'Please don\'t publish it' },
  { value: 'first_name', label: 'my first name only' },
  { value: 'first_name_country', label: 'my first name and country' },
  { value: 'anonymous', label: 'no name (anonymously)' },
];

async function fromRequest(event) {
  if (event.httpMethod !== 'POST') return { response: json(405, { error: 'Method not allowed.' }) };
  const data = parseBody(event);
  if (!data) return { response: json(400, { error: 'Invalid request.' }) };
  const token = typeof data.token === 'string' ? data.token.trim() : '';
  const invalid = json(401, { error: 'This link no longer works. Thank you all the same; you can always write to team@heritage-union.com.', code: 'linkInvalid' });
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { response: invalid };
  const sb = P.serviceClient();
  if (!sb) return { response: json(500, { error: 'Not configured.' }) };
  const r = await sb.from('clients').select('id, full_name, country, application, feedback_token_expires_at').eq('feedback_token_hash', P.hashToken(token)).maybeSingle();
  if (r.error || !r.data) return { response: invalid };
  if (!r.data.feedback_token_expires_at || Date.parse(r.data.feedback_token_expires_at) <= Date.now()) return { response: invalid };
  if (P.rateLimited('f:' + token.slice(0, 12))) return { response: json(429, { error: 'Please wait a little and try again.' }) };
  return { sb, data, clientId: r.data.id, firstName: CC.firstName(r.data.full_name), country: (r.data.application && r.data.application.country) || r.data.country };
}

module.exports = { fromRequest, PERMISSION_TEXT, PERMISSION_VERSION, OPTIONS };
