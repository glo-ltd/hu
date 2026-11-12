// Phase 2 helpers: his profile (F4), matching ticks, and the consent-limited
// view of a woman's profile that a client may see.
//
// Ground rules enforced here:
// - Matching uses only facts she chose to share in her own answers. No
//   scores, no ranking: just ticks and crosses per must-have.
// - A client only ever sees women who consented to sharing, and photos only
//   with photo consent. Never her surname, date of birth, Zalo, email or
//   anything beyond her display name, age, province and her answers.
const P = require('./profile-common');
const CC = require('./client-common');
const PQ = require('../../assets/data/client-profile-questions.json');

const PQ_BY_ID = {};
PQ.questions.forEach((q) => { PQ_BY_ID[q.id] = q; });

const LEVEL = { none: 0, basic: 1, conversational: 2, fluent: 3, native: 4 };
const EDU = { secondary: 1, vocational: 2, college: 3, university: 4, postgraduate: 5 };
const PHOTO_PREFIX = 'photos';

// ------------------------------------------------------------------ his answers

function isEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0); }

function isShown(q, answers) {
  if (!q.showIf) return true;
  const v = answers[q.showIf.id];
  return typeof v === 'number' && v >= q.showIf.min;
}

function cleanLangReq(q, raw) {
  if (isEmpty(raw)) return { value: null };
  if (!Array.isArray(raw) || raw.length > q.max) return { error: 'answerInvalid' };
  const langs = q.options.map((o) => o.value);
  const levels = q.levels.map((l) => l.value);
  const out = [];
  for (const it of raw) {
    if (!it || langs.indexOf(it.language) === -1 || levels.indexOf(it.level) === -1) return { error: 'answerInvalid' };
    if (out.some((o) => o.language === it.language)) return { error: 'answerInvalid' };
    out.push({ language: it.language, level: it.level });
  }
  return { value: out.length ? out : null };
}

function cleanAnswer(q, raw) {
  if (q.type === 'langreq') return cleanLangReq(q, raw);
  return P.cleanAnswer(q, raw); // same rules as the women's form for every shared type
}

// Merges a partial set of answers. display_name and message live in columns.
function mergeAnswers(existing, incoming) {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return { error: 'answerInvalid' };
  const answers = Object.assign({}, existing.answers || {});
  let displayName = existing.display_name || null;
  let message = existing.message_to_women || null;
  for (const id of Object.keys(incoming)) {
    const q = PQ_BY_ID[id];
    if (!q) return { error: 'answerInvalid', field: id };
    const r = cleanAnswer(q, incoming[id]);
    if (r.error) return { error: r.error, field: id };
    if (q.storage === 'column') displayName = r.value;
    else if (q.storage === 'message') message = r.value;
    else if (r.value === null) delete answers[id];
    else answers[id] = r.value;
  }
  PQ.questions.forEach((q) => { if (!q.storage && !isShown(q, answers)) delete answers[q.id]; });
  if (Array.isArray(answers.her_age_range) && answers.her_age_range[0] > answers.her_age_range[1]) return { error: 'answerInvalid', field: 'her_age_range' };
  return { answers, displayName, message };
}

function valueOf(q, profile) {
  if (q.storage === 'column') return profile.display_name;
  if (q.storage === 'message') return profile.message_to_women;
  return (profile.answers || {})[q.id];
}

function firstMissing(profile) {
  for (const q of PQ.questions) {
    if (!isShown(q, profile.answers || {})) continue;
    const v = valueOf(q, profile);
    if (isEmpty(v)) { if (q.required) return q; continue; }
    const r = cleanAnswer(q, v);
    if (r.error || r.value === null) return q;
  }
  if ((profile.photo_paths || []).length < PQ.photos.min) return { id: 'photos', step: PQ.photos.step, label: 'Photos' };
  return null;
}

// Prefill from his application, so he doesn't type things twice.
function prefill(client) {
  const a = client.application || {};
  const langKeys = PQ_BY_ID.languages.options.map((o) => o.value);
  const languages = (a.languages || []).map((x) => {
    const key = String(x.language || '').trim().toLowerCase();
    return langKeys.indexOf(key) !== -1 && key !== 'other' ? { language: key, level: x.level } : { language: 'other', other: x.language, level: x.level };
  });
  const out = {
    display_name: CC.firstName(a.legal_name || client.full_name).slice(0, 40),
    country: a.country || client.country || '',
    city: a.city || '',
    occupation: a.occupation || '',
    education: a.education || null,
    languages: languages.length ? languages : null,
    marital_history: ['never_married', 'divorced', 'widowed'].indexOf(a.marital_status) !== -1 ? a.marital_status : null,
    children: typeof a.children_count === 'number' ? Math.min(a.children_count, 10) : null,
  };
  return out;
}

// ------------------------------------------------------------------ photos

function photoPath(clientId) { return clientId + '/' + PHOTO_PREFIX + '/' + require('crypto').randomUUID() + '.jpg'; }
function isOwnPhotoPath(clientId, path) { return CC.isOwnDocPath(clientId, PHOTO_PREFIX, path) && /\.jpg$/.test(path); }

async function signedPaths(supabase, bucket, paths) {
  if (!paths || !paths.length) return [];
  const r = await supabase.storage.from(bucket).createSignedUrls(paths, P.SIGNED_URL_SECONDS);
  if (r.error) { console.error('signed URLs failed:', r.error); return paths.map((p) => ({ path: p, url: null })); }
  return paths.map((p) => { const hit = (r.data || []).find((d) => d.path === p); return { path: p, url: hit && !hit.error ? hit.signedUrl : null }; });
}

// ------------------------------------------------------------------ matching

// Her languages, from her own answers only: Vietnamese (every candidate is
// Vietnamese and writes her profile in Vietnamese), English level, others.
function herLanguages(answers) {
  const out = { vietnamese: LEVEL.native };
  if (answers.english_level) out.english = LEVEL[answers.english_level] || 0;
  (answers.other_languages || []).forEach((x) => { if (x.language !== 'other') out[x.language] = Math.max(out[x.language] || 0, LEVEL[x.level] || 0); });
  return out;
}

// Ticks and crosses for each of his must-haves. No score, no sorting by fit.
function ticks(client, clientProfile, cand, candProfile) {
  const his = clientProfile.answers || {};
  const hers = (candProfile && candProfile.answers) || {};
  const herAge = P.ageFrom(cand.date_of_birth);
  const hisAge = P.ageFrom((client.application || {}).date_of_birth);
  const out = {};

  const hr = his.her_age_range, sr = hers.partner_age_range;
  const herOk = !!(hr && herAge !== null && herAge >= hr[0] && herAge <= hr[1]);
  const hisOk = !!(sr && hisAge !== null && hisAge >= sr[0] && hisAge <= sr[1]);
  out.age = { ok: herOk && hisOk, detail: (herOk ? 'Her age is in your range' : 'Her age is outside your range') + '; ' + (hisOk ? 'yours is in hers' : 'yours is outside hers') };

  if (his.where_live === 'my_country') {
    const ok = ['yes', 'maybe'].indexOf(hers.open_to_abroad) !== -1;
    out.abroad = { ok, detail: ok ? 'Open to living abroad' : 'Prefers to stay in Vietnam' };
  } else {
    out.abroad = { ok: true, detail: 'Not needed: you are open to living in Vietnam or elsewhere' };
  }

  const kids = typeof hers.children === 'number' ? hers.children : null;
  const ca = his.children_accepted;
  const kidsOk = ca === 'any' ? true : kids === null ? false : ca === 'none' ? kids === 0 : ca === 'one' ? kids <= 1 : false;
  out.children = { ok: kidsOk, detail: kids === null ? 'Not answered' : kids + (kids === 1 ? ' child' : ' children') };

  const min = his.min_education;
  const eduOk = !min || min === 'any' ? true : (EDU[hers.education] || 0) >= (EDU[min] || 99);
  out.education = { ok: eduOk, detail: hers.education ? 'Her education: ' + hers.education.replace('_', ' ') : 'Not answered' };

  const req = his.must_languages || [];
  const hl = herLanguages(hers);
  const met = req.filter((r) => (hl[r.language] || 0) >= LEVEL[r.level]);
  out.language = { ok: !req.length || met.length > 0, detail: !req.length ? 'No language requirement' : met.length ? 'Shares ' + met.map((m) => m.language.charAt(0).toUpperCase() + m.language.slice(1)).join(', ') : 'No shared language at your level' };

  const keys = ['age', 'abroad', 'children', 'education', 'language'];
  return { checks: out, count: keys.filter((k) => out[k].ok).length, all: keys.every((k) => out[k].ok) };
}

// ------------------------------------------------------------------ what a client may see of her

// Free-text answers she wrote herself, which need an English translation
// before a client may see them (unless she wrote in English).
function untranslated(cand, candProfile) {
  if (cand.preferred_language === 'en') return [];
  const answers = (candProfile && candProfile.answers) || {};
  const tr = (candProfile && candProfile.translations) || {};
  return P.QUESTIONS.questions.filter((q) => q.step <= 4 && P.isFreeText(q) && q.id !== 'display_name' && !isEmpty(answers[q.id]) && !String(tr[q.id] || '').trim()).map((q) => q.id);
}

function eligible(cand) {
  return cand && cand.status === 'profile_complete' && !!cand.consent_profile_sharing_at;
}

function optLabel(q, v) { const o = (q.options || []).find((x) => x.value === v); return o ? o.label.en : v; }

// Her card for a client: display name, age, province and her answers in
// English. Photos only with photo consent. Nothing else.
async function clientCard(supabase, cand, prof) {
  const answers = prof.answers || {};
  const tr = prof.translations || {};
  const items = [];
  for (const q of P.QUESTIONS.questions) {
    if (q.step > 4 || q.id === 'display_name' || q.id === 'province' || !P.isShown(q, answers)) continue;
    const v = answers[q.id];
    if (isEmpty(v)) continue;
    let text;
    if (P.isFreeText(q)) text = cand.preferred_language === 'en' ? v : (tr[q.id] || null);
    else if (q.type === 'single') text = optLabel(q, v);
    else if (q.type === 'multi') text = v.map((x) => optLabel(q, x)).join(', ');
    else if (q.type === 'range') text = v[0] + ' to ' + v[1];
    else if (q.type === 'languages') text = v.map((x) => (x.language === 'other' ? x.other : optLabel(q, x.language)) + ' (' + optLabel({ options: q.levels }, x.level).toLowerCase() + ')').join(', ');
    else text = String(v);
    if (text === null) continue;
    items.push({ id: q.id, label: q.label.team || q.label.en, text, step: q.step });
  }
  const photos = prof.consent_photo_sharing_at ? (await signedPaths(supabase, P.PHOTO_BUCKET, prof.photo_paths || [])).map((p) => ({ url: p.url })) : [];
  return {
    id: cand.id,
    displayName: prof.display_name,
    age: P.ageFrom(cand.date_of_birth),
    province: answers.province || null,
    items,
    photos,
  };
}

module.exports = { PQ, PQ_BY_ID, LEVEL, cleanAnswer, mergeAnswers, firstMissing, prefill, photoPath, isOwnPhotoPath, signedPaths, ticks, herLanguages, untranslated, eligible, clientCard, isShown };
