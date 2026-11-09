// Phase 3: introduction requests between a client and a woman he chose.
//
// Rules:
// - Only one request per woman may be open (sent or opened) at a time; the
//   others wait as "queued". Only one waits as "ready" for the team to send.
// - Her contact details reach him only after she has read his profile and
//   declaration in her language and given written consent on her decision
//   page, choosing which details to share.
// - She can say no without a reason; her reason (if any) is never shown to him.
// - Withdrawing cancels any pending request for her.
const crypto = require('crypto');
const P = require('./profile-common');
const CC = require('./client-common');
const { SITE } = require('./emails/layout');

const OPEN = ['sent', 'opened'];
const BLOCKING = ['ready', 'sent', 'opened'];          // her "slot" is taken
const PENDING = ['queued', 'ready', 'sent', 'opened'];
const FAILED = ['declined', 'expired', 'cancelled'];   // don't count as "used"
const CONSENT_VERSION = { vi: 'vi-2026-12-introduction-v1', en: 'en-2026-12-introduction-v1' };
const CONTACT_METHODS = ['messages', 'voice', 'video'];

function introRef(id) { return 'I-' + String(id).slice(0, 8).toUpperCase(); }

function newDecisionToken() {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: P.hashToken(token), expiresAt: new Date(Date.now() + CC.C.DECISION_LINK_DAYS * 86400000).toISOString() };
}

function decisionLink(token, lang) {
  return SITE + (lang === 'en' ? '/introduction#t=' : '/vi/gioi-thieu#t=') + token;
}

async function introsForWoman(sb, candidateId, statuses) {
  const r = await sb.from('introductions').select('id, client_id, status, created_at').eq('candidate_id', candidateId).in('status', statuses);
  if (r.error) throw r.error;
  return r.data || [];
}

// Creates requests for his choices, in his order. Each is "ready" unless the
// woman already has a request waiting or open, in which case it queues.
async function createRequests(sb, clientId, candidateIds, firstRank, isReplacement) {
  const out = [];
  for (let i = 0; i < candidateIds.length; i++) {
    const blocking = await introsForWoman(sb, candidateIds[i], BLOCKING);
    const ins = await sb.from('introductions').insert({
      client_id: clientId, candidate_id: candidateIds[i], rank: firstRank + i, is_replacement: !!isReplacement,
      status: blocking.length ? 'queued' : 'ready', status_changed_at: new Date().toISOString(),
    }).select('*').single();
    if (ins.error) throw ins.error;
    out.push(ins.data);
  }
  return out;
}

// When her open request closes, the oldest queued one becomes ready.
async function releaseQueue(sb, candidateId) {
  if ((await introsForWoman(sb, candidateId, BLOCKING)).length) return null;
  const q = (await introsForWoman(sb, candidateId, ['queued'])).sort((a, b) => (a.created_at < b.created_at ? -1 : 1))[0];
  if (!q) return null;
  const u = await sb.from('introductions').update({ status: 'ready', status_changed_at: new Date().toISOString() }).eq('id', q.id).eq('status', 'queued');
  if (u.error) throw u.error;
  return q.id;
}

async function setIntroStatus(sb, intro, status, extra) {
  const fields = Object.assign({ status, status_changed_at: new Date().toISOString() }, extra || {});
  const u = await sb.from('introductions').update(fields).eq('id', intro.id);
  if (u.error) throw u.error;
  if (['declined', 'expired', 'cancelled', 'accepted', 'introduced'].indexOf(status) !== -1) await releaseQueue(sb, intro.candidate_id);
}

// She withdrew (website, Zalo "RÚT" via the team, or deletion): every pending
// request for her, and any accepted one not yet introduced, is cancelled.
async function cancelForCandidate(sb, candidateId, reason) {
  const r = await sb.from('introductions').update({
    status: 'cancelled', status_changed_at: new Date().toISOString(), cancelled_at: new Date().toISOString(), cancel_reason: reason,
    decision_token_hash: null, decision_token_expires_at: null,
  }).eq('candidate_id', candidateId).in('status', PENDING.concat(['accepted'])).select('id, client_id');
  if (r.error) throw r.error;
  return r.data || [];
}

// His engagement was paused or closed: his pending requests are cancelled
// and each woman's next queued request (if any) moves up.
async function cancelForClient(sb, clientId, reason) {
  const r = await sb.from('introductions').update({
    status: 'cancelled', status_changed_at: new Date().toISOString(), cancelled_at: new Date().toISOString(), cancel_reason: reason,
    decision_token_hash: null, decision_token_expires_at: null,
  }).eq('client_id', clientId).in('status', PENDING).select('id, candidate_id');
  if (r.error) throw r.error;
  for (const row of r.data || []) await releaseQueue(sb, row.candidate_id);
  return r.data || [];
}

// "Used" introductions: everything except declined, expired and cancelled.
async function usedCount(sb, clientId) {
  const r = await sb.from('introductions').select('id, status').eq('client_id', clientId);
  if (r.error) throw r.error;
  return (r.data || []).filter((x) => FAILED.indexOf(x.status) === -1).length;
}

// Can "Send to her" go ahead? Her language decides which texts must exist.
function translationGaps(client, prof, lang) {
  if (lang === 'en') return [];
  const gaps = [];
  if (!prof || !String(prof.summary_vi_html || '').replace(/<[^>]+>/g, '').trim()) gaps.push('summary');
  if (prof && prof.message_to_women && !String(prof.message_vi || '').trim()) gaps.push('message');
  const dv = (prof && prof.declaration_vi) || {};
  const decl = client.declaration || {};
  CC.FORM.fields.forEach((f) => {
    if (f.section !== 'declaration' || (f.type !== 'text' && f.type !== 'textarea')) return;
    if (decl[f.id] !== undefined && decl[f.id] !== null && String(decl[f.id]).trim() && !String(dv[f.id] || '').trim()) gaps.push('declaration:' + f.id);
  });
  return gaps;
}

// What she sees about him, in her language. Only his first name, age,
// country and city, his summary, photos, message and background declaration.
async function hisViewForHer(sb, client, prof, lang) {
  const CP = require('./client-profile');
  const vi = lang !== 'en';
  const a = client.application || {};
  const decl = client.declaration || {};
  const dv = prof.declaration_vi || {};
  const yesNo = CC.FORM.yesNoForHer[vi ? 'vi' : 'en'];
  const items = [];
  CC.FORM.fields.forEach((f) => {
    if (f.section !== 'declaration' || !f.forHer || !CC.isShown(f, decl)) return;
    const v = decl[f.id];
    if (v === undefined || v === null || v === '') return;
    let text;
    if (f.type === 'single') text = yesNo[v] || v;
    else if (f.type === 'number') text = String(v);
    else if (f.type === 'date') text = new Date(v + 'T00:00:00Z').toLocaleDateString(vi ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    else text = vi ? (dv[f.id] || v) : v;
    items.push({ id: f.id, label: f.forHer[vi ? 'vi' : 'en'], text, flag: f.type === 'single' && v === 'yes' });
  });
  const photos = (await CP.signedPaths(sb, CC.DOC_BUCKET, prof.photo_paths || [])).map((p) => ({ url: p.url }));
  return {
    firstName: prof.display_name || CC.firstName(client.full_name),
    age: P.ageFrom(a.date_of_birth),
    country: (prof.answers && prof.answers.country) || a.country || null,
    city: (prof.answers && prof.answers.city) || a.city || null,
    summaryHtml: vi ? prof.summary_vi_html : prof.summary_html,
    message: vi ? (prof.message_vi || prof.message_to_women) : prof.message_to_women,
    photos,
    declaration: items,
    checked: { id: client.id_checked_at, certificate: client.certificate_checked_at },
  };
}

module.exports = {
  OPEN, BLOCKING, PENDING, FAILED, CONSENT_VERSION, CONTACT_METHODS,
  introRef, newDecisionToken, decisionLink, createRequests, releaseQueue, setIntroStatus, cancelForCandidate, cancelForClient, usedCount,
  translationGaps, hisViewForHer, introsForWoman,
};

// ------------------------------------------------------------------ her decision link
const { json, parseBody } = require('./request-utils');

const HER_MSG = {
  invalid: { vi: 'Đường link này không còn dùng được. Nếu bạn cần, hãy nhắn cho Heritage Union qua Zalo, hoặc email team@heritage-union.com.', en: 'This link no longer works. If you need help, message Heritage Union on Zalo, or email team@heritage-union.com.' },
  expired: { vi: 'Đường link này đã hết hạn (mỗi lời mời có hiệu lực 30 ngày). Không sao cả, bạn không cần làm gì thêm. Nếu bạn vẫn muốn trả lời, hãy nhắn cho Heritage Union qua Zalo.', en: 'This link has expired (each request lasts 30 days). That\'s fine: you don\'t need to do anything. If you would still like to reply, message Heritage Union on Zalo.' },
  unavailable: { vi: 'Lời mời này không còn hiệu lực. Bạn không cần làm gì thêm.', en: 'This request is no longer active. You don\'t need to do anything.' },
  rate: { vi: 'Có quá nhiều lượt gửi trong một giờ qua. Bạn vui lòng đợi một lát rồi thử lại nhé.', en: 'Too many requests in the last hour. Please wait a little and try again.' },
  failed: { vi: 'Chưa lưu được. Bạn vui lòng thử lại nhé.', en: 'We couldn\'t save just now. Please try again.' },
};

function herErr(status, code, extra) {
  return json(status, Object.assign({ error: HER_MSG[code].vi, error_en: HER_MSG[code].en, code }, extra || {}));
}

// Loads one introduction by its decision token. The token works only for
// that one request, only for 30 days, and never after she withdraws.
async function decisionFromRequest(event) {
  if (event.httpMethod !== 'POST') return { response: json(405, { error: 'Method not allowed.' }) };
  const data = parseBody(event);
  if (!data) return { response: herErr(400, 'invalid') };
  const token = typeof data.token === 'string' ? data.token.trim() : '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { response: herErr(401, 'invalid') };
  const sb = P.serviceClient();
  if (!sb) return { response: json(500, { error: 'Not configured.' }) };
  const hash = P.hashToken(token);
  const r = await sb.from('introductions').select('*').eq('decision_token_hash', hash).maybeSingle();
  if (r.error) { console.error('decision token lookup failed:', r.error); return { response: herErr(502, 'failed') }; }
  const intro = r.data;
  if (!intro) return { response: herErr(401, 'invalid') };
  if (intro.status === 'cancelled') return { response: herErr(410, 'unavailable') };
  const cand = await sb.from('candidates').select('id, full_name, status, preferred_language, zalo_number, email').eq('id', intro.candidate_id).maybeSingle();
  if (cand.error || !cand.data || ['withdrawn', 'deleted'].indexOf(cand.data.status) !== -1) return { response: herErr(401, 'invalid') };
  const decided = ['accepted', 'introduced', 'declined', 'expired'].indexOf(intro.status) !== -1;
  if (!decided && (!intro.decision_token_expires_at || Date.parse(intro.decision_token_expires_at) <= Date.now())) return { response: herErr(401, 'expired') };
  if (P.rateLimited('i:' + hash)) return { response: herErr(429, 'rate') };
  const lang = data.lang === 'en' ? 'en' : data.lang === 'vi' ? 'vi' : cand.data.preferred_language === 'en' ? 'en' : 'vi';
  return { sb, data, intro, candidate: cand.data, lang, tokenHash: hash };
}

module.exports.herErr = herErr;
module.exports.decisionFromRequest = decisionFromRequest;
