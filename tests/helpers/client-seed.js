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
  countries_lived: 'United Kingdom', agency_or_visa: 'no', legally_free: true,
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

// A client who has completed everything and sent his application.
async function submittedClient(over) {
  const c = seedClient(Object.assign({ application: APPLICATION, declaration: DECLARATION }, over || {}));
  const r = fake.tables.clients.find((x) => x.id === c.id);
  Object.assign(r, { declaration_signed_at: new Date().toISOString(), declaration_typed_name: APPLICATION.legal_name, agreement_version: 'FINAL-TEST', agreement_accepted_at: new Date().toISOString(), status: 'submitted', submitted_at: new Date().toISOString() });
  return c;
}

module.exports = { fake, sentEmails, call, adminToken, CC, seedClient, submittedClient, APPLICATION, DECLARATION, PDF, JPG, isoDaysAgo, dateDaysAgo };

// ------------------------------------------------------------------ phase 2
const P = require('../../netlify/shared/profile-common');

function activeClient(over) {
  return seedClient(Object.assign({ status: 'active', application: APPLICATION, declaration: DECLARATION, paid_at: isoDaysAgo(5),
    engagement_starts_at: isoDaysAgo(5), engagement_ends_at: new Date(Date.now() + 360 * 86400000).toISOString() }, over || {}));
}

const CLIENT_PROFILE = {
  display_name: 'Michael', country: 'United Kingdom', city: 'Bristol', occupation: 'Civil engineer', education: 'university',
  languages: [{ language: 'english', level: 'native' }], marital_history: 'widowed', children: 1, children_live_with: 'no',
  wants_children: 'open', smoking: 'never', drinking: 'socially', values: ['family', 'honesty', 'kindness'],
  where_live: 'my_country', household_finances: 'decide_together', parents_support_view: 'happy',
  her_age_range: [30, 50], must_languages: [{ language: 'english', level: 'conversational' }], min_education: 'college', children_accepted: 'one',
  partner_matters: 'Kindness and honesty.', message: 'Hello, I hope to meet you.',
};

// A woman who could appear on a shortlist. Override anything.
function seedWoman(over, profileOver) {
  const t = P.newProfileToken();
  const id = crypto.randomUUID();
  const row = Object.assign({
    id, full_name: 'Trần Thị Hoa', date_of_birth: '1988-05-01', province: 'Huế', zalo_number: '0912345678', email: 'hoa@example.vn',
    preferred_language: 'vi', about_text: 'x', source: 'friend', consent_contact_at: isoDaysAgo(40), consent_processing_at: isoDaysAgo(40),
    consent_text_version: 'v', consent_profile_sharing_at: isoDaysAgo(30), ip_hash: 'woman-iphash', status: 'profile_complete',
    created_at: isoDaysAgo(40), updated_at: isoDaysAgo(30), profile_token_hash: t.hash, profile_token_expires_at: t.expiresAt,
  }, over || {});
  fake.tables.candidates.push(row);
  const prof = Object.assign({
    candidate_id: id, questions_version: P.QUESTIONS.version, display_name: 'Hoa', photo_paths: [id + '/' + crypto.randomUUID() + '.jpg'],
    consent_photo_sharing_at: isoDaysAgo(30), submitted_at: isoDaysAgo(30), translations: { occupation: 'Teacher', partner_matters: 'Honesty.', about: 'I love cooking.' },
    answers: {
      province: 'Huế', occupation: 'Giáo viên', education: 'university', english_level: 'conversational', marital_history: 'never_married', children: 0,
      wants_children: 'yes', smoking: 'never', drinking: 'never', values: ['family'], open_to_abroad: 'yes', household_finances: 'both_contribute',
      partner_age_range: [35, 55], partner_matters: 'Sự trung thực.', about: 'Tôi thích nấu ăn.',
    },
  }, profileOver || {});
  fake.tables.candidate_profiles.push(Object.assign({ created_at: isoDaysAgo(30), updated_at: isoDaysAgo(30) }, prof));
  prof.photo_paths.forEach((pp) => fake.addObject(pp, Buffer.from([0xff, 0xd8, 0xff, 0xe0])));
  return { id, token: t.token, row, prof };
}

module.exports.activeClient = activeClient;
module.exports.CLIENT_PROFILE = CLIENT_PROFILE;
module.exports.seedWoman = seedWoman;
