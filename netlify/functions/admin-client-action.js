// Every button on the client page of the team tool, except invoices.
// POST { id, action, ... }. Each action is logged (who, what; no personal data).
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const { sendEmail } = require('../shared/emails/send');
const { clientPageLink } = require('../shared/emails/refs');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');
const { feePdfAttachment } = require('../shared/fee-pdf');

const PRE_INVOICE = ['enquiry', 'call_booked', 'call_held', 'thinking', 'invited', 'applying', 'submitted', 'checked'];

function contactEmail(c) { return (c.application && c.application.email) || c.email; }

async function newLink(supabase, c, days) {
  const t = CC.newClientToken(days);
  const now = new Date().toISOString();
  const r = await supabase.from('clients').update({ access_token_hash: t.hash, access_token_expires_at: t.expiresAt, link_sent_at: now }).eq('id', c.id);
  if (r.error) throw r.error;
  return { link: clientPageLink(t.token), expiresOn: CC.fmtDate(t.expiresAt) };
}

const ACTIONS = {
  // Stage 2: the free call
  async call_booked(sb, c) {
    if (['enquiry', 'thinking'].indexOf(c.status) === -1) return 'Only an enquiry can be marked as call booked.';
    await CC.setStatus(sb, c.id, 'call_booked', { call_booked_at: new Date().toISOString() });
  },
  async call_held(sb, c) {
    if (['enquiry', 'call_booked'].indexOf(c.status) === -1) return 'Mark the call as booked first.';
    await CC.setStatus(sb, c.id, 'call_held', { call_held_at: new Date().toISOString() });
  },
  async thinking(sb, c) {
    if (['call_booked', 'call_held'].indexOf(c.status) === -1) return 'Use this after the call.';
    await CC.setStatus(sb, c.id, 'thinking', { thinking_since: new Date().toISOString() });
  },
  async invite(sb, c) {
    if (!CC.C.clientSignupsOpen()) return 'Client sign-ups are switched off (CLIENT_SIGNUPS_OPEN is not true), so application links can\'t be sent yet.';
    if (['call_booked', 'call_held', 'thinking'].indexOf(c.status) === -1) return 'Invite after the call (status must be call booked, call held or thinking it over).';
    const l = await newLink(sb, c, CC.C.APPLICATION_LINK_DAYS);
    await CC.setStatus(sb, c.id, 'invited', { invited_at: new Date().toISOString() });
    const ok = await sendEmail(contactEmail(c), E.R3.build({ firstName: CC.firstName(c.full_name), link: l.link, expiresOn: l.expiresOn }), { attachments: feePdfAttachment() || undefined });
    return ok ? null : { warning: 'Status updated, but the email could not be sent. Use "Send a new link" to try again.' };
  },
  async not_a_fit(sb, c) {
    if (PRE_INVOICE.indexOf(c.status) === -1) return 'This can only be used before an invoice is sent.';
    await CC.setStatus(sb, c.id, 'not_a_fit', { declined_at: new Date().toISOString(), access_token_hash: null, access_token_expires_at: null });
    const ok = await sendEmail(contactEmail(c), E.R4.build({ firstName: CC.firstName(c.full_name) }));
    return ok ? null : { warning: 'Status updated, but the email could not be sent.' };
  },
  async resend_link(sb, c) {
    if (!CC.C.clientSignupsOpen()) return 'Client sign-ups are switched off (CLIENT_SIGNUPS_OPEN is not true).';
    if (CC.PAGE_STATUSES.indexOf(c.status) === -1) return 'He has no private page at this stage.';
    const applying = c.status === 'invited' || c.status === 'applying';
    const l = await newLink(sb, c, applying ? CC.C.APPLICATION_LINK_DAYS : CC.C.CLIENT_LINK_DAYS);
    const ok = await sendEmail(contactEmail(c), E.R5.build({ firstName: CC.firstName(c.full_name), link: l.link, expiresOn: l.expiresOn, purpose: applying ? 'application' : 'page' }));
    return ok ? null : { warning: 'A new link was made, but the email could not be sent.' };
  },
  // Stage 3: James reads his application and sworn declaration. Heritage
  // Union does not check them; reading them is what unlocks the invoice.
  async mark_read(sb, c, email) {
    if (c.status !== 'submitted') return 'He hasn\'t sent his application yet, or it is already marked as read.';
    await CC.setStatus(sb, c.id, 'checked', { declaration_read_at: new Date().toISOString(), declaration_read_by: email });
  },
  async unmark_read(sb, c) {
    if (c.status !== 'checked') return 'Too late to change: an invoice has been sent.';
    await CC.setStatus(sb, c.id, 'submitted', { declaration_read_at: null, declaration_read_by: null });
  },
};

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const { id, action } = ctx.data;
  if (!isUuid(id) || !Object.prototype.hasOwnProperty.call(ACTIONS, action)) return P.json(400, { error: 'Invalid request.' });
  try {
    const c = await ctx.supabase.from('clients').select('*').eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    if (!c.data) return P.json(404, { error: 'Not found.' });
    const out = await ACTIONS[action](ctx.supabase, c.data, ctx.email);
    if (typeof out === 'string') return P.json(409, { error: out });
    await CC.logEvent(ctx.supabase, id, action, ctx.email);
    logAction(ctx.email, 'client_' + action, id);
    return P.json(200, Object.assign({ ok: true }, out || {}));
  } catch (e) {
    console.error('admin-client-action failed:', e);
    return P.json(502, { error: 'Could not do that just now.' });
  }
};

exports.ACTIONS = Object.keys(ACTIONS);
