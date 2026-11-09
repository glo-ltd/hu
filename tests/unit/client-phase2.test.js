const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const S = require('../helpers/client-seed');
const { fake, sentEmails, call, adminToken, CC, activeClient, seedWoman, CLIENT_PROFILE, JPG, isoDaysAgo } = S;
const P = require('../../netlify/shared/profile-common');
const CP = require('../../netlify/shared/client-profile');

const H = () => adminToken('james@heritage-union.com');

test.beforeEach(() => {
  fake.reset(); sentEmails.length = 0; P._resetRateLimits();
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
});

async function completeProfile(c) {
  let r = await call('client-profile-save', { token: c.token, answers: CLIENT_PROFILE });
  assert.equal(r.status, 200, r.raw);
  const up = await call('client-photo-upload-url', { token: c.token });
  fake.addObject(up.body.path, JPG, 'client-documents');
  r = await call('client-photo-update', { token: c.token, op: 'confirm', path: up.body.path });
  assert.equal(r.status, 200, r.raw);
  r = await call('client-profile-submit', { token: c.token });
  assert.equal(r.status, 200, r.raw);
}

async function approvedClient(over) {
  const c = activeClient(over);
  await completeProfile(c);
  const p = fake.tables.client_profiles.find((x) => x.client_id === c.id);
  Object.assign(p, { summary_html: '<p>Summary</p>', summary_sent_at: isoDaysAgo(1), summary_approved_at: isoDaysAgo(1) });
  return c;
}

// ------------------------------------------------------------------ F4
test('F4: only after payment; prefill from application; validation mirrors the women\'s rules; message lives in its own column', async () => {
  const pending = S.seedClient({ status: 'invoiced', email: 'p@x.com' });
  assert.equal((await call('client-profile-save', { token: pending.token, answers: { country: 'UK' } })).body.code, 'notActive');
  const c = activeClient();
  const g = await call('client-get', { token: c.token });
  assert.equal(g.body.engagement.profile.prefill.display_name, 'Michael');
  assert.equal(g.body.engagement.profile.prefill.marital_history, 'divorced');
  for (const bad of [{ education: 'phd' }, { values: ['family', 'honesty', 'faith', 'kindness'] }, { her_age_range: [17, 40] }, { her_age_range: [50, 40] },
    { must_languages: [{ language: 'klingon', level: 'basic' }] }, { message: 'x'.repeat(501) }, { her_weight: 50 }, { looks: 'slim' }]) {
    const r = await call('client-profile-save', { token: c.token, answers: bad });
    assert.equal(r.status, 400, JSON.stringify(bad));
  }
  await call('client-profile-save', { token: c.token, answers: { message: 'Hello', display_name: 'Mike' } });
  const p = fake.tables.client_profiles[0];
  assert.equal(p.message_to_women, 'Hello');
  assert.equal(p.display_name, 'Mike');
  assert.equal(p.answers.message, undefined);
});

test('F4 question set: no questions about her appearance, height, weight or body; options match hers', () => {
  const ids = CP.PQ.questions.map((q) => q.id + ' ' + q.label).join(' ').toLowerCase();
  for (const w of ['height', 'weight', 'body', 'appearance', 'slim', 'tall', 'pretty', 'beautiful']) {
    assert.ok(!new RegExp('\\b' + w + '\\b').test(ids.replace('not appearance', '')), w);
  }
  const hers = (id) => P.QUESTION_BY_ID[id].options.map((o) => o.value);
  for (const id of ['education', 'wants_children', 'religion', 'smoking', 'drinking', 'values', 'household_finances']) {
    assert.deepEqual(CP.PQ_BY_ID[id].options.map((o) => o.value), hers(id), id);
  }
});

test('F4 photos: own folder, max 3, real JPEG, reorder; submit needs every required answer and a photo; locked after', async () => {
  const c = activeClient();
  const other = activeClient({ email: 'o@x.com' });
  let r = await call('client-profile-submit', { token: c.token });
  assert.equal(r.body.code, 'incomplete');
  await call('client-profile-save', { token: c.token, answers: CLIENT_PROFILE });
  r = await call('client-profile-submit', { token: c.token });
  assert.equal(r.body.field, 'photos');
  const paths = [];
  for (let i = 0; i < 3; i++) {
    const up = await call('client-photo-upload-url', { token: c.token });
    assert.ok(up.body.path.startsWith(c.id + '/photos/'));
    fake.addObject(up.body.path, JPG, 'client-documents');
    r = await call('client-photo-update', { token: c.token, op: 'confirm', path: up.body.path });
    assert.equal(r.status, 200);
    paths.push(up.body.path);
  }
  assert.equal((await call('client-photo-upload-url', { token: c.token })).body.code, 'tooManyPhotos');
  const foreign = other.id + '/photos/' + crypto.randomUUID() + '.jpg';
  fake.addObject(foreign, JPG, 'client-documents');
  assert.equal((await call('client-photo-update', { token: c.token, op: 'confirm', path: foreign })).status, 400);
  r = await call('client-photo-update', { token: c.token, op: 'order', paths: [paths[2], paths[0], paths[1]] });
  assert.equal(r.body.photos[0].path, paths[2]);
  r = await call('client-photo-update', { token: c.token, op: 'delete', path: paths[1] });
  assert.equal(fake.hasObject(paths[1], 'client-documents'), false);
  r = await call('client-profile-submit', { token: c.token });
  assert.equal(r.status, 200, r.raw);
  assert.ok(sentEmails.some((m) => /Client profile ready for a summary \(C-/.test(m.subject)));
  assert.equal((await call('client-profile-save', { token: c.token, answers: { city: 'Bath' } })).body.code, 'locked');
});

// ------------------------------------------------------------------ summary
test('summary: sanitised; R9 with a new link; he approves (R10) or asks for changes; team can\'t edit his answers', async () => {
  const c = activeClient();
  await completeProfile(c);
  const before = JSON.stringify(fake.tables.client_profiles[0].answers);
  let r = await call('admin-client-profile', { id: c.id, op: 'summary_save', html: '<p onclick="x()">Michael is <b>kind</b>.<script>alert(1)</script><img src=x onerror=y></p><a href="http://evil">link</a>' }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  const html = fake.tables.client_profiles[0].summary_html;
  assert.equal(html, '<p>Michael is <strong>kind</strong>.</p>link');
  r = await call('admin-client-profile', { id: c.id, op: 'summary_send' }, { headers: H() });
  assert.equal(r.status, 200);
  const r9 = sentEmails.filter((m) => /ready to approve/.test(m.subject)).pop();
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(r9.text)[1];
  assert.equal((await call('client-get', { token: c.token })).status, 401, 'old link replaced');
  const g = await call('client-get', { token: tok });
  assert.equal(g.body.engagement.summary.html, html);
  r = await call('client-summary-respond', { token: tok, decision: 'changes', comment: '' });
  assert.equal(r.body.code, 'comment');
  r = await call('client-summary-respond', { token: tok, decision: 'changes', comment: 'Please mention my daughter.' });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.client_profiles[0].summary_sent_at, null);
  assert.ok(sentEmails.some((m) => /asked for changes/.test(m.subject)));
  await call('admin-client-profile', { id: c.id, op: 'summary_send' }, { headers: H() });
  const tok2 = /#t=([A-Za-z0-9_-]{43})/.exec(sentEmails.filter((m) => /ready to approve/.test(m.subject)).pop().text)[1];
  r = await call('client-summary-respond', { token: tok2, decision: 'approve' });
  assert.equal(r.status, 200);
  assert.ok(fake.tables.client_profiles[0].summary_approved_at);
  assert.ok(sentEmails.some((m) => /your profile is approved/.test(m.subject) && /2–4 weeks/.test(m.text)));
  assert.equal(JSON.stringify(fake.tables.client_profiles[0].answers), before, 'his answers untouched');
});

test('translations: summary, declaration items and message stored with who and when; unknown declaration ids refused', async () => {
  const c = activeClient();
  await completeProfile(c);
  const h = adminToken('huyen@heritage-union.com');
  let r = await call('admin-client-profile', { id: c.id, op: 'translate', summaryVi: '<p>Michael là kỹ sư.</p>', declarationVi: { conviction: 'Không' }, messageVi: 'Xin chào' }, { headers: h });
  assert.equal(r.status, 200, r.raw);
  const p = fake.tables.client_profiles[0];
  assert.equal(p.summary_vi_html, '<p>Michael là kỹ sư.</p>');
  assert.equal(p.declaration_vi.conviction, 'Không');
  assert.equal(p.message_vi, 'Xin chào');
  assert.equal(p.translated_by, 'huyen@heritage-union.com');
  r = await call('admin-client-profile', { id: c.id, op: 'translate', declarationVi: { notes_about_her: 'x' } }, { headers: h });
  assert.equal(r.status, 400);
});

// ------------------------------------------------------------------ matching
test('matching: only consenting, complete, not-withdrawn women; ticks from her own answers; no scores', async () => {
  const c = await approvedClient();
  const good = seedWoman();
  seedWoman({ consent_profile_sharing_at: null, zalo_number: '0911111111' });
  seedWoman({ status: 'withdrawn', zalo_number: '0922222222' });
  seedWoman({ status: 'profile_in_progress', zalo_number: '0933333333' });
  const stays = seedWoman({ zalo_number: '0944444444' }, { answers: Object.assign({}, good.prof.answers, { open_to_abroad: 'prefer_vietnam', children: 2, children_live_with: 'yes', education: 'secondary', english_level: 'none', partner_age_range: [25, 40] }) });
  const r = await call('admin-matching', { id: c.id }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  assert.deepEqual(r.body.women.map((w) => w.id).sort(), [good.id, stays.id].sort());
  const g = r.body.women.find((w) => w.id === good.id);
  assert.equal(g.matchesAll, true);
  assert.equal(g.ticks, 5);
  const s = r.body.women.find((w) => w.id === stays.id);
  assert.deepEqual(Object.keys(s.checks).filter((k) => !s.checks[k].ok).sort(), ['abroad', 'age', 'children', 'education', 'language']);
  for (const w of r.body.women) assert.ok(!('score' in w) && !('rating' in w));
  assert.ok(!r.raw.includes('0912345678') && !r.raw.includes('hoa@example.vn') && !r.raw.includes('Trần'), 'no private fields of hers on the matching screen');
});

test('matching ticks: language via other languages; open to Vietnam skips the abroad check; any children', () => {
  const client = { application: { date_of_birth: '1978-04-02' } };
  const cand = { date_of_birth: '1990-01-01' };
  const prof = { answers: Object.assign({}, CLIENT_PROFILE, { where_live: 'open_vietnam', children_accepted: 'any', min_education: 'any', must_languages: [{ language: 'french', level: 'fluent' }], her_age_range: [30, 45] }) };
  const her = { answers: { partner_age_range: [40, 60], open_to_abroad: 'prefer_vietnam', children: 3, english_level: 'none', other_languages: [{ language: 'french', level: 'fluent' }] } };
  const t = CP.ticks(client, prof, cand, her);
  assert.equal(t.all, true, JSON.stringify(t.checks));
  her.answers.other_languages = [{ language: 'french', level: 'basic' }];
  assert.equal(CP.ticks(client, prof, cand, her).checks.language.ok, false);
});

test('shortlist: max 20, needs his approval and her translations, R11 with a 30-day review link', async () => {
  const c = activeClient();
  await completeProfile(c);
  const w1 = seedWoman();
  const w2 = seedWoman({ zalo_number: '0955555555' }, { translations: {} });
  let r = await call('admin-shortlist-send', { id: c.id, candidateIds: [w1.id] }, { headers: H() });
  assert.equal(r.status, 409, 'not before he approves his summary');
  Object.assign(fake.tables.client_profiles[0], { summary_html: '<p>x</p>', summary_approved_at: isoDaysAgo(1) });
  r = await call('admin-shortlist-send', { id: c.id, candidateIds: [w1.id, w2.id] }, { headers: H() });
  assert.equal(r.status, 409); assert.match(r.body.error, /translation/);
  r = await call('admin-shortlist-send', { id: c.id, candidateIds: new Array(21).fill(0).map(() => crypto.randomUUID()) }, { headers: H() });
  assert.equal(r.status, 400);
  r = await call('admin-shortlist-send', { id: c.id, candidateIds: [w1.id] }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  const row = fake.tables.clients.find((x) => x.id === c.id);
  assert.ok(row.shortlist_sent_at);
  const days = (Date.parse(row.access_token_expires_at) - Date.now()) / 86400000;
  assert.ok(days > 29.9 && days <= 30);
  assert.ok(sentEmails.some((m) => /Your profiles are ready/.test(m.subject)));
});

// ------------------------------------------------------------------ F5
async function shortlisted() {
  const c = await approvedClient();
  const women = [seedWoman(), seedWoman({ zalo_number: '0966666666' }, { consent_photo_sharing_at: null }), seedWoman({ zalo_number: '0977777777', preferred_language: 'en' }, { translations: {}, answers: Object.assign({}, seedWoman.base || {}, { province: 'Đà Nẵng', occupation: 'Nurse', partner_age_range: [35, 55], open_to_abroad: 'yes', children: 0, education: 'college', english_level: 'fluent' }) })];
  const r = await call('admin-shortlist-send', { id: c.id, candidateIds: women.map((w) => w.id) }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(sentEmails.filter((m) => /Your profiles are ready/.test(m.subject)).pop().text)[1];
  return { c, women, tok };
}

test('F5 cards: only consented fields, photos only with photo consent, translations instead of her Vietnamese text; never private fields', async () => {
  const { women, tok } = await shortlisted();
  const r = await call('client-review-get', { token: tok });
  assert.equal(r.status, 200, r.raw);
  assert.equal(r.body.cards.length, 3);
  const a = r.body.cards.find((x) => x.id === women[0].id);
  assert.equal(a.displayName, 'Hoa'); assert.equal(a.age, P.ageFrom('1988-05-01')); assert.equal(a.province, 'Huế');
  assert.equal(a.photos.length, 1);
  const occ = a.items.find((i) => i.id === 'occupation');
  assert.equal(occ.text, 'Teacher', 'translation shown, not her Vietnamese');
  assert.ok(!r.raw.includes('Giáo viên') && !r.raw.includes('Sự trung thực'));
  assert.equal(r.body.cards.find((x) => x.id === women[1].id).photos.length, 0, 'no photo consent, no photos');
  assert.equal(r.body.cards.find((x) => x.id === women[2].id).items.find((i) => i.id === 'occupation').text, 'Nurse', 'she wrote in English');
  for (const s of ['Trần', '1988-05-01', '0912345678', 'hoa@example.vn', 'woman-iphash', 'zalo', 'date_of_birth', 'full_name', 'email']) assert.ok(!r.raw.includes(s), 'leaks ' + s);
  assert.ok(r.body.viewer.includes('Thompson'), 'watermark uses his own name');
});

test('F5: a woman who withdraws or removes consent disappears from his list', async () => {
  const { women, tok } = await shortlisted();
  fake.tables.candidates.find((x) => x.id === women[0].id).status = 'withdrawn';
  fake.tables.candidates.find((x) => x.id === women[1].id).consent_profile_sharing_at = null;
  const r = await call('client-review-get', { token: tok });
  assert.deepEqual(r.body.cards.map((x) => x.id), [women[2].id]);
});

test('F5 choices: 1 to 5, distinct, from his list only, eligible; R12 and team email; can\'t change afterwards', async () => {
  const { c, women, tok } = await shortlisted();
  const stranger = seedWoman({ zalo_number: '0988888888' });
  assert.equal((await call('client-choices-submit', { token: tok, candidateIds: [] })).status, 400);
  assert.equal((await call('client-choices-submit', { token: tok, candidateIds: [women[0].id, women[0].id] })).status, 400);
  assert.equal((await call('client-choices-submit', { token: tok, candidateIds: [stranger.id] })).body.code, 'notOnList');
  fake.tables.candidates.find((x) => x.id === women[1].id).status = 'withdrawn';
  assert.equal((await call('client-choices-submit', { token: tok, candidateIds: [women[1].id] })).body.code, 'unavailable');
  const r = await call('client-choices-submit', { token: tok, candidateIds: [women[2].id, women[0].id] });
  assert.equal(r.status, 200, r.raw);
  const ch = fake.tables.client_choices.filter((x) => x.client_id === c.id).sort((a, b) => a.rank - b.rank);
  assert.deepEqual(ch.map((x) => [x.candidate_id, x.rank]), [[women[2].id, 1], [women[0].id, 2]]);
  assert.ok(sentEmails.some((m) => /Your choices are received/.test(m.subject)));
  assert.ok(sentEmails.some((m) => /Client sent his choices \(C-/.test(m.subject)));
  assert.equal((await call('client-choices-submit', { token: tok, candidateIds: [women[0].id] })).body.code, 'locked');
  assert.equal((await call('admin-shortlist-send', { id: c.id, candidateIds: [women[0].id] }, { headers: H() })).status, 409);
});

test('one client\'s review link never shows another client\'s list', async () => {
  const { tok } = await shortlisted();
  const other = await approvedClient({ email: 'other@x.com' });
  const r = await call('client-review-get', { token: other.token });
  assert.equal(r.body.code, 'noShortlist');
  assert.equal((await call('client-review-get', { token: tok })).status, 200);
});

test('phase 2 admin endpoints reject missing, expired and non-team tokens', async () => {
  const id = crypto.randomUUID();
  for (const [name, body] of [['admin-client-profile', { id, op: 'summary_send' }], ['admin-matching', { id }], ['admin-shortlist-send', { id, candidateIds: [id] }]]) {
    assert.equal((await call(name, body, { headers: {} })).status, 401, name);
    assert.equal((await call(name, body, { headers: adminToken('james@heritage-union.com', { expiresAt: Date.now() - 1 }) })).status, 401, name);
    assert.equal((await call(name, body, { headers: adminToken('nobody@example.com') })).status, 403, name);
  }
  assert.equal(fake.calls.length, 0);
});

test('phase 2 team emails carry no personal data', async () => {
  await shortlisted();
  for (const m of sentEmails.filter((e) => Array.isArray(e.to))) {
    for (const s of ['Michael', 'Thompson', 'Hoa', 'example']) assert.ok(!(m.subject + m.text).includes(s), m.subject + ' leaks ' + s);
  }
});
