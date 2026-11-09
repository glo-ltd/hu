// Client fixtures for the client-side tests.
const crypto = require('crypto');
const { fake, sentEmails, call, adminToken } = require('./seed');
const CC = require('../../netlify/shared/client-common');

function isoDaysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
function dateDaysAgo(n) { return isoDaysAgo(n).slice(0, 10); }

const APPLICATION = {
  legal_name: 'Michael James Thompson', date_of_birth: '1978-04-02', nationality: 'British', country: 'United Kingdom', city: 'Bristol',
  address: '14 Rose Lane\nBristol BS1 4AA', phone: '+44 7700 900123', email: 'michael@example.com', preferred_contact: 'email',
  occupation: 'Civil engineer', education: 'university', languages: [{ language: 'English', level: 'native' }, { language: 'French', level: 'basic' }],
  marital_status: 'divorced', children_count: 1, children_details: 'A daughter, 19, at university.', visited_vietnam: 'yes', visited_vietnam_details: 'Two weeks in 2019.',
};
const DECLARATION = {
  conviction: 'no', protection_order: 'no', domestic_violence: 'no', previous_marriages: 1, previous_marriages_details: '2003 to 2014, divorced.',
  countries_lived: 'United Kingdom', agency_or_visa: 'no', certificate_country: 'United Kingdom', certificate_issued_on: dateDaysAgo(20),
};

function seedClient(over) {
  const t = CC.newClientToken(30);
  const row = Object.assign({
    id: crypto.randomUUID(), full_name: 'Michael Thompson', email: 'michael@example.com', country: 'United Kingdom', age: 48,
    status: 'invited', status_changed_at: isoDaysAgo(1), application: {}, declaration: {}, ip_hash: 'client-iphash',
    access_token_hash: t.hash, access_token_expires_at: t.expiresAt, created_at: isoDaysAgo(10), updated_at: isoDaysAgo(1),
  }, over || {});
  fake.tables.clients.push(row);
  return { id: row.id, token: t.token, row };
}

const PDF = Buffer.from('%PDF-1.4\n%test\n');
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);

async function uploadDoc(c, kind, bytes, type) {
  const up = await call('client-doc-upload-url', { token: c.token, kind, type: type || 'application/pdf' });
  if (up.status !== 200) return up;
  fake.addObject(up.body.path, bytes || PDF, 'client-documents');
  return call('client-doc-confirm', { token: c.token, kind, path: up.body.path });
}

// A client who has completed everything and sent his application.
async function submittedClient(over) {
  const c = seedClient(Object.assign({ application: APPLICATION, declaration: DECLARATION }, over || {}));
  await uploadDoc(c, 'id', JPG, 'image/jpeg');
  await uploadDoc(c, 'certificate');
  const r = fake.tables.clients.find((x) => x.id === c.id);
  Object.assign(r, { declaration_signed_at: new Date().toISOString(), declaration_typed_name: APPLICATION.legal_name, agreement_version: 'FINAL-TEST', agreement_accepted_at: new Date().toISOString(), status: 'submitted', submitted_at: new Date().toISOString() });
  return c;
}

module.exports = { fake, sentEmails, call, adminToken, CC, seedClient, uploadDoc, submittedClient, APPLICATION, DECLARATION, PDF, JPG, isoDaysAgo, dateDaysAgo };
