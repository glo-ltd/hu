const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const S = require('../helpers/client-seed');
const { fake, sentEmails, call, adminToken, activeClient, seedWoman, isoDaysAgo, APPLICATION } = S;
const P = require('../../netlify/shared/profile-common');
const I = require('../../netlify/shared/introductions');

const H = () => adminToken('james@heritage-union.com');
const tokenOf = (text) => /#t=([A-Za-z0-9_-]{43})/.exec(text)[1];

test.beforeEach(() => { fake.reset(); sentEmails.length = 0; P._resetRateLimits(); process.env.CLIENT_SIGNUPS_OPEN = 'true'; });

// A client whose profile is approved and translated, with a shortlist.
function readyClient(over, women) {
  const c = activeClient(Object.assign({ id_checked_at: isoDaysAgo(20), certificate_checked_at: isoDaysAgo(20), shortlist_sent_at: isoDaysAgo(3),
    declaration: Object.assign({}, S.DECLARATION, { conviction: 'yes', conviction_details: 'Speeding, UK, 2001' }) }, over || {}));
  fake.tables.client_profiles.push({ client_id: c.id, questions_version: 'x', display_name: 'Michael', photo_paths: [], answers: { country: 'United Kingdom', city: 'Bristol' },
    message_to_women: 'Hello, I hope to meet you.', submitted_at: isoDaysAgo(9), summary_html: '<p>Michael is kind.</p>', summary_approved_at: isoDaysAgo(8),
    summary_vi_html: '<p>Michael là người tốt bụng.</p>', message_vi: 'Xin chào, mong được gặp bạn.',
    declaration_vi: { conviction_details: 'Chạy quá tốc độ, Anh, 2001', previous_marriages_details: '2003 đến 2014, đã ly hôn.', countries_lived: 'Vương quốc Anh', certificate_country: 'Vương quốc Anh' } });
  (women || []).forEach((w) => fake.tables.client_shortlists.push({ client_id: c.id, candidate_id: w.id, added_by: 'x', sent_at: isoDaysAgo(3) }));
  return c;
}

async function choose(c, ids) {
  const r = await call('client-choices-submit', { token: c.token, candidateIds: ids });
  assert.equal(r.status, 200, r.raw);
  return fake.tables.introductions.filter((x) => x.client_id === c.id).sort((a, b) => a.rank - b.rank);
}

async function send(c, intro) {
  const r = await call('admin-intro', { id: c.id, op: 'send', introId: intro.id }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  return { r, token: tokenOf(r.body.zalo) };
}

test('choices create one request each, in his order; a woman with an open request elsewhere queues', async () => {
  const w1 = seedWoman(); const w2 = seedWoman({ zalo_number: '0911111111' });
  const other = readyClient({ email: 'other@x.com' }, [w1]);
  const oi = await choose(other, [w1.id]);
  await send(other, oi[0]);
  const c = readyClient({}, [w1, w2]);
  const intros = await choose(c, [w2.id, w1.id]);
  assert.deepEqual(intros.map((x) => [x.candidate_id, x.rank, x.status]), [[w2.id, 1, 'ready'], [w1.id, 2, 'queued']]);
  const r = await call('admin-intro', { id: c.id, op: 'send', introId: intros[1].id }, { headers: H() });
  assert.equal(r.status, 409, 'queued can\'t be sent');
});

test('Send to her: needs her-language translations; makes a 30-day decision link; R13 in her language by email and Zalo', async () => {
  const w = seedWoman();
  const c = readyClient({}, [w]);
  const [intro] = await choose(c, [w.id]);
  const prof = fake.tables.client_profiles.find((x) => x.client_id === c.id);
  const saved = prof.declaration_vi;
  prof.declaration_vi = {};
  let r = await call('admin-intro', { id: c.id, op: 'send', introId: intro.id }, { headers: H() });
  assert.equal(r.status, 409); assert.match(r.body.error, /translations/);
  prof.declaration_vi = saved;
  const { r: ok, token } = await send(c, intro);
  assert.equal(ok.body.lang, 'vi');
  assert.match(ok.body.zalo, /^Chào Hoa,/);
  assert.ok(ok.body.zalo.includes('https://heritage-union.com/vi/gioi-thieu#t='));
  assert.ok(sentEmails.some((m) => m.to === 'hoa@example.vn' && /mong được làm quen/.test(m.subject)));
  const row = fake.tables.introductions.find((x) => x.id === intro.id);
  assert.equal(row.status, 'sent');
  assert.equal(row.decision_token_hash, P.hashToken(token));
  const days = (Date.parse(row.decision_token_expires_at) - Date.now()) / 86400000;
  assert.ok(days > 29.9 && days <= 30);
  // An English-speaking woman gets English, from the English texts
  const we = seedWoman({ zalo_number: '0922222222', preferred_language: 'en', email: null });
  const c2 = readyClient({ email: 'c2@x.com' }, [we]);
  fake.tables.client_profiles.find((x) => x.client_id === c2.id).summary_vi_html = null;
  const [i2] = await choose(c2, [we.id]);
  const s2 = await send(c2, i2);
  assert.match(s2.r.body.zalo, /^Dear Hoa,/);
  assert.ok(s2.r.body.zalo.includes('/introduction#t='));
  assert.equal(s2.r.body.emailed, false, 'no email address: Zalo only');
});

test('her decision link works only for that one request; shows him in her language without his private details', async () => {
  const w = seedWoman(); const w2 = seedWoman({ zalo_number: '0933333333' });
  const c = readyClient({}, [w, w2]);
  const intros = await choose(c, [w.id, w2.id]);
  const { token } = await send(c, intros[0]);
  const { token: t2 } = await send(c, intros[1]);
  const r = await call('intro-get', { token });
  assert.equal(r.status, 200, r.raw);
  assert.equal(r.body.lang, 'vi');
  assert.equal(r.body.him.firstName, 'Michael');
  assert.equal(r.body.him.summaryHtml, '<p>Michael là người tốt bụng.</p>');
  assert.equal(r.body.him.message, 'Xin chào, mong được gặp bạn.');
  const conv = r.body.him.declaration.find((x) => x.id === 'conviction');
  assert.equal(conv.text, 'Có'); assert.equal(conv.flag, true);
  assert.equal(r.body.him.declaration.find((x) => x.id === 'conviction_details').text, 'Chạy quá tốc độ, Anh, 2001');
  assert.ok(r.body.him.checked.id && r.body.him.checked.certificate);
  assert.equal(r.body.prefill.zalo, '0912345678', 'her own details, to pre-fill her form');
  for (const s of ['Thompson', APPLICATION.date_of_birth, 'michael@example.com', '+44 7700', 'Rose Lane', 'client-iphash', 'access_token']) assert.ok(!r.raw.includes(s), 'leaks ' + s);
  assert.equal(fake.tables.introductions.find((x) => x.id === intros[0].id).status, 'opened');
  assert.equal(fake.tables.introductions.find((x) => x.id === intros[1].id).status, 'sent', 'opening one request touches nothing else');
  // her token can't decide on the other request
  await call('intro-decide', { token, decision: 'decline' });
  assert.equal(fake.tables.introductions.find((x) => x.id === intros[1].id).status, 'sent');
  assert.equal((await call('intro-get', { token: t2 })).body.status, 'opened');
  // her profile token is not a decision token
  assert.equal((await call('intro-get', { token: w.token })).status, 401);
});

test('expired, unknown, cancelled and withdrawn', async () => {
  const w = seedWoman();
  const c = readyClient({}, [w]);
  const [intro] = await choose(c, [w.id]);
  const { token } = await send(c, intro);
  assert.equal((await call('intro-get', { token: crypto.randomBytes(32).toString('base64url') })).status, 401);
  fake.tables.introductions[0].decision_token_expires_at = isoDaysAgo(1);
  let r = await call('intro-get', { token });
  assert.equal(r.body.code, 'expired');
  assert.match(r.body.error, /hết hạn/);
  fake.tables.introductions[0].decision_token_expires_at = new Date(Date.now() + 86400000).toISOString();
  // she withdraws: the request is cancelled, her link stops, he sees "no longer available"
  await call('withdraw-candidate', { contact: '0912345678', lang: 'vi' });
  assert.equal(fake.tables.introductions[0].status, 'cancelled');
  assert.equal(fake.tables.introductions[0].cancel_reason, 'withdrawn');
  assert.equal((await call('intro-get', { token })).status, 401);
  r = await call('client-get', { token: c.token });
  assert.equal(r.body.engagement.introductions[0].status, 'unavailable');
  assert.ok(!r.raw.includes('withdrawn'), 'he is never told why');
});

test('saying yes: validation, stored consent (only what she chose), wording version, IP hash; her queue moves on; nothing reaches him yet', async () => {
  const w = seedWoman();
  const c = readyClient({}, [w]);
  const c2 = readyClient({ email: 'c2@x.com' }, [w]);
  const [intro] = await choose(c, [w.id]);
  const [queued] = await choose(c2, [w.id]);
  assert.equal(queued.status, 'queued');
  const { token } = await send(c, intro);
  const base = { token, decision: 'accept', share: { zalo: '0912 345 678' }, contact: ['messages'], agree: true, typedName: 'Hoa' };
  for (const [over, field] of [[{ share: {} }, 'share'], [{ contact: [] }, 'contact'], [{ agree: false }, 'agree'], [{ typedName: '' }, 'typedName'], [{ share: { email: 'bad' } }, 'email']]) {
    const r = await call('intro-decide', Object.assign({}, base, over));
    assert.equal(r.status, 400, JSON.stringify(over)); assert.equal(r.body.field, field);
  }
  sentEmails.length = 0;
  const r = await call('intro-decide', base, { headers: { 'x-nf-client-connection-ip': '198.51.100.7' } });
  assert.equal(r.status, 200, r.raw);
  const row = fake.tables.introductions.find((x) => x.id === intro.id);
  assert.equal(row.status, 'accepted');
  assert.deepEqual(row.consent, { zalo: '0912 345 678', contact: ['messages'] });
  assert.equal(row.consent_text_version, 'vi-2026-12-introduction-v1');
  assert.equal(row.consent_ip_hash, crypto.createHash('sha256').update('198.51.100.7').digest('hex'));
  assert.equal(fake.tables.introductions.find((x) => x.id === queued.id).status, 'ready', 'her next request is released');
  assert.ok(!sentEmails.some((m) => m.to === 'michael@example.com'), 'he hears nothing until the team introduces');
  const g = await call('client-get', { token: c.token });
  assert.equal(g.body.engagement.introductions[0].status, 'waiting');
  assert.ok(!g.raw.includes('0912 345 678'));
  assert.equal((await call('intro-decide', base)).body.code, 'decided', 'can\'t answer twice');
  for (const m of sentEmails.filter((e) => Array.isArray(e.to))) for (const s of ['Hoa', 'Michael', '0912']) assert.ok(!(m.subject + m.text).includes(s));
});

test('introduce: R15 to him with only what she shared; R16 to her in Vietnamese with his details; Zalo text; status introduced', async () => {
  const w = seedWoman();
  const c = readyClient({}, [w]);
  const [intro] = await choose(c, [w.id]);
  const { token } = await send(c, intro);
  await call('intro-decide', { token, decision: 'accept', share: { zalo: '0912 345 678', email: 'hoa@example.vn' }, contact: ['messages', 'video'], agree: true, typedName: 'Hoa' });
  sentEmails.length = 0;
  const r = await call('admin-intro', { id: c.id, op: 'introduce', introId: intro.id }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  const r15 = sentEmails.find((m) => m.to === 'michael@example.com');
  assert.match(r15.subject, /Hoa would like to be introduced/);
  assert.ok(r15.text.includes('Zalo: 0912 345 678') && r15.text.includes('Email: hoa@example.vn'));
  assert.ok(!r15.text.includes('Phone:'), 'nothing she didn\'t choose');
  assert.ok(/messages or a video call/.test(r15.text));
  assert.ok(/never ask her for money/i.test(r15.text));
  const r16 = sentEmails.find((m) => m.to === 'hoa@example.vn');
  assert.match(r16.subject, /Thông tin liên lạc của Michael/);
  assert.ok(r16.text.includes('michael@example.com') && r16.text.includes('+44 7700 900123'));
  assert.ok(r.body.zalo.startsWith('Chào Hoa,'));
  assert.equal(fake.tables.introductions[0].status, 'introduced');
  const g = await call('intro-get', { token });
  assert.equal(g.body.hisContact.email, 'michael@example.com');
  assert.equal((await call('client-get', { token: c.token })).body.engagement.introductions[0].status, 'introduced');
});

test('saying no: private reason kept from him; R17 without reasons; he can choose a replacement, up to 5 in use', async () => {
  const women = [0, 1, 2, 3, 4, 5, 6].map((i) => seedWoman({ zalo_number: '094' + String(1000000 + i) }));
  const c = readyClient({}, women);
  const intros = await choose(c, women.slice(0, 5).map((w) => w.id));
  const { token } = await send(c, intros[0]);
  sentEmails.length = 0;
  const r = await call('intro-decide', { token, decision: 'decline', reason: 'He lives too far away.' });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.introductions.find((x) => x.id === intros[0].id).decline_reason, 'He lives too far away.');
  const r17 = sentEmails.find((m) => m.to === 'michael@example.com');
  assert.match(r17.subject, /update on your introduction/);
  assert.ok(!r17.text.includes('far away'));
  assert.ok(r17.text.includes('Choose someone else'));
  const tok = tokenOf(r17.text);
  const g = await call('client-get', { token: tok });
  assert.equal(g.body.engagement.introductions[0].status, 'not_this_time');
  assert.ok(!g.raw.includes('far away'));
  assert.equal(g.body.engagement.canReplace, true);
  assert.equal(g.body.engagement.introductionsUsed, 4);
  // replacement: from his list only, not someone already chosen
  assert.equal((await call('client-replacement', { token: tok, candidateId: women[1].id })).body.code, 'already');
  const stranger = seedWoman({ zalo_number: '0999999999' });
  assert.equal((await call('client-replacement', { token: tok, candidateId: stranger.id })).body.code, 'notOnList');
  let rr = await call('client-replacement', { token: tok, candidateId: women[5].id });
  assert.equal(rr.status, 200, rr.raw);
  assert.equal(rr.body.engagement.introductionsUsed, 5);
  rr = await call('client-replacement', { token: tok, candidateId: women[6].id });
  assert.equal(rr.body.code, 'noneLeft', 'five in use');
  const rep = fake.tables.introductions.find((x) => x.candidate_id === women[5].id);
  assert.equal(rep.is_replacement, true); assert.equal(rep.rank, 6);
});

test('a question first: stored, team notified by reference only, request stays open', async () => {
  const w = seedWoman();
  const c = readyClient({}, [w]);
  const [intro] = await choose(c, [w.id]);
  const { token } = await send(c, intro);
  assert.equal((await call('intro-question', { token, message: '' })).status, 400);
  const r = await call('intro-question', { token, message: 'Anh ấy có con không?' });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.introduction_questions[0].message, 'Anh ấy có con không?');
  const team = sentEmails.find((m) => /question before deciding/.test(m.subject));
  assert.ok(team && !team.text.includes('con không'));
  assert.equal(fake.tables.introductions[0].status, 'sent');
});

test('only one open request per woman: the database refuses a second', async () => {
  const w = seedWoman();
  const a = readyClient({}, [w]); const b = readyClient({ email: 'b@x.com' }, [w]);
  const [ia] = await choose(a, [w.id]);
  const [ib] = await choose(b, [w.id]);
  await send(a, ia);
  fake.tables.introductions.find((x) => x.id === ib.id).status = 'ready'; // force it
  const r = await call('admin-intro', { id: b.id, op: 'send', introId: ib.id }, { headers: H() });
  assert.equal(r.status, 409);
});

test('admin-intro rejects missing, expired and non-team tokens', async () => {
  const id = crypto.randomUUID();
  for (const h of [{}, adminToken('james@heritage-union.com', { expiresAt: Date.now() - 1 }), adminToken('x@example.com')]) {
    const r = await call('admin-intro', { id, op: 'send', introId: id }, { headers: h });
    assert.ok(r.status === 401 || r.status === 403);
  }
});
