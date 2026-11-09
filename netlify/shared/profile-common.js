// Shared helpers for the candidate profile functions (profile-*) and the
// team tool (admin-*). Lives outside netlify/functions so Netlify doesn't
// treat it as a function; esbuild bundles it (and the question JSON) into
// each function that require()s it.
//
// Ground rules this file enforces (see the PR / brief):
// - Her private link token is never stored, only its sha256.
// - Candidate-facing responses never include full name, date of birth,
//   Zalo number, email or ip hash.
// - Photos are only ever under "<candidate_id>/" in the private bucket.

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const QUESTIONS = require('../../assets/data/profile-questions.json');
const { msg } = require('./candidate-common');

const PHOTO_BUCKET = 'candidate-photos';
const TOKEN_TTL_DAYS = 60;
const SIGNED_URL_SECONDS = 600; // 10 minutes
const MAX_PHOTOS = QUESTIONS.photos.max;
const CONSENT_PROFILE_TEXT_VERSION = 'vi-2026-11-profile-v1';
const CONSENT_PROFILE_TEXT_VERSION_EN = 'en-2026-11-profile-v1';
const SITE_URL = 'https://heritage-union.com';
const FROM_EMAIL = 'Heritage Union <team@heritage-union.com>';
const INTERNAL_NOTIFY_EMAIL = 'james@heritage-union.com';
const RATE_LIMIT_PER_HOUR = 120;
const BLOCKED_STATUSES = ['withdrawn', 'deleted'];

// ---------------------------------------------------------------- responses

function json(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

function viError(statusCode, key, extra) {
  // Both languages: the page shows error_en on /my-profile, error on /vi/ho-so.
  return json(statusCode, Object.assign({ error: msg(key, 'vi'), error_en: msg(key, 'en'), code: key }, extra || {}));
}

function parseBody(event) {
  try {
    var data = JSON.parse(event.body || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch (err) {
    return null;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function serviceClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------------------------------------------------------------- tokens

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

// 32 random bytes, base64url. Returns the raw token (to put in her link,
// never stored) plus what to store.
function newProfileToken(now) {
  var token = crypto.randomBytes(32).toString('base64url');
  var expires = new Date((now || Date.now()) + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { token: token, hash: hashToken(token), expiresAt: expires.toISOString() };
}

// English form at /my-profile, Vietnamese at /vi/ho-so. Same token either way.
function profileLink(token, lang) {
  return SITE_URL + (lang === 'en' ? '/my-profile#t=' : '/vi/ho-so#t=') + token;
}

var TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

// Best-effort, per function instance. Production has no rate-limit table
// (the migration is fixed), and the token itself is 256 bits so it cannot be
// guessed; this only stops one link being used to hammer the functions.
var rateBuckets = new Map();
function rateLimited(tokenHash, now) {
  var hour = Math.floor((now || Date.now()) / 3600000);
  var key = tokenHash + ':' + hour;
  var hits = (rateBuckets.get(key) || 0) + 1;
  rateBuckets.set(key, hits);
  if (rateBuckets.size > 5000) {
    rateBuckets.forEach(function (_v, k) { if (!k.endsWith(':' + hour)) rateBuckets.delete(k); });
  }
  return hits > RATE_LIMIT_PER_HOUR;
}

// Columns a profile function may read about her. Deliberately excludes
// zalo_number, email and ip_hash. full_name and date_of_birth are read only
// to compute prefill values (given name, age) and are never returned.
var CANDIDATE_COLUMNS =
  'id, full_name, date_of_birth, province, about_text, status, consent_profile_sharing_at, profile_token_expires_at';

// Validates the token from the request body and loads her candidate row.
// Returns { supabase, candidate, tokenHash } or { response } to return as-is.
async function candidateFromRequest(event) {
  if (event.httpMethod !== 'POST') return { response: json(405, { error: msg('method', 'vi') }) };
  var data = parseBody(event);
  if (!data) return { response: viError(400, 'invalid') };
  var token = typeof data.token === 'string' ? data.token.trim() : '';
  if (!TOKEN_PATTERN.test(token)) return { response: viError(401, 'linkInvalid') };

  var supabase = serviceClient();
  if (!supabase) {
    console.error('Supabase is not configured.');
    return { response: viError(500, 'notConfigured') };
  }
  var tokenHash = hashToken(token);
  var result = await supabase
    .from('candidates')
    .select(CANDIDATE_COLUMNS)
    .eq('profile_token_hash', tokenHash)
    .maybeSingle();
  if (result.error) {
    console.error('Profile token lookup failed:', result.error);
    return { response: viError(502, 'profileSaveFailed') };
  }
  var candidate = result.data;
  if (!candidate || BLOCKED_STATUSES.indexOf(candidate.status) !== -1) {
    return { response: viError(401, 'linkInvalid') };
  }
  if (!candidate.profile_token_expires_at || new Date(candidate.profile_token_expires_at).getTime() <= Date.now()) {
    return { response: viError(401, 'linkExpired') };
  }
  if (rateLimited(tokenHash)) return { response: viError(429, 'profileRateLimited') };
  return { supabase: supabase, candidate: candidate, tokenHash: tokenHash, data: data };
}

// ---------------------------------------------------------------- profile row

var PROFILE_COLUMNS =
  'candidate_id, answers, questions_version, display_name, photo_paths, consent_photo_sharing_at, consent_profile_text_version, confirmed_true_at, submitted_at, created_at, updated_at';

async function loadProfile(supabase, candidateId) {
  var result = await supabase
    .from('candidate_profiles')
    .select(PROFILE_COLUMNS)
    .eq('candidate_id', candidateId)
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

// Creates the row on first save. Never touches translations.
async function saveProfile(supabase, candidateId, existing, fields) {
  if (existing) {
    var upd = await supabase
      .from('candidate_profiles')
      .update(fields)
      .eq('candidate_id', candidateId)
      .select(PROFILE_COLUMNS)
      .single();
    if (upd.error) throw upd.error;
    return upd.data;
  }
  var row = Object.assign({ candidate_id: candidateId, questions_version: QUESTIONS.version, answers: {} }, fields);
  var ins = await supabase.from('candidate_profiles').insert(row).select(PROFILE_COLUMNS).single();
  if (ins.error) throw ins.error;
  return ins.data;
}

// ---------------------------------------------------------------- questions

var QUESTION_BY_ID = {};
QUESTIONS.questions.forEach(function (q) { QUESTION_BY_ID[q.id] = q; });

function isFreeText(q) {
  return q.type === 'text' || q.type === 'textarea';
}

function isShown(q, answers) {
  if (!q.showIf) return true;
  var v = answers[q.showIf.id];
  return typeof v === 'number' && v >= q.showIf.min;
}

function isEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

// Cleans and checks one answer. Returns { value } or { error: key }.
// Empty values come back as { value: null } (= clear the answer).
function cleanAnswer(q, raw) {
  if (isEmpty(raw)) return { value: null };
  var optionValues = (q.options || []).map(function (o) { return o.value; });
  switch (q.type) {
    case 'text':
    case 'textarea': {
      if (typeof raw !== 'string') return { error: 'answerInvalid' };
      var text = raw.normalize('NFC').replace(/\r\n/g, '\n').trim();
      if (q.type === 'text') text = text.replace(/\s+/g, ' ');
      if (!text) return { value: null };
      if (text.length > q.max) return { error: 'answerTooLong' };
      return { value: text };
    }
    case 'single': {
      if (typeof raw !== 'string') return { error: 'answerInvalid' };
      var s = raw.normalize('NFC');
      if (optionValues.indexOf(s) === -1) return { error: 'answerInvalid' };
      return { value: s };
    }
    case 'multi': {
      if (!Array.isArray(raw)) return { error: 'answerInvalid' };
      var seen = [];
      for (var i = 0; i < raw.length; i++) {
        if (typeof raw[i] !== 'string' || optionValues.indexOf(raw[i]) === -1) return { error: 'answerInvalid' };
        if (seen.indexOf(raw[i]) === -1) seen.push(raw[i]);
      }
      if (seen.length > q.max) return { error: 'answerInvalid' };
      return { value: seen };
    }
    case 'number': {
      var n = typeof raw === 'string' && /^\d+$/.test(raw.trim()) ? Number(raw) : raw;
      if (typeof n !== 'number' || !Number.isInteger(n) || n < q.min || n > q.max) return { error: 'answerInvalid' };
      return { value: n };
    }
    case 'range': {
      if (!Array.isArray(raw) || raw.length !== 2) return { error: 'answerInvalid' };
      var lo = raw[0], hi = raw[1];
      if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo < q.min || hi > q.max || lo > hi) {
        return { error: 'answerInvalid' };
      }
      return { value: [lo, hi] };
    }
    default:
      return { error: 'answerInvalid' };
  }
}

// Merges a partial set of answers into the existing ones. Unknown ids are
// rejected, not ignored, so a bad client can't smuggle fields in.
// Returns { answers, displayName, error, field }.
function mergeAnswers(existingAnswers, existingDisplayName, incoming) {
  var answers = Object.assign({}, existingAnswers || {});
  var displayName = existingDisplayName || null;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return { error: 'invalid' };
  }
  var ids = Object.keys(incoming);
  for (var i = 0; i < ids.length; i++) {
    var q = QUESTION_BY_ID[ids[i]];
    if (!q) return { error: 'answerInvalid', field: ids[i] };
    var r = cleanAnswer(q, incoming[ids[i]]);
    if (r.error) return { error: r.error, field: q.id };
    if (q.storage === 'column') {
      displayName = r.value;
    } else if (r.value === null) {
      delete answers[q.id];
    } else {
      answers[q.id] = r.value;
    }
  }
  // Drop answers to questions that are no longer shown (e.g. children -> 0).
  QUESTIONS.questions.forEach(function (q) {
    if (q.storage !== 'column' && !isShown(q, answers)) delete answers[q.id];
  });
  return { answers: answers, displayName: displayName };
}

function valueFor(q, answers, displayName) {
  return q.storage === 'column' ? displayName : answers[q.id];
}

// First required question (shown, in step order) that is unanswered or
// invalid, or null when everything required is answered.
function firstMissing(answers, displayName, maxStep) {
  for (var i = 0; i < QUESTIONS.questions.length; i++) {
    var q = QUESTIONS.questions[i];
    if (maxStep && q.step > maxStep) continue;
    if (!isShown(q, answers)) continue;
    var v = valueFor(q, answers, displayName);
    if (isEmpty(v)) {
      if (q.required) return q;
      continue;
    }
    var r = cleanAnswer(q, v);
    if (r.error || r.value === null) return q;
  }
  return null;
}

// Where she should land when she opens her link: the first step with a
// required question unanswered; once steps 1-4 are done, photos (step 5)
// unless she already has photos, then review (step 6). After submitting,
// review.
function resumeStep(profile) {
  var answers = (profile && profile.answers) || {};
  var displayName = profile && profile.display_name;
  var missing = firstMissing(answers, displayName);
  if (missing) return missing.step;
  if (profile && profile.submitted_at) return 6;
  return profile && profile.photo_paths && profile.photo_paths.length ? 6 : 5;
}

// Rough progress for the team list: steps 1-4 complete out of 4.
function stepsComplete(profile) {
  var answers = (profile && profile.answers) || {};
  var displayName = profile && profile.display_name;
  var done = 0;
  for (var s = 1; s <= 4; s++) {
    var missing = firstMissing(answers, displayName, s);
    if (missing && missing.step <= s) break;
    done = s;
  }
  return done;
}

// ---------------------------------------------------------------- prefill

function givenName(fullName) {
  var parts = String(fullName || '').trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1].slice(0, 40) : '';
}

function ageFrom(dateOfBirth, now) {
  if (!dateOfBirth) return null;
  var dob = new Date(String(dateOfBirth).slice(0, 10) + 'T00:00:00Z');
  if (isNaN(dob.getTime())) return null;
  var d = new Date(now || Date.now());
  var age = d.getUTCFullYear() - dob.getUTCFullYear();
  var m = d.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && d.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

// ---------------------------------------------------------------- photos

function photoPathPattern(candidateId) {
  var id = String(candidateId).replace(/[^0-9a-f-]/gi, '');
  return new RegExp('^' + id + '/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.jpg$');
}

function isOwnPhotoPath(candidateId, path) {
  return typeof path === 'string' && photoPathPattern(candidateId).test(path);
}

async function signedPhotos(supabase, paths) {
  if (!paths || !paths.length) return [];
  var res = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (res.error) {
    console.error('Signed photo URLs failed:', res.error);
    return paths.map(function (p) { return { path: p, url: null }; });
  }
  return paths.map(function (p) {
    var hit = (res.data || []).find(function (d) { return d.path === p; });
    return { path: p, url: hit && !hit.error ? hit.signedUrl : null };
  });
}

// Removes every object in her folder (not just photo_paths), so an upload
// that was never confirmed can't be left behind.
async function deleteAllPhotos(supabase, candidateId) {
  var bucket = supabase.storage.from(PHOTO_BUCKET);
  var listed = await bucket.list(String(candidateId), { limit: 100 });
  if (listed.error) throw listed.error;
  var paths = (listed.data || [])
    .filter(function (o) { return o && o.name; })
    .map(function (o) { return candidateId + '/' + o.name; });
  if (!paths.length) return 0;
  var removed = await bucket.remove(paths);
  if (removed.error) throw removed.error;
  return paths.length;
}

// Withdrawal side-effects shared by withdraw-candidate and admin-status:
// clears her link, both sharing consents, and deletes photos at once.
async function applyWithdrawal(supabase, candidateId) {
  var c = await supabase
    .from('candidates')
    .update({ profile_token_hash: null, profile_token_expires_at: null, consent_profile_sharing_at: null })
    .eq('id', candidateId);
  if (c.error) console.error('Withdraw: clearing token/consent failed for', candidateId, c.error);
  var p = await supabase
    .from('candidate_profiles')
    .update({ consent_photo_sharing_at: null, photo_paths: [] })
    .eq('candidate_id', candidateId);
  if (p.error) console.error('Withdraw: clearing profile photos failed for', candidateId, p.error);
  try {
    await deleteAllPhotos(supabase, candidateId);
  } catch (err) {
    console.error('Withdraw: deleting photos failed for', candidateId, err);
  }
}

module.exports = {
  QUESTIONS,
  QUESTION_BY_ID,
  PHOTO_BUCKET,
  MAX_PHOTOS,
  SIGNED_URL_SECONDS,
  CONSENT_PROFILE_TEXT_VERSION,
  CONSENT_PROFILE_TEXT_VERSION_EN,
  SITE_URL,
  FROM_EMAIL,
  INTERNAL_NOTIFY_EMAIL,
  RATE_LIMIT_PER_HOUR,
  json,
  viError,
  parseBody,
  escapeHtml,
  serviceClient,
  hashToken,
  newProfileToken,
  profileLink,
  rateLimited,
  candidateFromRequest,
  loadProfile,
  saveProfile,
  isFreeText,
  isShown,
  cleanAnswer,
  mergeAnswers,
  firstMissing,
  resumeStep,
  stepsComplete,
  givenName,
  ageFrom,
  isOwnPhotoPath,
  signedPhotos,
  deleteAllPhotos,
  applyWithdrawal,
  _resetRateLimits: function () { rateBuckets.clear(); },
};
