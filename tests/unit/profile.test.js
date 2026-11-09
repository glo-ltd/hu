const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { fake, sentEmails, P, call, seedCandidate, FULL_ANSWERS } = require('../helpers/seed');

const PII = ['Nguyễn Thị Lan', 'Nguyễn', '1994-03-15', '0901234567', 'lan@example.com', 'iphash-should-never-leak'];
function assertNoPII(res) {
  for (const s of PII) assert.ok(!res.raw.includes(s), 'response leaks ' + s + ': ' + res.raw.slice(0, 200));
}

test.beforeEach(() => { fake.reset(); sentEmails.length = 0; P._resetRateLimits(); });

test('token: only the sha256 is stored, 43-char base64url, 60-day expiry', () => {
  const t = P.newProfileToken(Date.parse('2026-11-09T00:00:00Z'));
  assert.match(t.token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(t.hash, crypto.createHash('sha256').update(t.token).digest('hex'));
  assert.equal(t.expiresAt, '2027-01-08T00:00:00.000Z');
});

test('profile-get: valid link returns prefill and no personal data', async () => {
  const c = seedCandidate();
  const res = await call('profile-get', { token: c.token });
  assert.equal(res.status, 200);
  assert.equal(res.body.prefill.display_name, 'Lan');
  assert.equal(res.body.prefill.province, 'Đà Nẵng');
  assert.equal(res.body.prefill.about, c.row.about_text);
  assert.equal(typeof res.body.prefill.age, 'number');
  assert.equal(res.body.resumeStep, 1);
  assertNoPII(res);
});

test('profile-get: missing, malformed, unknown and expired tokens are rejected with Vietnamese messages', async () => {
  let res = await call('profile-get', {});
  assert.equal(res.status, 401);
  assert.match(res.body.error, /Đường link này không còn dùng được/);
  res = await call('profile-get', { token: 'short' });
  assert.equal(res.status, 401);
  res = await call('profile-get', { token: P.newProfileToken().token });
  assert.equal(res.status, 401);
  const c = seedCandidate({ profile_token_expires_at: new Date(Date.now() - 1000).toISOString() });
  res = await call('profile-get', { token: c.token });
  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'linkExpired');
  assert.match(res.body.error, /hết hạn/);
});

test('profile-get: withdrawn and deleted candidates are rejected', async () => {
  for (const status of ['withdrawn', 'deleted']) {
    const c = seedCandidate({ status });
    const res = await call('profile-get', { token: c.token });
    assert.equal(res.status, 401, status);
    assert.equal(res.body.code, 'linkInvalid');
  }
});

test('profile-get: GET is refused (token must never be in a URL)', async () => {
  const res = await call('profile-get', undefined, { method: 'GET' });
  assert.equal(res.status, 405);
});

test('profile-save: saves answers, moves new -> profile_in_progress, display_name goes to its column', async () => {
  const c = seedCandidate();
  const res = await call('profile-save', { token: c.token, answers: { display_name: 'Lan', occupation: '  Giáo viên  ', children: 2, children_live_with: 'yes' } });
  assert.equal(res.status, 200, res.raw);
  const prof = fake.tables.candidate_profiles[0];
  assert.equal(prof.display_name, 'Lan');
  assert.equal(prof.answers.display_name, undefined);
  assert.equal(prof.answers.occupation, 'Giáo viên');
  assert.equal(prof.questions_version, '2026-11-v1');
  assert.equal(fake.tables.candidates[0].status, 'profile_in_progress');
  // children -> 0 drops the follow-up question
  await call('profile-save', { token: c.token, answers: { children: 0 } });
  assert.equal(fake.tables.candidate_profiles[0].answers.children_live_with, undefined);
});

test('profile-save: keeps profile_complete status after submission', async () => {
  const c = seedCandidate({ status: 'profile_complete' });
  const res = await call('profile-save', { token: c.token, answers: { occupation: 'Kế toán' } });
  assert.equal(res.status, 200);
  assert.equal(fake.tables.candidates[0].status, 'profile_complete');
});

test('profile-save: validation rejects bad option, too long, unknown question, too many picks, out-of-range', async () => {
  const c = seedCandidate();
  const cases = [
    [{ education: 'phd' }, 'answerInvalid'],
    [{ province: 'Atlantis' }, 'answerInvalid'],
    [{ about: 'a'.repeat(1501) }, 'answerTooLong'],
    [{ partner_matters: 'a'.repeat(601) }, 'answerTooLong'],
    [{ display_name: 'a'.repeat(41) }, 'answerTooLong'],
    [{ income: 'high' }, 'answerInvalid'],
    [{ values: ['family', 'honesty', 'faith', 'kindness'] }, 'answerInvalid'],
    [{ values: ['money'] }, 'answerInvalid'],
    [{ children: 7 }, 'answerInvalid'],
    [{ children: 1.5 }, 'answerInvalid'],
    [{ partner_age_range: [17, 40] }, 'answerInvalid'],
    [{ partner_age_range: [50, 40] }, 'answerInvalid'],
    [{ occupation: { x: 1 } }, 'answerInvalid'],
  ];
  for (const [answers, code] of cases) {
    const res = await call('profile-save', { token: c.token, answers });
    assert.equal(res.status, 400, JSON.stringify(answers));
    assert.equal(res.body.code, code, JSON.stringify(answers));
    assert.match(res.body.error, /[ạảãáàâăêôơưđ]/, 'message is Vietnamese');
  }
  assert.equal(fake.tables.candidate_profiles.length, 0);
});

test('profile-save: required is not enforced until submit', async () => {
  const c = seedCandidate();
  const res = await call('profile-save', { token: c.token, answers: { occupation: 'Giáo viên' } });
  assert.equal(res.status, 200);
});

test('rate limit: more than 120 requests per hour from one link get 429', async () => {
  const c = seedCandidate();
  let last;
  for (let i = 0; i < 121; i++) last = await call('profile-get', { token: c.token });
  assert.equal(last.status, 429);
  assert.match(last.body.error, /quá nhiều/);
});

async function addPhoto(c) {
  const up = await call('profile-photo-upload-url', { token: c.token });
  assert.equal(up.status, 200, up.raw);
  assert.ok(up.body.path.startsWith(c.id + '/'));
  fake.addObject(up.body.path);
  const conf = await call('profile-photo-confirm', { token: c.token, path: up.body.path });
  assert.equal(conf.status, 200, conf.raw);
  return up.body.path;
}

test('photos: max 3, confirm needs an uploaded object in her own folder', async () => {
  const c = seedCandidate();
  const other = seedCandidate({ zalo_number: '0911111111' });
  await addPhoto(c); await addPhoto(c); await addPhoto(c);
  const fourth = await call('profile-photo-upload-url', { token: c.token });
  assert.equal(fourth.status, 400);
  assert.equal(fourth.body.code, 'tooManyPhotos');

  // Another candidate's folder, traversal, wrong extension: all refused
  const bad = [other.id + '/' + crypto.randomUUID() + '.jpg', c.id + '/../' + other.id + '/x.jpg', c.id + '/' + crypto.randomUUID() + '.png', 'x.jpg'];
  for (const p of bad) {
    fake.addObject(p);
    const r = await call('profile-photo-confirm', { token: other.token, path: p.startsWith(other.id) ? c.id + '/' + crypto.randomUUID() + '.jpg' : p });
    assert.equal(r.status, 400, p);
  }
  const notMine = await call('profile-photo-confirm', { token: c.token, path: other.id + '/' + crypto.randomUUID() + '.jpg' });
  assert.equal(notMine.status, 400);
  const notUploaded = await call('profile-photo-confirm', { token: other.token, path: other.id + '/' + crypto.randomUUID() + '.jpg' });
  assert.equal(notUploaded.status, 400);
  const prof = fake.tables.candidate_profiles.find((p) => p.candidate_id === c.id);
  assert.equal(prof.photo_paths.length, 3);
});

test('photos: a 4th confirmed path is refused and its object removed', async () => {
  const c = seedCandidate();
  await addPhoto(c); await addPhoto(c); await addPhoto(c);
  const p = c.id + '/' + crypto.randomUUID() + '.jpg';
  fake.addObject(p);
  const r = await call('profile-photo-confirm', { token: c.token, path: p });
  assert.equal(r.status, 400);
  assert.equal(fake.hasObject(p), false);
});

test('photos: reorder must be a permutation; delete removes from storage', async () => {
  const c = seedCandidate();
  const a = await addPhoto(c); const b = await addPhoto(c);
  let r = await call('profile-photo-order', { token: c.token, paths: [b, a] });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.photos.map((x) => x.path), [b, a]);
  r = await call('profile-photo-order', { token: c.token, paths: [b, b] });
  assert.equal(r.status, 400);
  r = await call('profile-photo-order', { token: c.token, paths: [b] });
  assert.equal(r.status, 400);
  r = await call('profile-photo-delete', { token: c.token, path: a });
  assert.equal(r.status, 200);
  assert.equal(fake.hasObject(a), false);
  assert.deepEqual(r.body.photos.map((x) => x.path), [b]);
  assert.ok(r.body.photos[0].url);
});

test('submit: refuses without confirmTrue or with required answers missing', async () => {
  const c = seedCandidate();
  await call('profile-save', { token: c.token, answers: { display_name: 'Lan' } });
  let r = await call('profile-submit', { token: c.token, consents: { confirmTrue: false } });
  assert.equal(r.status, 400);
  assert.equal(r.body.code, 'confirmTrue');
  r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true } });
  assert.equal(r.status, 400);
  assert.equal(r.body.code, 'answerRequired');
  assert.equal(r.body.step, 1);
  // children > 0 makes "live with you" required
  await call('profile-save', { token: c.token, answers: Object.assign({}, FULL_ANSWERS, { children: 2 }) });
  r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true } });
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'children_live_with');
});

test('submit: photos without photo consent are deleted; status, timestamps, version, team email', async () => {
  const c = seedCandidate();
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const p1 = await addPhoto(c);
  const stray = c.id + '/' + crypto.randomUUID() + '.jpg'; // uploaded but never confirmed
  fake.addObject(stray);
  const r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true, profileSharing: true, photoSharing: false } });
  assert.equal(r.status, 200, r.raw);
  assertNoPII(r);
  const prof = fake.tables.candidate_profiles[0];
  const cand = fake.tables.candidates[0];
  assert.deepEqual(prof.photo_paths, []);
  assert.equal(fake.hasObject(p1), false);
  assert.equal(fake.hasObject(stray), false);
  assert.equal(prof.consent_photo_sharing_at, null);
  assert.ok(prof.submitted_at && prof.confirmed_true_at);
  assert.equal(prof.consent_profile_text_version, 'vi-2026-11-profile-v1');
  assert.equal(cand.status, 'profile_complete');
  assert.ok(cand.consent_profile_sharing_at);
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].subject, 'Candidate profile submitted (#' + c.id + ')');
  assert.ok(sentEmails[0].html.includes('/admin/#' + c.id));
  for (const s of PII.concat(['Lan', 'Giáo viên', 'Đà Nẵng'])) assert.ok(!JSON.stringify(sentEmails[0]).includes(s), 'email leaks ' + s);
});

test('submit: with photo consent photos are kept; unticking sharing sets consent_profile_sharing_at to null', async () => {
  const c = seedCandidate({ consent_profile_sharing_at: '2026-11-01T00:00:00Z' });
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const p1 = await addPhoto(c);
  let r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true, profileSharing: true, photoSharing: true } });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.candidates[0].consent_profile_sharing_at, '2026-11-01T00:00:00Z', 'original consent time kept');
  assert.ok(fake.tables.candidate_profiles[0].consent_photo_sharing_at);
  assert.ok(fake.hasObject(p1));
  assert.equal(r.body.consents.profileSharing, true);
  r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true, profileSharing: false, photoSharing: true } });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.candidates[0].consent_profile_sharing_at, null);
  assert.equal(r.body.consents.profileSharing, false);
  assert.equal(r.body.resumeStep, 6);
  assert.match(sentEmails[1].subject, /updated/);
});

test('submit: photoSharing true with no photos stores no photo consent', async () => {
  const c = seedCandidate();
  await call('profile-save', { token: c.token, answers: FULL_ANSWERS });
  const r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true, photoSharing: true } });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.candidate_profiles[0].consent_photo_sharing_at, null);
});

test('resume step: first incomplete step, then photos, then review', () => {
  assert.equal(P.resumeStep(null), 1);
  const answers = Object.assign({}, FULL_ANSWERS); const dn = answers.display_name; delete answers.display_name;
  assert.equal(P.resumeStep({ answers, display_name: dn, photo_paths: [] }), 5);
  assert.equal(P.resumeStep({ answers, display_name: dn, photo_paths: ['x'] }), 6);
  const partial = Object.assign({}, answers); delete partial.smoking;
  assert.equal(P.resumeStep({ answers: partial, display_name: dn, photo_paths: [] }), 2);
  assert.equal(P.stepsComplete({ answers: partial, display_name: dn }), 1);
  assert.equal(P.stepsComplete({ answers, display_name: dn }), 4);
});

test('question set: province list matches registration; nothing sensitive asked', () => {
  const fs = require('fs');
  const reg = fs.readFileSync(require.resolve('../../netlify/functions/candidate-register.js'), 'utf8');
  const list = JSON.parse(reg.match(/const VALID_PROVINCES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"').replace(/,\s*\]/, ']'));
  const prov = P.QUESTION_BY_ID.province.options.map((o) => o.value);
  assert.deepEqual(prov, list.filter((x) => x !== 'Other'));
  const ids = P.QUESTIONS.questions.map((q) => q.id).join(' ');
  for (const banned of ['income', 'salary', 'health', 'ethnic', 'politic', 'weight', 'height', 'measure', 'id_number', 'cccd', 'sex']) {
    assert.ok(!ids.includes(banned), banned);
  }
  assert.equal(P.QUESTIONS.version, '2026-11-v1');
  for (const q of P.QUESTIONS.questions) {
    assert.ok(q.label.vi && q.label.en, q.id);
    assert.ok(['text', 'textarea', 'single', 'multi', 'number', 'range'].includes(q.type));
    (q.options || []).forEach((o) => assert.ok(o.label.vi && o.label.en, q.id + ':' + o.value));
  }
});

test('finance questions: Q15 required, Q16 optional, choices only (no amounts)', async () => {
  const q15 = P.QUESTION_BY_ID.household_finances, q16 = P.QUESTION_BY_ID.supports_family;
  assert.equal(q15.required, true); assert.equal(q16.required, false);
  assert.equal(q15.type, 'single'); assert.equal(q16.type, 'single');
  assert.equal(P.QUESTION_BY_ID.open_to_us, undefined);
  assert.equal(P.QUESTION_BY_ID.open_to_abroad.label.vi, 'Bạn có sẵn sàng sống ở nước ngoài không?');
  const order = P.QUESTIONS.questions.filter((q) => q.step === 3).map((q) => q.id);
  assert.deepEqual(order.slice(0, 3), ['open_to_abroad', 'household_finances', 'supports_family']);
  const c = seedCandidate();
  const noQ15 = Object.assign({}, FULL_ANSWERS); delete noQ15.household_finances;
  await call('profile-save', { token: c.token, answers: noQ15 });
  let r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true } });
  assert.equal(r.status, 400); assert.equal(r.body.field, 'household_finances');
  r = await call('profile-save', { token: c.token, answers: { supports_family: '5 triệu/tháng' } });
  assert.equal(r.status, 400);
  await call('profile-save', { token: c.token, answers: { household_finances: 'both_contribute' } });
  r = await call('profile-submit', { token: c.token, consents: { confirmTrue: true } });
  assert.equal(r.status, 200, 'Q16 may be left blank');
});

test('candidate-facing text never mentions the United States', () => {
  const fs = require('fs');
  const files = ['assets/data/profile-questions.json', 'vi/ho-so.html', 'assets/js/profile.js', 'netlify/shared/candidate-common.js',
    'netlify/functions/admin-link.js', 'netlify/functions/candidate-register.js', 'vi/thank-you-registration.html', 'thank-you-registration.html'];
  for (const f of files) {
    const s = fs.readFileSync(require('path').join(__dirname, '..', '..', f), 'utf8');
    for (const w of ['Hoa Kỳ', 'nước Mỹ', 'United States', ' USA', 'Mỹ ']) assert.ok(!s.includes(w), f + ' mentions ' + w);
  }
});
