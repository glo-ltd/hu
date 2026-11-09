const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const S = require('../helpers/client-seed');
const { fake, sentEmails, call, adminToken, activeClient, seedWoman, isoDaysAgo } = S;
const P = require('../../netlify/shared/profile-common');
const daily = require('../../netlify/functions/daily-tasks');

const H = () => adminToken('james@heritage-union.com');
const DAY = 86400000;
const run = (offsetDays) => daily.run(P.serviceClient(), Date.now() + (offsetDays || 0) * DAY);

test.beforeEach(() => {
  fake.reset(); sentEmails.length = 0; P._resetRateLimits();
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  process.env.INVOICE_PAYMENT_DETAILS = 'Account name: Heritage Union Ltd\nIBAN: GB00 TEST';
  delete process.env.TURNSTILE_SITE_KEY; delete process.env.TURNSTILE_SECRET;
});

function intro(clientId, candidateId, over) {
  const row = Object.assign({ id: crypto.randomUUID(), client_id: clientId, candidate_id: candidateId, rank: 1, is_replacement: false, status: 'sent',
    status_changed_at: isoDaysAgo(15), sent_at: isoDaysAgo(15), decision_token_hash: 'h' + Math.random(), decision_token_expires_at: new Date(Date.now() + 15 * DAY).toISOString(),
    reminder_sent_at: null, created_at: isoDaysAgo(16), updated_at: isoDaysAgo(15) }, over || {});
  fake.tables.introductions.push(row);
  return row;
}
function profileFor(c) {
  fake.tables.client_profiles.push({ client_id: c.id, questions_version: 'x', display_name: 'Michael', photo_paths: [], answers: {}, submitted_at: isoDaysAgo(30), summary_html: '<p>x</p>', summary_approved_at: isoDaysAgo(29) });
}

// ------------------------------------------------------------------ daily-tasks
test('R14 at 14 days: email if she has one, otherwise the team is asked to send it on Zalo; never twice', async () => {
  const c = activeClient(); profileFor(c);
  const withEmail = seedWoman();
  const zaloOnly = seedWoman({ zalo_number: '0911111111', email: null });
  const fresh = seedWoman({ zalo_number: '0922222222' });
  intro(c.id, withEmail.id);
  intro(c.id, zaloOnly.id, { rank: 2 });
  intro(c.id, fresh.id, { rank: 3, sent_at: isoDaysAgo(5) });
  let out = await run();
  assert.equal(out.reminders, 1); assert.equal(out.remindersByZalo, 1);
  const r14 = sentEmails.find((m) => m.to === 'hoa@example.vn');
  assert.match(r14.subject, /Nhắc nhẹ/);
  assert.ok(sentEmails.some((m) => /Send a gentle reminder on Zalo \(I-/.test(m.subject)));
  sentEmails.length = 0;
  out = await run();
  assert.equal(out.reminders + out.remindersByZalo, 0, 'safe to run twice');
  assert.equal(sentEmails.length, 0);
});

test('expiry at 30 days: counts as a no (R17 to him), releases her next queued request; idempotent', async () => {
  const c = activeClient(); profileFor(c);
  const c2 = activeClient({ email: 'c2@x.com' });
  const w = seedWoman();
  fake.tables.client_shortlists.push({ client_id: c.id, candidate_id: w.id, added_by: 'x', sent_at: isoDaysAgo(40) });
  intro(c.id, w.id, { decision_token_expires_at: isoDaysAgo(1) });
  const queued = intro(c2.id, w.id, { status: 'queued', sent_at: null, decision_token_hash: null, decision_token_expires_at: null });
  let out = await run();
  assert.equal(out.expired, 1);
  const row = fake.tables.introductions.find((x) => x.client_id === c.id);
  assert.equal(row.status, 'expired'); assert.equal(row.decision_token_hash, null);
  assert.equal(fake.tables.introductions.find((x) => x.id === queued.id).status, 'ready');
  assert.ok(sentEmails.some((m) => m.to === 'michael@example.com' && /update on your introduction/.test(m.subject)));
  sentEmails.length = 0;
  out = await run();
  assert.equal(out.expired, 0);
  assert.equal(sentEmails.length, 0);
});

test('thinking it over: one team reminder after 7 days', async () => {
  S.seedClient({ status: 'thinking', thinking_since: isoDaysAgo(8) });
  S.seedClient({ status: 'thinking', thinking_since: isoDaysAgo(3), email: 'b@x.com' });
  let out = await run();
  assert.equal(out.thinking, 1);
  assert.ok(sentEmails.some((m) => /Client still thinking it over \(C-/.test(m.subject)));
  out = await run();
  assert.equal(out.thinking, 0);
});

test('R18 once, 3 months after his first introduction', async () => {
  const c = activeClient();
  const w = seedWoman();
  intro(c.id, w.id, { status: 'introduced', introduced_at: isoDaysAgo(80) });
  assert.equal((await run()).checkins, 0, 'not before 3 months');
  fake.tables.introductions[0].introduced_at = isoDaysAgo(95);
  assert.equal((await run()).checkins, 1);
  assert.ok(sentEmails.some((m) => m.to === 'michael@example.com' && /here if you need us/.test(m.subject)));
  assert.equal((await run()).checkins, 0, 'only once');
});

test('engagements reaching 12 months are flagged once; never closed automatically', async () => {
  const c = activeClient({ engagement_ends_at: isoDaysAgo(1) });
  assert.equal((await run()).flagged, 1);
  assert.ok(fake.tables.clients[0].engagement_flagged_at);
  assert.equal(fake.tables.clients[0].status, 'active', 'never closed automatically');
  assert.equal((await run()).flagged, 0);
  assert.ok(!sentEmails.some((m) => m.to === 'michael@example.com'), 'no email to him');
  void c;
});

test('documents (ID, certificate, photos) deleted 6 months after closing, not before', async () => {
  const c = activeClient();
  const paths = [c.id + '/id/' + crypto.randomUUID() + '.pdf', c.id + '/certificate/' + crypto.randomUUID() + '.pdf', c.id + '/photos/' + crypto.randomUUID() + '.jpg'];
  paths.forEach((p) => fake.addObject(p, S.PDF, 'client-documents'));
  Object.assign(fake.tables.clients[0], { status: 'closed', closed_at: isoDaysAgo(10), documents_delete_after: new Date(Date.now() + 170 * DAY).toISOString(), id_document_path: paths[0], certificate_path: paths[1] });
  assert.equal((await run()).documentsDeleted, 0);
  assert.ok(fake.hasObject(paths[0], 'client-documents'));
  const out = await run(171);
  assert.equal(out.documentsDeleted, 1);
  paths.forEach((p) => assert.equal(fake.hasObject(p, 'client-documents'), false, p));
  assert.equal(fake.tables.clients[0].id_document_path, null);
  assert.ok(fake.tables.clients[0].documents_deleted_at);
  assert.equal((await run(172)).documentsDeleted, 0);
});

// ------------------------------------------------------------------ closing
test('relationship success: honour invoice (editable), R19 with PDF, R21 feedback; status closed; pending requests cancelled; 6-month clock', async () => {
  const c = activeClient(); profileFor(c);
  const w = seedWoman();
  intro(c.id, w.id);
  const r = await call('admin-client-close', { id: c.id, kind: 'success', amountCents: 800000 }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  const row = fake.tables.clients[0];
  assert.equal(row.status, 'closed'); assert.equal(row.closed_kind, 'success'); assert.equal(row.access_token_hash, null);
  const months = (Date.parse(row.documents_delete_after) - Date.now()) / DAY;
  assert.ok(months > 180 && months < 186);
  const inv = fake.tables.client_invoices[0];
  assert.equal(inv.kind, 'honour'); assert.equal(inv.amount_cents, 800000); assert.match(inv.number, /^HU-\d{4}-0001$/);
  const r19 = sentEmails.find((m) => /^Congratulations/.test(m.subject));
  assert.equal(r19.attachments[0].filename, inv.number + '.pdf');
  assert.ok(r19.text.includes('USD 8,000.00'));
  assert.ok(sentEmails.some((m) => /share your thoughts/.test(m.subject)));
  assert.equal(fake.tables.introductions[0].status, 'cancelled');
  assert.equal((await call('client-get', { token: c.token })).status, 401, 'his page closes');
});

test('12 months complete sends R20 (nothing more owed); plain close sends only R21; only active or paused can close', async () => {
  const a = activeClient(); const b = activeClient({ email: 'b@x.com', status: 'paused' });
  let r = await call('admin-client-close', { id: a.id, kind: 'completed' }, { headers: H() });
  assert.equal(r.status, 200);
  assert.ok(sentEmails.some((m) => /engagement is complete/.test(m.subject) && /nothing more is owed/.test(m.text)));
  sentEmails.length = 0;
  r = await call('admin-client-close', { id: b.id, kind: 'closed' }, { headers: H() });
  assert.equal(r.status, 200);
  assert.deepEqual(sentEmails.filter((m) => !Array.isArray(m.to)).map((m) => m.subject), ['Would you share your thoughts? — Heritage Union']);
  assert.equal((await call('admin-client-close', { id: a.id, kind: 'closed' }, { headers: H() })).status, 409);
});

test('feedback: rating required; publishing needs the written-permission tick; stored with the wording version; one answer', async () => {
  const c = activeClient();
  await call('admin-client-close', { id: c.id, kind: 'completed' }, { headers: H() });
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(sentEmails.find((m) => /share your thoughts/.test(m.subject)).text)[1];
  const g = await call('feedback-get', { token: tok });
  assert.equal(g.body.firstName, 'Michael');
  assert.equal((await call('feedback-submit', { token: tok, rating: 0 })).body.field, 'rating');
  assert.equal((await call('feedback-submit', { token: tok, rating: 5, permission: 'first_name' })).body.field, 'agree');
  const r = await call('feedback-submit', { token: tok, rating: 5, comments: 'Thank you, James.', permission: 'first_name_country', agree: true });
  assert.equal(r.status, 200);
  const f = fake.tables.client_feedback[0];
  assert.equal(f.publish_permission, 'first_name_country'); assert.equal(f.permission_text_version, 'en-2026-12-feedback-v1');
  assert.equal((await call('feedback-submit', { token: tok, rating: 4 })).status, 401, 'one answer per link');
  const team = sentEmails.find((m) => /feedback received/i.test(m.subject));
  assert.ok(team && !team.text.includes('Thank you, James'));
});

// ------------------------------------------------------------------ pause and concerns
test('pause blocks new requests (send, replacement, shortlist) and shows paused on his page; unpause restores', async () => {
  const c = activeClient(); profileFor(c);
  const w = seedWoman();
  const row = intro(c.id, w.id, { status: 'ready', sent_at: null });
  await call('admin-client-action', { id: c.id, action: 'pause' }, { headers: H() });
  assert.equal(fake.tables.clients[0].status, 'paused');
  assert.equal((await call('admin-intro', { id: c.id, op: 'send', introId: row.id }, { headers: H() })).status, 409);
  assert.equal((await call('admin-shortlist-send', { id: c.id, candidateIds: [w.id] }, { headers: H() })).status, 409);
  assert.equal((await call('client-replacement', { token: c.token, candidateId: w.id })).body.code, 'paused');
  const g = await call('client-get', { token: c.token });
  assert.equal(g.body.status, 'paused'); assert.equal(g.body.engagement.paused, true);
  await call('admin-client-action', { id: c.id, action: 'unpause' }, { headers: H() });
  assert.equal(fake.tables.clients[0].status, 'active');
});

test('concern form: always stored and always notifies the team (reference only); Vietnamese messages for women', async () => {
  let r = await call('concern-submit', { lang: 'vi', about: 'client', role: 'candidate', message: '' });
  assert.equal(r.status, 400); assert.match(r.body.error, /chuyện gì/);
  r = await call('concern-submit', { lang: 'vi', about: 'client', role: 'candidate', subject: 'Michael', message: 'Anh ấy hỏi tôi về tiền.', contact: '0912345678' });
  assert.equal(r.status, 200, r.raw);
  assert.equal(fake.tables.concerns[0].message, 'Anh ấy hỏi tôi về tiền.');
  const team = sentEmails.find((m) => /New concern reported \(R-/.test(m.subject));
  assert.ok(team && !team.text.includes('tiền') && !team.text.includes('0912345678') && !team.text.includes('Michael'));
  assert.equal((await call('concern-submit', { about: 'other', role: 'other', message: 'x', website: 'bot' })).status, 200);
  assert.equal(fake.tables.concerns.length, 1, 'honeypot');
  // team: list, link to a client, mark handled
  const c = activeClient();
  const l = await call('admin-concerns', { op: 'list' }, { headers: H() });
  assert.equal(l.body.concerns.length, 1);
  await call('admin-concerns', { op: 'link', concernId: fake.tables.concerns[0].id, clientId: c.id }, { headers: H() });
  await call('admin-concerns', { op: 'handled', concernId: fake.tables.concerns[0].id }, { headers: H() });
  assert.equal(fake.tables.concerns[0].client_id, c.id);
  assert.equal(fake.tables.concerns[0].handled_by, 'james@heritage-union.com');
});

test('phase 4 admin endpoints reject missing, expired and non-team tokens', async () => {
  const id = crypto.randomUUID();
  for (const [name, body] of [['admin-client-close', { id, kind: 'closed' }], ['admin-concerns', { op: 'list' }]]) {
    assert.equal((await call(name, body, { headers: {} })).status, 401, name);
    assert.equal((await call(name, body, { headers: adminToken('james@heritage-union.com', { expiresAt: Date.now() - 1 }) })).status, 401, name);
    assert.equal((await call(name, body, { headers: adminToken('x@example.com') })).status, 403, name);
  }
});

test('netlify.toml schedules daily-tasks once a day', () => {
  const toml = require('fs').readFileSync(require('path').join(__dirname, '../../netlify.toml'), 'utf8');
  assert.match(toml, /\[functions\."daily-tasks"\]\s+schedule = "@daily"/);
});
