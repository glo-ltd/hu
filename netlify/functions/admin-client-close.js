// Closing an engagement. Only ever by a team member pressing the button.
// POST { id, kind: 'success'|'completed'|'closed', amountCents? }
//   success    R19 congratulations with the honour-payment invoice attached
//   completed  R20: 12 months complete, nothing more is owed
//   closed     closed without either email (e.g. he ended it early)
// Every closing: status closed, his pending introduction requests cancelled,
// the 6-month document-deletion clock starts, and R21 asks for feedback.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const I = require('../shared/introductions');
const INV = require('../shared/invoices');
const E = require('../shared/emails');
const { sendEmail } = require('../shared/emails/send');
const { SITE } = require('../shared/emails/layout');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const { id, kind } = ctx.data;
  if (!isUuid(id) || ['success', 'completed', 'closed'].indexOf(kind) === -1) return P.json(400, { error: 'Invalid request.' });
  try {
    const c = (await sb.from('clients').select('*').eq('id', id).maybeSingle()).data;
    if (!c) return P.json(404, { error: 'Not found.' });
    if (['active', 'paused'].indexOf(c.status) === -1) return P.json(409, { error: 'Only an active or paused engagement can be closed.' });
    const to = (c.application && c.application.email) || c.email;
    const firstName = CC.firstName(c.full_name);
    const now = new Date();
    const out = {};

    if (kind === 'success') {
      if (!process.env.INVOICE_PAYMENT_DETAILS) return P.json(409, { error: 'INVOICE_PAYMENT_DETAILS is not set, so the honour invoice would have no bank details.' });
      const fee = CC.C.FEES.honour;
      const amount = ctx.data.amountCents === undefined ? fee.amountCents : ctx.data.amountCents;
      if (!Number.isInteger(amount) || amount <= 0 || amount > 100000 * 100) return P.json(400, { error: 'Please enter a valid amount.' });
      const number = await INV.nextInvoiceNumber(sb, now.getUTCFullYear());
      const ins = await sb.from('client_invoices').insert({ client_id: id, kind: 'honour', number, description: fee.label, amount_cents: amount, currency: CC.C.CURRENCY,
        status: 'sent', created_by: ctx.email, sent_at: now.toISOString(), sent_by: ctx.email }).select('*').single();
      if (ins.error) throw ins.error;
      const pdf = INV.invoicePdfFor(ins.data, c);
      out.emailed = await sendEmail(to, E.R19.build({ firstName, number, amount: INV.money(amount, CC.C.CURRENCY), dueOn: INV.fmtDate(INV.dueAt(ins.data.sent_at)), paymentDetails: process.env.INVOICE_PAYMENT_DETAILS }),
        { attachments: [{ filename: number + '.pdf', content: pdf.toString('base64') }] });
      out.invoice = ins.data;
    } else if (kind === 'completed') {
      out.emailed = await sendEmail(to, E.R20.build({ firstName }));
    }

    await I.cancelForClient(sb, id, 'closed');
    const ft = CC.newClientToken(60);
    const u = await sb.from('clients').update({
      status: 'closed', status_changed_at: now.toISOString(), closed_at: now.toISOString(), closed_kind: kind, closed_by: ctx.email,
      documents_delete_after: CC.addMonths(now, CC.C.DOCUMENT_RETENTION_MONTHS_AFTER_CLOSE).toISOString(),
      access_token_hash: null, access_token_expires_at: null,
      feedback_token_hash: ft.hash, feedback_token_expires_at: ft.expiresAt, feedback_requested_at: now.toISOString(),
    }).eq('id', id);
    if (u.error) throw u.error;
    out.feedbackEmailed = await sendEmail(to, E.R21.build({ firstName, link: SITE + '/feedback#t=' + ft.token, expiresOn: CC.fmtDate(ft.expiresAt) }));
    await CC.logEvent(sb, id, 'closed_' + kind, ctx.email);
    logAction(ctx.email, 'client_close_' + kind, id);
    return P.json(200, Object.assign({ ok: true }, out));
  } catch (e) {
    console.error('admin-client-close failed:', e);
    return P.json(502, { error: 'Could not close just now.' });
  }
};
