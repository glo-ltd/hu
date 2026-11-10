const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { fake, sentEmails, call, adminToken, CC, seedClient, uploadDoc, submittedClient, APPLICATION, DECLARATION, PDF, JPG, dateDaysAgo } = require('../helpers/client-seed');
const P = require('../../netlify/shared/profile-common');

const H = () => adminToken('james@heritage-union.com');
const PII = ['Michael', 'Thompson', 'michael@example.com', 'United Kingdom', 'Bristol', '+44', '1978'];
function teamEmailsClean() {
  for (const m of sentEmails.filter((e) => /heritage-union\.com/.test(String(e.to)) && !/example\.com/.test(String(e.to)))) {
    for (const s of PII) assert.ok(!(m.subject + m.html + m.text).includes(s), 'team email "' + m.subject + '" contains ' + s);
  }
}
function setAgreement(version) { CC.AGREEMENT.version = version; }

test.beforeEach(() => {
  fake.reset(); sentEmails.length = 0; P._resetRateLimits();
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  process.env.INVOICE_PAYMENT_DETAILS = 'Account name: Heritage Union Ltd\nIBAN: GB00 TEST 0000 0000 0000 00';
  delete process.env.TURNSTILE_SITE_KEY; delete process.env.TURNSTILE_SECRET;
  setAgreement('FINAL-TEST');
});
test.after(() => setAgreement(require('../../assets/data/client-agreement.json').version));

const ENQ = { iAm: 'client', fullName: 'Michael Thompson', email: 'Michael@Example.com', country: 'United Kingdom', age: 48, phone: '', source: 'search', message: 'Hello James.', consent: true };

// ------------------------------------------------------------------ F1
test('F1 enquiry: saves a client, sends R1 to him and a reference-only team email', async () => {
  const r = await call('client-enquiry', ENQ);
  assert.equal(r.status, 200, r.raw);
  assert.equal(r.body.mode, 'client');
  const c = fake.tables.clients[0];
  assert.equal(c.status, 'enquiry');
  assert.equal(c.email, 'michael@example.com');
  assert.ok(c.ip_hash && !/\d+\.\d+/.test(c.ip_hash));
  assert.equal(sentEmails[0].to, 'michael@example.com');
  assert.match(sentEmails[0].subject, /Thank you for your enquiry/);
  assert.ok(sentEmails[0].text.includes('/contact#book') && sentEmails[0].text.includes('/request-fee-structure'));
  assert.ok(sentEmails[0].text.includes('/contact?concern=1'), 'report a concern link');
  assert.ok(sentEmails[0].text.includes('Founder, Heritage Union'));
  const team = sentEmails[1];
  assert.match(team.subject, /^New client enquiry \(C-[0-9A-F]{8}\)$/);
  assert.ok(team.html.includes('/admin/#client-' + c.id));
  teamEmailsClean();
});

test('F1: same email again (any case) updates the same client', async () => {
  await call('client-enquiry', ENQ);
  await call('client-enquiry', Object.assign({}, ENQ, { email: 'MICHAEL@example.COM', message: 'Second note' }));
  assert.equal(fake.tables.clients.length, 1);
  assert.equal(fake.tables.clients[0].enquiry_message, 'Second note');
});

test('F1: women are pointed to registration and nothing is saved', async () => {
  const r = await call('client-enquiry', Object.assign({}, ENQ, { iAm: 'woman' }));
  assert.equal(r.body.mode, 'woman');
  assert.equal(fake.tables.clients.length, 0);
  assert.equal(sentEmails.length, 0);
});

test('F1: press/other go to general_enquiries, not clients', async () => {
  const r = await call('client-enquiry', Object.assign({}, ENQ, { iAm: 'other', age: null }));
  assert.equal(r.body.mode, 'other');
  assert.equal(fake.tables.clients.length, 0);
  assert.equal(fake.tables.general_enquiries.length, 1);
  teamEmailsClean();
});

test('F1: validation, honeypot, under-18, consent; works with signups closed', async () => {
  process.env.CLIENT_SIGNUPS_OPEN = 'false';
  for (const [over, field] of [[{ fullName: '' }, 'fullName'], [{ email: 'x' }, 'email'], [{ age: 17 }, 'age'], [{ consent: false }, 'consent'], [{ message: '' }, 'message'], [{ iAm: 'x' }, 'iAm']]) {
    const r = await call('client-enquiry', Object.assign({}, ENQ, over));
    assert.equal(r.status, 400, JSON.stringify(over));
    assert.equal(r.body.field, field);
  }
  const bot = await call('client-enquiry', Object.assign({}, ENQ, { website: 'spam' }));
  assert.equal(bot.status, 200);
  assert.equal(fake.tables.clients.length, 0);
  const ok = await call('client-enquiry', ENQ);
  assert.equal(ok.status, 200, 'enquiry form always works');
});

test('F1: Turnstile is required when configured', async () => {
  process.env.TURNSTILE_SITE_KEY = 'k'; process.env.TURNSTILE_SECRET = 's';
  const real = global.fetch;
  global.fetch = async () => ({ json: async () => ({ success: false }) });
  const r = await call('client-enquiry', ENQ);
  global.fetch = real;
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'turnstile');
});

// ------------------------------------------------------------------ R2
test('R2 fee document: still sends the PDF; creates or updates the client by email', async () => {
  const r = await call('request-fee-structure', { name: 'Michael Thompson', email: 'michael@example.com', country: 'UK' });
  assert.equal(r.status, 200, r.raw);
  assert.equal(fake.tables.clients.length, 1);
  assert.ok(fake.tables.clients[0].fee_document_sent_at);
  assert.equal(sentEmails[0].attachments[0].filename, 'Heritage-Union-Fee-Structure.pdf');
  await call('request-fee-structure', { name: 'M T', email: 'MICHAEL@EXAMPLE.COM', country: 'UK' });
  assert.equal(fake.tables.clients.length, 1, 'matched case-insensitively');
  teamEmailsClean();
});

// ------------------------------------------------------------------ private page access
test('private page: missing, unknown, expired, closed and not-a-fit are refused; another client\'s token reads only his own data', async () => {
  assert.equal((await call('client-get', {})).status, 401);
  assert.equal((await call('client-get', { token: CC.newClientToken(30).token })).status, 401);
  const exp = seedClient({ access_token_expires_at: new Date(Date.now() - 1000).toISOString() });
  const r = await call('client-get', { token: exp.token });
  assert.equal(r.status, 401); assert.equal(r.body.code, 'linkExpired');
  for (const status of ['closed', 'not_a_fit', 'enquiry']) {
    const c = seedClient({ status, email: status + '@x.com' });
    assert.equal((await call('client-get', { token: c.token })).status, 401, status);
  }
  const a = seedClient({ email: 'a@x.com', full_name: 'Alan Able', application: { legal_name: 'Alan Able' } });
  const b = seedClient({ email: 'b@x.com', full_name: 'Bob Baker', application: { legal_name: 'Bob Baker' } });
  const ra = await call('client-get', { token: a.token });
  assert.equal(ra.body.firstName, 'Alan');
  assert.ok(!ra.raw.includes('Bob') && !ra.raw.includes('b@x.com'));
  assert.ok(!ra.raw.includes('client-iphash') && !ra.raw.includes(a.row.access_token_hash), 'no hashes');
  // b's token can't write to a's record
  await call('client-save', { token: b.token, section: 'application', answers: { occupation: 'Pilot' } });
  assert.equal(fake.tables.clients.find((x) => x.id === a.id).application.occupation, undefined);
});

test('CLIENT_SIGNUPS_OPEN off: private page says not available yet', async () => {
  const c = seedClient();
  process.env.CLIENT_SIGNUPS_OPEN = 'false';
  const r = await call('client-get', { token: c.token });
  assert.equal(r.status, 403); assert.equal(r.body.code, 'notOpen');
  assert.match(r.body.error, /isn't available yet/);
});

// ------------------------------------------------------------------ F2/F3 saving
test('save: validates types, options, lengths, 18+, certificate age; moves invited -> applying', async () => {
  const c = seedClient();
  let r = await call('client-save', { token: c.token, section: 'application', answers: { occupation: 'Engineer' } });
  assert.equal(r.status, 200, r.raw);
  assert.equal(fake.tables.clients[0].status, 'applying');
  const bad = [
    ['application', { date_of_birth: dateDaysAgo(365 * 17) }, 'under18'],
    ['application', { education: 'phd' }, 'invalid'],
    ['application', { legal_name: 'x'.repeat(121) }, 'tooLong'],
    ['application', { email: 'nope' }, 'email'],
    ['application', { languages: [{ language: 'English', level: 'expert' }] }, 'invalid'],
    ['application', { conviction: 'no' }, 'invalid'],            // wrong section
    ['application', { id_document: 'x' }, 'invalid'],           // documents only via upload
    ['declaration', { certificate_issued_on: dateDaysAgo(200) }, 'certificateOld'],
    ['declaration', { previous_marriages: 11 }, 'invalid'],
    ['declaration', { secret_notes: 'x' }, 'invalid'],
  ];
  for (const [section, answers, code] of bad) {
    r = await call('client-save', { token: c.token, section, answers });
    assert.equal(r.status, 400, JSON.stringify(answers));
    assert.equal(r.body.code, code, JSON.stringify(answers));
  }
});

test('save: conditional details are dropped when the answer changes to "no"', async () => {
  const c = seedClient();
  await call('client-save', { token: c.token, section: 'declaration', answers: { conviction: 'yes', conviction_details: 'Speeding, UK, 2001' } });
  assert.equal(fake.tables.clients[0].declaration.conviction_details, 'Speeding, UK, 2001');
  await call('client-save', { token: c.token, section: 'declaration', answers: { conviction: 'no' } });
  assert.equal(fake.tables.clients[0].declaration.conviction_details, undefined);
});

// ------------------------------------------------------------------ documents
test('documents: own folder only, real PDF/JPEG/PNG only, replacement deletes the old file and resets the check', async () => {
  const c = seedClient();
  const other = seedClient({ email: 'o@x.com' });
  let r = await uploadDoc(c, 'id', JPG, 'image/jpeg');
  assert.equal(r.status, 200, r.raw);
  const first = fake.tables.clients.find((x) => x.id === c.id).id_document_path;
  assert.ok(first.startsWith(c.id + '/id/'));
  // wrong type
  assert.equal((await call('client-doc-upload-url', { token: c.token, kind: 'id', type: 'image/gif' })).status, 400);
  // bytes that aren't what the extension claims
  r = await uploadDoc(c, 'certificate', Buffer.from('not a pdf'));
  assert.equal(r.status, 400);
  assert.equal(r.body.code, 'type');
  // a path in another client's folder
  const foreign = other.id + '/id/' + crypto.randomUUID() + '.pdf';
  fake.addObject(foreign, PDF, 'client-documents');
  r = await call('client-doc-confirm', { token: c.token, kind: 'id', path: foreign });
  assert.equal(r.status, 400);
  // replacement
  fake.tables.clients.find((x) => x.id === c.id).id_checked_at = new Date().toISOString();
  r = await uploadDoc(c, 'id', PDF);
  assert.equal(r.status, 200);
  const row = fake.tables.clients.find((x) => x.id === c.id);
  assert.notEqual(row.id_document_path, first);
  assert.equal(fake.hasObject(first, 'client-documents'), false, 'old file deleted');
  assert.equal(row.id_checked_at, null, 'check reset');
});

// ------------------------------------------------------------------ signing and submit
test('declaration: typed name must match legal name; stores name, time, IP hash, version; editing un-signs', async () => {
  const c = seedClient({ application: APPLICATION, declaration: DECLARATION });
  await uploadDoc(c, 'certificate');
  let r = await call('client-sign', { token: c.token, what: 'declaration', agreed: true, typedName: 'M Thompson' });
  assert.equal(r.body.code, 'nameMismatch');
  r = await call('client-sign', { token: c.token, what: 'declaration', agreed: false, typedName: APPLICATION.legal_name });
  assert.equal(r.body.code, 'notAgreed');
  r = await call('client-sign', { token: c.token, what: 'declaration', agreed: true, typedName: '  michael james THOMPSON ' }, { headers: { 'x-nf-client-connection-ip': '203.0.113.9' } });
  assert.equal(r.status, 200, r.raw);
  const row = fake.tables.clients[0];
  assert.equal(row.declaration_typed_name, 'michael james THOMPSON');
  assert.equal(row.declaration_version, CC.C.DECLARATION_VERSION);
  assert.equal(row.declaration_ip_hash, crypto.createHash('sha256').update('203.0.113.9').digest('hex'));
  assert.ok(row.declaration_signed_at);
  await call('client-save', { token: c.token, section: 'declaration', answers: { countries_lived: 'United Kingdom, France' } });
  assert.equal(fake.tables.clients[0].declaration_signed_at, null, 'changing an answer means signing again');
});

test('agreement: DRAFT version cannot be accepted or submitted; a final version can', async () => {
  setAgreement('DRAFT-2026-12-v0');
  const c = seedClient({ application: APPLICATION });
  let r = await call('client-sign', { token: c.token, what: 'agreement', agreed: true, typedName: APPLICATION.legal_name, version: 'DRAFT-2026-12-v0' });
  assert.equal(r.status, 409); assert.equal(r.body.code, 'agreementDraft');
  const g = await call('client-get', { token: c.token });
  assert.equal(g.body.agreement.draft, true);
  setAgreement('FINAL-TEST');
  r = await call('client-sign', { token: c.token, what: 'agreement', agreed: true, typedName: APPLICATION.legal_name, version: 'OLD' });
  assert.equal(r.body.code, 'agreementChanged');
  r = await call('client-sign', { token: c.token, what: 'agreement', agreed: true, typedName: APPLICATION.legal_name, version: 'FINAL-TEST' });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.clients[0].agreement_version, 'FINAL-TEST');
});

test('agreement files: html data-version matches the json version, and the shipped one is a DRAFT', () => {
  const fs = require('fs'); const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '../../assets/data/client-agreement.html'), 'utf8');
  const json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../assets/data/client-agreement.json'), 'utf8'));
  assert.equal(/data-version="([^"]+)"/.exec(html)[1], json.version);
  assert.match(json.version, /DRAFT/);
});

test('submit: refuses until everything is complete; then submitted, R6 to him, reference-only team email; locked afterwards', async () => {
  const c = seedClient({ application: APPLICATION, declaration: DECLARATION });
  let r = await call('client-submit', { token: c.token });
  assert.equal(r.body.code, 'incomplete'); assert.equal(r.body.field, 'id_document');
  await uploadDoc(c, 'id', JPG, 'image/jpeg');
  await uploadDoc(c, 'certificate');
  r = await call('client-submit', { token: c.token });
  assert.equal(r.body.code, 'unsigned');
  await call('client-sign', { token: c.token, what: 'declaration', agreed: true, typedName: APPLICATION.legal_name });
  r = await call('client-submit', { token: c.token });
  assert.equal(r.body.code, 'agreement');
  await call('client-sign', { token: c.token, what: 'agreement', agreed: true, typedName: APPLICATION.legal_name, version: 'FINAL-TEST' });
  r = await call('client-submit', { token: c.token });
  assert.equal(r.status, 200, r.raw);
  assert.equal(fake.tables.clients[0].status, 'submitted');
  assert.ok(sentEmails.some((m) => m.to === 'michael@example.com' && /Application received/.test(m.subject)));
  assert.ok(sentEmails.some((m) => /Client application submitted \(C-/.test(m.subject)));
  teamEmailsClean();
  r = await call('client-save', { token: c.token, section: 'application', answers: { occupation: 'Changed' } });
  assert.equal(r.status, 409);
});

// ------------------------------------------------------------------ admin
test('every admin-client endpoint rejects missing, expired and non-team tokens before touching data', async () => {
  const id = crypto.randomUUID();
  for (const [name, body] of [['admin-client-list', {}], ['admin-client-get', { id }], ['admin-client-doc', { id, kind: 'id' }], ['admin-client-action', { id, action: 'call_held' }], ['admin-client-invoice', { id, op: 'create' }]]) {
    assert.equal((await call(name, body, { headers: {} })).status, 401, name);
    assert.equal((await call(name, body, { headers: adminToken('james@heritage-union.com', { expiresAt: Date.now() - 1000 }) })).status, 401, name);
    assert.equal((await call(name, body, { headers: adminToken('intruder@example.com') })).status, 403, name);
  }
  assert.equal(fake.calls.length, 0);
});

test('stage 2: call booked -> held -> invite (R3 with fee PDF and 30-day link); invite blocked while signups are off', async () => {
  await call('client-enquiry', ENQ);
  const id = fake.tables.clients[0].id;
  sentEmails.length = 0;
  assert.equal((await call('admin-client-action', { id, action: 'invite' }, { headers: H() })).status, 409, 'not before the call');
  await call('admin-client-action', { id, action: 'call_booked' }, { headers: H() });
  await call('admin-client-action', { id, action: 'call_held' }, { headers: H() });
  process.env.CLIENT_SIGNUPS_OPEN = 'false';
  let r = await call('admin-client-action', { id, action: 'invite' }, { headers: H() });
  assert.equal(r.status, 409); assert.match(r.body.error, /CLIENT_SIGNUPS_OPEN/);
  process.env.CLIENT_SIGNUPS_OPEN = 'true';
  r = await call('admin-client-action', { id, action: 'invite' }, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  const row = fake.tables.clients[0];
  assert.equal(row.status, 'invited');
  const days = (Date.parse(row.access_token_expires_at) - Date.now()) / 86400000;
  assert.ok(days > 29.9 && days <= 30);
  const r3 = sentEmails[0];
  assert.match(r3.subject, /invitation to apply/);
  assert.equal(r3.attachments[0].filename, 'Heritage-Union-Fee-Structure.pdf');
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(r3.text)[1];
  assert.equal(CC.hashToken(tok), row.access_token_hash);
  assert.equal((await call('client-get', { token: tok })).status, 200);
  const ev = fake.tables.client_events.map((e) => e.kind + ':' + e.actor);
  assert.ok(ev.includes('invite:james@heritage-union.com'));
});

test('thinking it over records the date; not a fit sends R4 (no reasons) and kills the link', async () => {
  const c = seedClient({ status: 'call_held' });
  await call('admin-client-action', { id: c.id, action: 'thinking' }, { headers: H() });
  assert.ok(fake.tables.clients[0].thinking_since);
  const r = await call('admin-client-action', { id: c.id, action: 'not_a_fit' }, { headers: H() });
  assert.equal(r.status, 200);
  assert.equal(fake.tables.clients[0].status, 'not_a_fit');
  assert.equal(fake.tables.clients[0].access_token_hash, null);
  assert.match(sentEmails[0].subject, /^Thank you/);
  assert.ok(!/because|reason/i.test(sentEmails[0].text));
});

test('resend link (R5) replaces the old link', async () => {
  const c = seedClient({ status: 'applying' });
  await call('admin-client-action', { id: c.id, action: 'resend_link' }, { headers: H() });
  assert.equal((await call('client-get', { token: c.token })).status, 401, 'old link dead');
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(sentEmails[0].text)[1];
  assert.equal((await call('client-get', { token: tok })).status, 200);
});

test('invoice order: only after both documents are checked; numbering HU-YYYY-0001; amount editable; R7 with PDF and payment details', async () => {
  const c = await submittedClient();
  const h = H();
  let r = await call('admin-client-invoice', { id: c.id, op: 'create', kind: 'initiation' }, { headers: h });
  assert.equal(r.status, 200, r.raw);
  const inv = r.body.invoice;
  assert.equal(inv.amount_cents, 1500000);
  r = await call('admin-client-invoice', { id: c.id, op: 'update', invoiceId: inv.id, amountCents: 1200000, description: 'Concierge Initiation (founding member)' }, { headers: h });
  assert.equal(r.body.invoice.amount_cents, 1200000);
  r = await call('admin-client-invoice', { id: c.id, op: 'send', invoiceId: inv.id }, { headers: h });
  assert.equal(r.status, 409, 'not before documents are checked');
  await call('admin-client-action', { id: c.id, action: 'check_id' }, { headers: h });
  assert.equal(fake.tables.clients[0].status, 'submitted');
  await call('admin-client-action', { id: c.id, action: 'check_certificate' }, { headers: h });
  assert.equal(fake.tables.clients[0].status, 'checked');
  assert.equal(fake.tables.clients[0].id_checked_by, 'james@heritage-union.com');
  delete process.env.INVOICE_PAYMENT_DETAILS;
  r = await call('admin-client-invoice', { id: c.id, op: 'send', invoiceId: inv.id }, { headers: h });
  assert.equal(r.status, 409, 'needs payment details');
  process.env.INVOICE_PAYMENT_DETAILS = 'Account name: Heritage Union Ltd\nIBAN: GB00 TEST 0000 0000 0000 00';
  sentEmails.length = 0;
  r = await call('admin-client-invoice', { id: c.id, op: 'send', invoiceId: inv.id }, { headers: h });
  assert.equal(r.status, 200, r.raw);
  const year = new Date().getUTCFullYear();
  assert.equal(r.body.invoice.number, 'HU-' + year + '-0001');
  assert.equal(fake.tables.clients[0].status, 'invoiced');
  const mail = sentEmails[0];
  assert.match(mail.subject, /Invoice HU-\d{4}-0001/);
  assert.ok(mail.text.includes('IBAN: GB00 TEST') && mail.text.includes('USD 12,000.00'));
  const pdf = Buffer.from(mail.attachments[0].content, 'base64').toString('latin1');
  assert.ok(pdf.startsWith('%PDF-1.4') && pdf.includes('HU-' + year + '-0001') && pdf.includes('GB00 TEST') && pdf.includes('12,000.00'));
  // his page can download it, another client's token can't
  const own = await call('client-invoice-pdf', { token: c.token, invoiceId: inv.id });
  assert.equal(own.status, 200);
  assert.ok(Buffer.from(own.raw, 'base64').toString('latin1').startsWith('%PDF'));
  const other = seedClient({ email: 'z@x.com', status: 'applying' });
  assert.equal((await call('client-invoice-pdf', { token: other.token, invoiceId: inv.id })).status, 404);
  // second invoice the same year numbers on
  const c2 = await submittedClient({ email: 'second@x.com' });
  await call('admin-client-action', { id: c2.id, action: 'check_id' }, { headers: h });
  await call('admin-client-action', { id: c2.id, action: 'check_certificate' }, { headers: h });
  const i2 = (await call('admin-client-invoice', { id: c2.id, op: 'create', kind: 'initiation' }, { headers: h })).body.invoice;
  r = await call('admin-client-invoice', { id: c2.id, op: 'send', invoiceId: i2.id }, { headers: h });
  assert.equal(r.body.invoice.number, 'HU-' + year + '-0002');
});

test('certificate older than 6 months cannot be marked checked', async () => {
  const c = await submittedClient();
  fake.tables.clients[0].declaration = Object.assign({}, DECLARATION, { certificate_issued_on: dateDaysAgo(200) });
  const r = await call('admin-client-action', { id: c.id, action: 'check_certificate' }, { headers: H() });
  assert.equal(r.status, 409);
});

test('payment received: active, 12-month engagement, new link, R8 welcome; decline (R4) no longer possible', async () => {
  const c = await submittedClient();
  const h = H();
  await call('admin-client-action', { id: c.id, action: 'check_id' }, { headers: h });
  await call('admin-client-action', { id: c.id, action: 'check_certificate' }, { headers: h });
  const inv = (await call('admin-client-invoice', { id: c.id, op: 'create', kind: 'initiation' }, { headers: h })).body.invoice;
  await call('admin-client-invoice', { id: c.id, op: 'send', invoiceId: inv.id }, { headers: h });
  assert.equal((await call('admin-client-action', { id: c.id, action: 'not_a_fit' }, { headers: h })).status, 409);
  sentEmails.length = 0;
  const r = await call('admin-client-invoice', { id: c.id, op: 'paid', invoiceId: inv.id }, { headers: h });
  assert.equal(r.status, 200);
  const row = fake.tables.clients[0];
  assert.equal(row.status, 'active');
  const months = (Date.parse(row.engagement_ends_at) - Date.parse(row.engagement_starts_at)) / 86400000;
  assert.ok(months >= 364 && months <= 366);
  assert.match(sentEmails[0].subject, /Welcome to Heritage Union/);
  const tok = /#t=([A-Za-z0-9_-]{43})/.exec(sentEmails[0].text)[1];
  const g = await call('client-get', { token: tok });
  assert.equal(g.body.status, 'active');
  assert.equal(g.body.invoices[0].status, 'paid');
  assert.ok(!g.raw.includes('IBAN'), 'payment details not exposed on his page');
});

test('admin-client-get never returns token or IP hashes', async () => {
  const c = await submittedClient();
  const r = await call('admin-client-get', { id: c.id }, { headers: H() });
  assert.equal(r.status, 200);
  assert.ok(!r.raw.includes(c.row.access_token_hash) && !r.raw.includes('client-iphash'));
});

test('emails: every client email has a plain-text version, the concern link and James\'s signature; team emails have no personal data', () => {
  const E = require('../../netlify/shared/emails');
  for (const k of Object.keys(E)) {
    if (k === 'team') continue;
    const variants = E[k].variants ? Object.values(E[k].variants) : [E[k]];
    for (const v of variants) {
      const o = v.build(v.sample);
      const vi = v.sample.lang === 'vi';
      assert.ok(o.text && o.html && o.subject, k);
      assert.ok(o.text.includes(vi ? '/vi/contact?concern=1' : '/contact?concern=1'), k + ' concern link');
      assert.ok(o.text.includes(vi ? 'James\nNhà sáng lập, Heritage Union' : 'James\nFounder, Heritage Union'), k + ' signature');
    }
  }
  for (const k of Object.keys(E.team)) {
    const o = E.team[k].build({ clientId: crypto.randomUUID(), introId: crypto.randomUUID() });
    assert.ok(!o.text.includes('concern'), 'team emails have no concern footer');
    assert.match(o.subject, /\([CI]-[0-9A-F]{8}\)$/);
  }
});

test('invoice PDF builder: valid structure and xref offsets', () => {
  const { buildInvoicePdf } = require('../../netlify/shared/invoice-pdf');
  const buf = buildInvoicePdf({ number: 'HU-2026-0001', issuedAt: '2026-12-09T00:00:00Z', dueAt: '2026-12-23T00:00:00Z', description: 'Concierge Initiation', amountCents: 1500000, currency: 'USD', billTo: ['Nguyễn Văn A', 'Hà Nội'], paymentDetails: 'IBAN X' });
  const s = buf.toString('latin1');
  const xref = Number(/startxref\n(\d+)/.exec(s)[1]);
  assert.equal(s.slice(xref, xref + 4), 'xref');
  const offsets = s.slice(xref).split('\n').slice(3, 11).map((l) => Number(l.slice(0, 10)));
  offsets.forEach((o, i) => assert.equal(s.slice(o, o + String(i + 1).length + 6), (i + 1) + ' 0 obj'));
  assert.ok(s.includes('(Nguyen Van A)'), 'accents simplified for the built-in font');
});

// ------------------------------------------------------------------ Add client (team)
test('Add client: team adds a man who got in touch directly; nothing is sent to him; duplicates open the existing record', async () => {
  const body = { fullName: 'Wlodek Test', email: 'Wlodek@Example.com', country: 'Poland', age: '55', phone: '', channel: 'email', message: 'Asked about Polish or Russian speakers.' };
  assert.equal((await call('admin-client-create', body)).status, 401, 'signed-in team only');
  assert.equal((await call('admin-client-create', body, { headers: adminToken('stranger@example.com') })).status, 403);
  assert.equal((await call('admin-client-create', Object.assign({}, body, { channel: '' }), { headers: H() })).status, 400);
  assert.equal((await call('admin-client-create', Object.assign({}, body, { age: '17' }), { headers: H() })).status, 400);
  const r = await call('admin-client-create', body, { headers: H() });
  assert.equal(r.status, 200, r.raw);
  assert.equal(r.body.existing, false);
  const c = fake.tables.clients[0];
  assert.equal(c.id, r.body.id);
  assert.equal(c.status, 'enquiry');
  assert.equal(c.email, 'wlodek@example.com');
  assert.equal(c.age, 55);
  assert.equal(c.source, 'direct_email');
  assert.match(c.enquiry_message, /^Added by the team\. Got in touch by email\. Asked about/);
  assert.equal(sentEmails.length, 0, 'nothing sent to him or the team');
  assert.ok(fake.tables.client_events.some((e) => e.client_id === c.id && e.kind === 'added_by_team' && e.actor === 'james@heritage-union.com'));
  const again = await call('admin-client-create', Object.assign({}, body, { email: 'WLODEK@example.com' }), { headers: H() });
  assert.equal(again.body.existing, true);
  assert.equal(again.body.id, c.id);
  assert.equal(fake.tables.clients.length, 1);
  // He then moves through the normal journey.
  assert.equal((await call('admin-client-action', { id: c.id, action: 'call_booked' }, { headers: H() })).status, 200);
});
