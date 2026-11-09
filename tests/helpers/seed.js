const crypto = require('crypto');
const path = require('path');
const { fake, sentEmails } = require('./install-fakes');
const P = require('../../netlify/shared/profile-common');

const FN = path.join(__dirname, '..', '..', 'netlify', 'functions');

function fn(name) { return require(path.join(FN, name + '.js')).handler; }

async function call(name, body, opts) {
  const res = await fn(name)({
    httpMethod: (opts && opts.method) || 'POST',
    headers: (opts && opts.headers) || {},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = JSON.parse(res.body); } catch (e) {}
  return { status: res.statusCode, body: json, raw: res.body };
}

function seedCandidate(over) {
  const t = P.newProfileToken();
  const row = Object.assign({
    id: crypto.randomUUID(),
    full_name: 'Nguyễn Thị Lan',
    date_of_birth: '1994-03-15',
    province: 'Đà Nẵng',
    zalo_number: '0901234567',
    email: 'lan@example.com',
    preferred_language: 'vi',
    about_text: 'Tôi là giáo viên tiếng Anh ở Đà Nẵng.',
    source: 'friend',
    consent_contact_at: '2026-11-01T00:00:00Z',
    consent_processing_at: '2026-11-01T00:00:00Z',
    consent_text_version: 'vi-2026-10-v2',
    consent_profile_sharing_at: null,
    ip_hash: 'iphash-should-never-leak',
    status: 'new',
    needs_zalo_followup: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_token_hash: t.hash,
    profile_token_expires_at: t.expiresAt,
    zalo_confirmed_at: null,
    profile_link_sent_at: null,
  }, over || {});
  fake.tables.candidates.push(row);
  return { id: row.id, token: t.token, row };
}

const FULL_ANSWERS = {
  display_name: 'Lan',
  province: 'Đà Nẵng',
  occupation: 'Giáo viên',
  education: 'university',
  english_level: 'conversational',
  marital_history: 'never_married',
  children: 0,
  wants_children: 'open',
  smoking: 'never',
  drinking: 'socially',
  values: ['family', 'honesty'],
  open_to_us: 'maybe',
  partner_age_range: [27, 52],
  partner_matters: 'Sự tôn trọng và chân thành.',
  about: 'Tôi thích nấu ăn và đi dạo biển.',
};

function adminToken(email, opts) {
  const tok = 'jwt-' + crypto.randomBytes(6).toString('hex');
  fake.users[tok] = Object.assign({ email }, opts || {});
  return { authorization: 'Bearer ' + tok };
}

module.exports = { fake, sentEmails, P, call, seedCandidate, FULL_ANSWERS, adminToken };
