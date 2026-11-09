const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { fake, sentEmails, P, call, seedCandidate, FULL_ANSWERS, adminToken } = require('../helpers/seed');

test.beforeEach(() => { fake.reset(); sentEmails.length = 0; P._resetRateLimits(); });

const ADMIN_FNS = [
  ['admin-list', {}], ['admin-candidate', { id: crypto.randomUUID() }], ['admin-translate', { id: crypto.randomUUID(), translations: {} }],
  ['admin-link', { id: crypto.randomUUID() }], ['admin-status', { id: crypto.randomUUID(), action: 'zalo_confirm' }],
  ['admin-delete', { id: crypto.randomUUID(), confirmName: 'Lan' }],
];

test('every admin endpoint rejects a missing token, an expired token and an email not in ADMIN_EMAILS', async () => {
  for (const [name, body] of ADMIN_FNS) {
    let r = await call(name, body, { headers: {} });
    assert.equal(r.status, 401, name + ' missing');
    r = await call(name, body, { headers: { authorization: 'Bearer not-a-real-jwt' } });
    assert.equal(r.status, 401, name + ' unknown');
    r = await call(name, body, { headers: adminToken('james@heritage-union.com', { expiresAt: Date.now() - 1000 }) });
    assert.equal(r.status, 401, name + ' expired');
    r = await call(name, body, { headers: adminToken('someone@else.com') });
    assert.equal(r.status, 403, name + ' not allowed');
  }
  assert.equal(fake.calls.length, 0, 'no table was touched before auth passed');
});

test('ADMIN_EMAILS match is case-insensitive and trims spaces', async () => {
  const r = await call('admin-list', {}, { headers: adminToken('JAMES@heritage-union.com') });
  assert.equal(r.status, 200);
  const r2 = await call('admin-list', {}, { headers: adminToken('huyen@heritage-union.com') });
  assert.equal(r2.status, 200);
});

test('admin-config returns only the URL and publishable key', async () => {
  const r = await call('admin-config', undefined, { method: 'GET' });
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.body).sort(), ['supabaseAnonKey', 'supabaseUrl']);
  assert.ok(!r.raw.includes('service-role'));
});

test('admin-list: newest first, progress, consent badges, withdrawn date; deleted hidden', async () => {
  const a = seedCandidate({ created_at: '2026-11-01T00:00:00Z' });
  const b = seedCandidate({ created_at: '2026-11-05T00:00:00Z', consent_profile_sharing_at: '2026-11-05T00:00:00Z' });
  seedCandidate({ status: 'deleted' });
  const w = seedCandidate({ status: 'withdrawn', updated_at: '2026-10-10T00:00:00Z', created_at: '2026-10-01T00:00:00Z' });
  await call('profile-save', { token: a.token, answers: FULL_ANSWERS });
  const r = await call('admin-list', {}, { headers: adminToken('james@heritage-union.com') });
  assert.deepEqual(r.body.candidates.map((x) => x.id), [b.id, a.id, w.id]);
  const ra = r.body.candidates.find((x) => x.id === a.id);
  assert.equal(ra.stepsComplete, 4);
  assert.equal(ra.name, 'Lan');
  assert.equal(r.body.candidates[0].sharingConsent, true);
  assert.equal(r.body.candidates[2].withdrawnAt, '2026-10-10T00:00:00Z');
  assert.ok(!r.raw.includes('iphash'), 'no ip hash');
});

test('admin-candidate: detail with questions and signed photos; never returns token hash or ip hash', async () => {
  const c = seedCandidate();
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const r = await call('admin-candidate', { id: c.id }, { headers: adminToken('james@heritage-union.com') });
  assert.equal(r.status, 200);
  assert.equal(r.body.candidate.full_name, 'Nguyễn Thị Lan');
  assert.equal(r.body.profile.answers.occupation, 'Giáo viên');
  assert.equal(r.body.questions.version, '2026-11-v2');
  assert.ok(!r.raw.includes(c.row.profile_token_hash));
  assert.ok(!r.raw.includes('iphash'));
});

test('admin-translate: only free-text ids; records who and when; never touches answers', async () => {
  const c = seedCandidate();
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const before = JSON.stringify(fake.tables.candidate_profiles[0].answers);
  const h = adminToken('huyen@heritage-union.com');
  let r = await call('admin-translate', { id: c.id, translations: { about: 'I like cooking and walking by the sea.' } }, { headers: h });
  assert.equal(r.status, 200);
  const prof = fake.tables.candidate_profiles[0];
  assert.equal(prof.translations.about, 'I like cooking and walking by the sea.');
  assert.equal(prof.translated_by, 'huyen@heritage-union.com');
  assert.ok(prof.translated_at);
  assert.equal(JSON.stringify(prof.answers), before);
  for (const bad of [{ education: 'x' }, { notes: 'pretty' }, { rating: '5' }]) {
    r = await call('admin-translate', { id: c.id, translations: bad }, { headers: h });
    assert.equal(r.status, 400, JSON.stringify(bad));
  }
});

test('admin-link: replaces the old link, sets profile_link_sent_at, Vietnamese message', async () => {
  const c = seedCandidate();
  const oldHash = c.row.profile_token_hash;
  const r = await call('admin-link', { id: c.id }, { headers: adminToken('james@heritage-union.com') });
  assert.equal(r.status, 200);
  const row = fake.tables.candidates[0];
  assert.notEqual(row.profile_token_hash, oldHash);
  assert.ok(row.profile_link_sent_at);
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(r.body.message)[1];
  assert.equal(P.hashToken(tok), row.profile_token_hash);
  assert.match(r.body.message, /^Chào Lan,/);
  for (const s of ['xác nhận đây đúng là Zalo', 'khoảng 10 phút', 'miễn phí', 'RÚT', 'heritage-union.com/vi/withdraw', 'https://heritage-union.com/vi/ho-so#t=']) assert.ok(r.body.message.includes(s), s);
  assert.equal((await call('profile-get', { token: c.token })).status, 401, 'old link stops working');
  assert.equal((await call('profile-get', { token: tok })).status, 200);
});

test('admin-link: a woman who chose English gets an English message and the English form link', async () => {
  const c = seedCandidate({ preferred_language: 'en' });
  const r = await call('admin-link', { id: c.id }, { headers: adminToken('james@heritage-union.com') });
  assert.equal(r.status, 200);
  assert.equal(r.body.lang, 'en');
  assert.match(r.body.message, /^Hello Lan,/);
  for (const s of ['confirm this is your Zalo', 'about 10 minutes', 'completely free', 'WITHDRAW', 'heritage-union.com/withdraw', 'https://heritage-union.com/my-profile#t=']) assert.ok(r.body.message.includes(s), s);
  assert.ok(!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/.test(r.body.message), 'no Vietnamese in the English message');
});

test('admin-status: zalo confirm/undo; withdraw clears link, consents, photos; withdrawn rows locked', async () => {
  const c = seedCandidate({ consent_profile_sharing_at: '2026-11-01T00:00:00Z' });
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const path = c.id + '/' + crypto.randomUUID() + '.jpg';
  fake.addObject(path);
  fake.tables.candidate_profiles[0].photo_paths = [path];
  fake.tables.candidate_profiles[0].consent_photo_sharing_at = '2026-11-02T00:00:00Z';
  const h = adminToken('james@heritage-union.com');
  await call('admin-status', { id: c.id, action: 'zalo_confirm' }, { headers: h });
  assert.ok(fake.tables.candidates[0].zalo_confirmed_at);
  await call('admin-status', { id: c.id, action: 'zalo_unconfirm' }, { headers: h });
  assert.equal(fake.tables.candidates[0].zalo_confirmed_at, null);
  assert.equal((await call('admin-status', { id: c.id, action: 'rate' }, { headers: h })).status, 400);
  const r = await call('admin-status', { id: c.id, action: 'withdraw' }, { headers: h });
  assert.equal(r.status, 200);
  const row = fake.tables.candidates[0]; const prof = fake.tables.candidate_profiles[0];
  assert.equal(row.status, 'withdrawn');
  assert.equal(row.profile_token_hash, null);
  assert.equal(row.consent_profile_sharing_at, null);
  assert.equal(prof.consent_photo_sharing_at, null);
  assert.deepEqual(prof.photo_paths, []);
  assert.equal(fake.hasObject(path), false);
  assert.equal((await call('admin-status', { id: c.id, action: 'zalo_confirm' }, { headers: h })).status, 409);
});

test('admin-delete: wrong name refused; right name deletes photos, row and profile (cascade)', async () => {
  const c = seedCandidate();
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const path = c.id + '/' + crypto.randomUUID() + '.jpg';
  fake.addObject(path);
  const h = adminToken('james@heritage-union.com');
  let r = await call('admin-delete', { id: c.id, confirmName: 'Nguyễn' }, { headers: h });
  assert.equal(r.status, 400);
  assert.equal(fake.tables.candidates.length, 1);
  r = await call('admin-delete', { id: c.id, confirmName: ' lan ' }, { headers: h });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.candidates.length, 0);
  assert.equal(fake.tables.candidate_profiles.length, 0);
  assert.equal(fake.hasObject(path), false);
});

test('no rating, tag, score or notes fields exist in admin functions or the question set', () => {
  const fs = require('fs'); const path = require('path');
  const dir = path.join(__dirname, '..', '..', 'netlify', 'functions');
  const src = fs.readdirSync(dir).filter((f) => f.startsWith('admin-')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n')
    + fs.readFileSync(path.join(__dirname, '..', '..', 'admin', 'admin.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const w of [/\bnotes?\s*:/i, /\brating\b/i, /\bscore\b/i, /\btags?\s*:/i]) assert.ok(!w.test(code), String(w));
});
