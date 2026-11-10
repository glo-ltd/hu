// Shared helpers for the client functions (client-*, admin-client-*).
//
// His private page is /client#t=<token>: 32 random bytes, base64url, only the
// sha256 stored, one live link per client (a new link replaces the old).
const crypto = require('crypto');
const P = require('./profile-common');
const C = require('./client-config');
const FORM = require('../../assets/data/client-application.json');
const AGREEMENT = require('../../assets/data/client-agreement.json');
const { json, parseBody } = require('./request-utils');

const DOC_BUCKET = 'client-documents';
const DOC_SIGNED_SECONDS = 600;

// Statuses in which his private page opens.
const PAGE_STATUSES = ['invited', 'applying', 'submitted', 'checked', 'invoiced', 'active', 'paused'];
const STATUSES = ['enquiry', 'call_booked', 'call_held', 'thinking', 'invited', 'applying', 'submitted', 'checked', 'invoiced', 'active', 'paused', 'not_a_fit', 'closed'];

const MSG = {
  notOpen: 'This page isn\'t available yet. We\'ll be in touch as soon as it is.',
  linkInvalid: 'This link no longer works. If you need a new one, simply reply to any email from Heritage Union, or write to team@heritage-union.com.',
  linkExpired: 'This link has expired. Simply reply to any email from Heritage Union, or write to team@heritage-union.com, and we\'ll send you a new one.',
  rateLimited: 'Too many requests from this link in the last hour. Please wait a little and try again.',
  invalid: 'Something wasn\'t quite right with that request. Please reload the page and try again.',
  saveFailed: 'We couldn\'t save just now. Your answers are still on this page; please try again.',
};

function err(status, code, extra) {
  return json(status, Object.assign({ error: MSG[code] || MSG.invalid, code }, extra || {}));
}

function hashToken(t) { return P.hashToken(t); }

function newClientToken(days) {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token), expiresAt: new Date(Date.now() + days * 86400000).toISOString() };
}

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

// Columns his own page may read about him. Never the token hash, IP hashes
// or which team member checked what.
const OWN_COLUMNS = 'id, full_name, email, status, application, declaration, declaration_typed_name, declaration_signed_at, declaration_version, ' +
  'agreement_version, agreement_typed_name, agreement_accepted_at, submitted_at, declaration_read_at, ' +
  'paid_at, engagement_starts_at, engagement_ends_at, paused_at, access_token_expires_at';

// Validates the token in the body and loads his row.
// Returns { supabase, client, data, tokenHash } or { response }.
async function clientFromRequest(event) {
  if (event.httpMethod !== 'POST') return { response: json(405, { error: 'Method not allowed.' }) };
  const data = parseBody(event);
  if (!data) return { response: err(400, 'invalid') };
  if (!C.clientSignupsOpen()) return { response: err(403, 'notOpen') };
  const token = typeof data.token === 'string' ? data.token.trim() : '';
  if (!TOKEN_PATTERN.test(token)) return { response: err(401, 'linkInvalid') };
  const supabase = P.serviceClient();
  if (!supabase) return { response: json(500, { error: 'Not configured.' }) };
  const tokenHash = hashToken(token);
  const res = await supabase.from('clients').select(OWN_COLUMNS).eq('access_token_hash', tokenHash).maybeSingle();
  if (res.error) { console.error('client token lookup failed:', res.error); return { response: err(502, 'saveFailed') }; }
  const client = res.data;
  if (!client || PAGE_STATUSES.indexOf(client.status) === -1) return { response: err(401, 'linkInvalid') };
  if (!client.access_token_expires_at || Date.parse(client.access_token_expires_at) <= Date.now()) return { response: err(401, 'linkExpired') };
  if (P.rateLimited('c:' + tokenHash)) return { response: err(429, 'rateLimited') };
  return { supabase, client, data, tokenHash };
}

async function logEvent(supabase, clientId, kind, actor, detail) {
  const r = await supabase.from('client_events').insert({ client_id: clientId, kind, actor, detail: detail || null });
  if (r.error) console.error('client_events insert failed:', r.error);
  console.log(JSON.stringify({ client_event: kind, by: actor, client_id: clientId, at: new Date().toISOString() }));
}

async function setStatus(supabase, clientId, status, extra) {
  if (STATUSES.indexOf(status) === -1) throw new Error('bad status ' + status);
  const fields = Object.assign({ status, status_changed_at: new Date().toISOString() }, extra || {});
  const r = await supabase.from('clients').update(fields).eq('id', clientId);
  if (r.error) throw r.error;
}

function firstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || '';
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  if (d.getUTCDate() < day) d.setUTCDate(0); // e.g. 31 Jan + 1 month -> 28/29 Feb
  return d;
}

// ------------------------------------------------------------------ forms

const FIELD_BY_ID = {};
FORM.fields.forEach((f) => { FIELD_BY_ID[f.id] = f; });

function isEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

function isShown(f, values) {
  if (!f.showIf) return true;
  const v = values[f.showIf.id];
  if (f.showIf.equals !== undefined) return v === f.showIf.equals;
  if (f.showIf.min !== undefined) return typeof v === 'number' && v >= f.showIf.min;
  return true;
}

function isAdult(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const dob = Date.parse(dateString + 'T00:00:00Z');
  if (isNaN(dob)) return false;
  const now = new Date();
  const cutoff = Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate());
  return dob <= cutoff && new Date(dob).getUTCFullYear() > 1900;
}


const FIELD_ERRORS = {
  invalid: 'Please check this answer.',
  tooLong: 'This answer is too long.',
  under18: 'You must be 18 or over to apply.',
  email: 'Please check this email address.',
  required: 'Please answer this question.',
};

// Cleans one value. Returns { value } (null = clear) or { error }.
function cleanValue(f, raw) {
  if (isEmpty(raw)) return { value: null };
  const optionValues = (f.options || []).map((o) => o.value);
  switch (f.type) {
    case 'text': case 'textarea': case 'tel': case 'email': {
      if (typeof raw !== 'string') return { error: 'invalid' };
      let t = raw.normalize('NFC').replace(/\r\n/g, '\n').trim();
      if (f.type !== 'textarea') t = t.replace(/\s+/g, ' ');
      if (!t) return { value: null };
      if (t.length > f.max) return { error: 'tooLong' };
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return { error: 'email' };
      return { value: t };
    }
    case 'date': {
      if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw) || isNaN(Date.parse(raw + 'T00:00:00Z'))) return { error: 'invalid' };
      if (f.id === 'date_of_birth' && !isAdult(raw)) return { error: 'under18' };
      return { value: raw };
    }
    case 'confirm':
      // A statement he confirms by ticking (e.g. "legally free to enter this agreement").
      if (raw !== true) return { error: 'invalid' };
      return { value: true };
    case 'single':
      if (typeof raw !== 'string' || optionValues.indexOf(raw) === -1) return { error: 'invalid' };
      return { value: raw };
    case 'number': {
      const n = typeof raw === 'string' && /^\d+$/.test(raw.trim()) ? Number(raw) : raw;
      if (!Number.isInteger(n) || n < f.min || n > f.max) return { error: 'invalid' };
      return { value: n };
    }
    case 'languages': {
      if (!Array.isArray(raw) || raw.length > f.max) return { error: 'invalid' };
      const levels = f.levels.map((l) => l.value);
      const out = [];
      for (const item of raw) {
        if (!item || typeof item.language !== 'string' || levels.indexOf(item.level) === -1) return { error: 'invalid' };
        const lang = item.language.normalize('NFC').trim().replace(/\s+/g, ' ');
        if (!lang) continue;
        if (lang.length > 40) return { error: 'tooLong' };
        out.push({ language: lang, level: item.level });
      }
      return { value: out.length ? out : null };
    }
    default:
      return { error: 'invalid' };
  }
}

// Merges a partial set of answers for one section into the stored ones.
// Unknown ids, document fields and other sections' ids are refused.
function mergeSection(section, existing, incoming) {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return { error: 'invalid' };
  const values = Object.assign({}, existing || {});
  for (const id of Object.keys(incoming)) {
    const f = FIELD_BY_ID[id];
    if (!f || f.section !== section || f.type === 'document') return { error: 'invalid', field: id };
    const r = cleanValue(f, incoming[id]);
    if (r.error) return { error: r.error, field: id, message: FIELD_ERRORS[r.error] };
    if (r.value === null) delete values[id]; else values[id] = r.value;
  }
  FORM.fields.forEach((f) => { if (f.section === section && !isShown(f, values)) delete values[f.id]; });
  return { values };
}

// First required field in a section that is missing or no longer valid.
function firstMissing(section, values, docs) {
  for (const f of FORM.fields) {
    if (f.section !== section || !isShown(f, values)) continue;
    if (f.type === 'document') {
      if (f.required && !(docs && docs[f.kind])) return f;
      continue;
    }
    const v = values[f.id];
    if (isEmpty(v)) { if (f.required) return f; continue; }
    const r = cleanValue(f, v);
    if (r.error || r.value === null) return f;
  }
  return null;
}

function agreementIsDraft() {
  return /DRAFT/i.test(AGREEMENT.version);
}

function normName(s) {
  return String(s || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

// ------------------------------------------------------------------ documents
// Heritage Union does not carry out background checks. The only documents a
// client uploads are an official certificate a woman asks him for (phase 3,
// optional) and his profile photos (phase 2), under <client_id>/certificate/
// and <client_id>/photos/ in the private client-documents bucket.
const EXT_BY_TYPE = C.DOCUMENT_TYPES;

function docPath(clientId, kind, ext) {
  return clientId + '/' + kind + '/' + crypto.randomUUID() + '.' + ext;
}

function isOwnDocPath(clientId, kind, path) {
  const id = String(clientId).replace(/[^0-9a-f-]/gi, '');
  return typeof path === 'string' &&
    new RegExp('^' + id + '/' + kind + '/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(pdf|jpg|png)$').test(path);
}

// Checks the first bytes really are a PDF, JPEG or PNG matching the extension.
function sniffMatches(bytes, path) {
  const b = Buffer.from(bytes.slice(0, 8));
  const ext = path.split('.').pop();
  if (ext === 'pdf') return b.slice(0, 5).toString('latin1') === '%PDF-';
  if (ext === 'jpg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (ext === 'png') return b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return false;
}

async function deleteClientFolder(supabase, clientId) {
  const bucket = supabase.storage.from(DOC_BUCKET);
  let removed = 0;
  for (const sub of ['certificate', 'photos']) {
    const listed = await bucket.list(clientId + '/' + sub, { limit: 100 });
    if (listed.error) throw listed.error;
    const paths = (listed.data || []).filter((o) => o && o.name).map((o) => clientId + '/' + sub + '/' + o.name);
    if (paths.length) {
      const r = await bucket.remove(paths);
      if (r.error) throw r.error;
      removed += paths.length;
    }
  }
  return removed;
}

// ------------------------------------------------------------------ views

// What his own page needs. His own details are fine to show him, but never
// hashes, internal emails or the payment details (those are in his invoice).
function ownView(client, invoices) {
  return {
    ok: true,
    status: client.status,
    firstName: firstName(client.full_name),
    application: client.application || {},
    declaration: client.declaration || {},
    declarationSigned: !!client.declaration_signed_at,
    declarationTypedName: client.declaration_typed_name || '',
    agreement: {
      version: AGREEMENT.version,
      draft: agreementIsDraft(),
      acceptedVersion: client.agreement_version || null,
      acceptedAt: client.agreement_accepted_at || null,
    },
    declarationRead: !!client.declaration_read_at,
    submittedAt: client.submitted_at || null,
    paidAt: client.paid_at || null,
    engagementEndsAt: client.engagement_ends_at || null,
    invoices: (invoices || []).filter((i) => i.status === 'sent' || i.status === 'paid').map((i) => ({
      id: i.id, number: i.number, description: i.description, amountCents: i.amount_cents, currency: i.currency, status: i.status, sentAt: i.sent_at, paidAt: i.paid_at,
    })),
    formVersion: FORM.version,
  };
}

async function ownState(supabase, clientId) {
  const c = await supabase.from('clients').select(OWN_COLUMNS).eq('id', clientId).single();
  if (c.error) throw c.error;
  const inv = await supabase.from('client_invoices').select('id, number, description, amount_cents, currency, status, sent_at, paid_at').eq('client_id', clientId);
  if (inv.error) throw inv.error;
  return ownView(c.data, inv.data);
}

module.exports = {
  C, FORM, AGREEMENT, FIELD_BY_ID, DOC_BUCKET, DOC_SIGNED_SECONDS, EXT_BY_TYPE, PAGE_STATUSES, STATUSES, MSG, FIELD_ERRORS,
  err, hashToken, newClientToken, clientFromRequest, logEvent, setStatus, firstName, fmtDate, addMonths,
  isShown, isAdult, cleanValue, mergeSection, firstMissing, agreementIsDraft, normName,
  docPath, isOwnDocPath, sniffMatches, deleteClientFolder, ownView, ownState, OWN_COLUMNS,
};
