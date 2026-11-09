const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { fake, sentEmails, P, call, seedCandidate, FULL_ANSWERS } = require('../helpers/seed');

test.beforeEach(() => { fake.reset(); sentEmails.length = 0; P._resetRateLimits(); });

function regBody(over) {
  return Object.assign({ fullName: 'Trần Thị Hoa', dateOfBirth: '1990-05-01', ageDeclared: true, province: 'Huế', zaloNumber: '0912345678',
    email: 'hoa@example.com', preferredLanguage: 'vi', aboutText: 'Xin chào', source: 'friend', consentContact: true, consentProcessing: true,
    turnstileToken: 'ok', lang: 'vi' }, over || {});
}

async function register(over) {
  process.env.CANDIDATE_SIGNUPS_OPEN = 'true'; process.env.TURNSTILE_SITE_KEY = 's'; process.env.TURNSTILE_SECRET = 's';
  const realFetch = global.fetch;
  global.fetch = async () => ({ json: async () => ({ success: true }) });
  try { return await call('candidate-register', regBody(over)); } finally { global.fetch = realFetch; }
}

test('registration creates a profile token (hash only, 60 days), returns it once, emails the link, sets profile_link_sent_at', async () => {
  const r = await register();
  assert.equal(r.status, 200, r.raw);
  const tok = r.body.profileToken;
  assert.match(tok, /^[A-Za-z0-9_-]{43}$/);
  const row = fake.tables.candidates[0];
  assert.equal(row.profile_token_hash, P.hashToken(tok));
  assert.ok(!JSON.stringify(row).includes(tok), 'raw token never stored');
  const days = (Date.parse(row.profile_token_expires_at) - Date.now()) / 86400000;
  assert.ok(days > 59.9 && days <= 60);
  assert.ok(row.profile_link_sent_at);
  const mail = sentEmails.find((m) => m.to === 'hoa@example.com');
  assert.ok(mail.html.includes('https://heritage-union.com/vi/ho-so#t=' + tok));
  assert.match(mail.html, /không chia sẻ/);
  // Team email goes to everyone in ADMIN_EMAILS (James and Huyen), lower-cased.
  const team = sentEmails.find((m) => Array.isArray(m.to) && m.to.includes('james@heritage-union.com'));
  assert.deepEqual(team.to, ['james@heritage-union.com', 'huyen@heritage-union.com']);
  assert.ok(!team.html.includes(tok) && !team.html.includes('Hoa'));
  assert.equal((await call('profile-get', { token: tok })).status, 200);
});

test('English email carries the link too; no email means no profile_link_sent_at', async () => {
  let r = await register({ preferredLanguage: 'en' });
  const mail = sentEmails.find((m) => m.to === 'hoa@example.com');
  assert.ok(mail.html.includes('/vi/ho-so#t=' + r.body.profileToken));
  assert.match(mail.html, /private to you/);
  fake.reset(); sentEmails.length = 0;
  r = await register({ email: '' });
  assert.ok(r.body.profileToken);
  assert.equal(fake.tables.candidates[0].profile_link_sent_at, undefined);
});

test('registration still succeeds if saving the token fails (no link, no crash)', async () => {
  fake.failNext['candidates:update'] = true;
  const r = await register();
  assert.equal(r.status, 200);
  assert.equal(r.body.profileToken, null);
  assert.equal(fake.tables.candidates.length, 1);
});

test('withdraw page: clears link and both consents, deletes photos now, keeps the row', async () => {
  const c = seedCandidate({ consent_profile_sharing_at: '2026-11-01T00:00:00Z' });
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const p = c.id + '/' + crypto.randomUUID() + '.jpg';
  fake.addObject(p);
  Object.assign(fake.tables.candidate_profiles[0], { photo_paths: [p], consent_photo_sharing_at: '2026-11-02T00:00:00Z' });
  const r = await call('withdraw-candidate', { contact: '+84 90 123 4567', lang: 'vi' });
  assert.equal(r.status, 200);
  const row = fake.tables.candidates[0];
  assert.equal(row.status, 'withdrawn');
  assert.equal(row.profile_token_hash, null);
  assert.equal(row.profile_token_expires_at, null);
  assert.equal(row.consent_profile_sharing_at, null);
  assert.equal(fake.tables.candidate_profiles[0].consent_photo_sharing_at, null);
  assert.equal(fake.hasObject(p), false);
  assert.equal(row.full_name, 'Nguyễn Thị Lan', 'row kept until the team deletes it');
  assert.equal((await call('profile-get', { token: c.token })).status, 401);
});
