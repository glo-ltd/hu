// Invoices. POST { id, op, invoiceId?, amountCents?, description?, kind? }
//   create   draft with the configured fee (James can edit the amount, e.g.
//            for the founding-member discount)
//   update   change a draft's amount or description
//   send     give it the next HU-YYYY-NNNN number, email R7 with the PDF.
//            Only after James has marked his application and declaration as read.
//   paid     mark received: client becomes active, 12-month engagement starts,
//            new private link, R8 welcome.
//   void     cancel a draft or unpaid invoice.
//   pdf      preview the PDF (base64) on the team page.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const I = require('../shared/invoices');
const { sendEmail } = require('../shared/emails/send');
const { clientPageLink } = require('../shared/emails/refs');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

const MAX_CENTS = 100000 * 100;

function cleanAmount(v) {
  return Number.isInteger(v) && v > 0 && v <= MAX_CENTS ? v : null;
}

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const { id, op, invoiceId } = ctx.data;
  if (!isUuid(id) || ['create', 'update', 'send', 'paid', 'void', 'pdf'].indexOf(op) === -1) return P.json(400, { error: 'Invalid request.' });
  try {
    const cr = await sb.from('clients').select('*').eq('id', id).maybeSingle();
    if (cr.error) throw cr.error;
    const c = cr.data;
    if (!c) return P.json(404, { error: 'Not found.' });
    let inv = null;
    if (op !== 'create') {
      const ir = await sb.from('client_invoices').select('*').eq('id', String(invoiceId || '')).eq('client_id', id).maybeSingle();
      if (ir.error) throw ir.error;
      inv = ir.data;
      if (!inv) return P.json(404, { error: 'Invoice not found.' });
    }
    const now = new Date().toISOString();
    let result = {};

    if (op === 'create') {
      const kind = ctx.data.kind === 'honour' ? 'honour' : 'initiation';
      if (kind === 'initiation' && ['checked', 'submitted'].indexOf(c.status) === -1) return P.json(409, { error: 'The initiation invoice is prepared after he sends his application.' });
      if (kind === 'honour') return P.json(409, { error: 'The honour invoice is created from "Relationship success" (phase 4).' });
      const open = await sb.from('client_invoices').select('id').eq('client_id', id).eq('kind', kind).in('status', ['draft', 'sent']);
      if (open.error) throw open.error;
      if ((open.data || []).length) return P.json(409, { error: 'There is already an open invoice of this kind.' });
      const fee = CC.C.FEES[kind];
      const amount = ctx.data.amountCents === undefined ? fee.amountCents : cleanAmount(ctx.data.amountCents);
      if (!amount) return P.json(400, { error: 'Please enter an amount between 1 and 100,000.' });
      const description = typeof ctx.data.description === 'string' && ctx.data.description.trim() ? ctx.data.description.trim().slice(0, 200) : fee.label;
      const ins = await sb.from('client_invoices').insert({ client_id: id, kind, description, amount_cents: amount, currency: CC.C.CURRENCY, status: 'draft', created_by: ctx.email }).select('*').single();
      if (ins.error) throw ins.error;
      result.invoice = ins.data;
    } else if (op === 'update') {
      if (inv.status !== 'draft') return P.json(409, { error: 'Only a draft can be changed. Void it and create a new one.' });
      const fields = {};
      if (ctx.data.amountCents !== undefined) {
        const a = cleanAmount(ctx.data.amountCents);
        if (!a) return P.json(400, { error: 'Please enter an amount between 1 and 100,000.' });
        fields.amount_cents = a;
      }
      if (typeof ctx.data.description === 'string' && ctx.data.description.trim()) fields.description = ctx.data.description.trim().slice(0, 200);
      const u = await sb.from('client_invoices').update(fields).eq('id', inv.id).select('*').single();
      if (u.error) throw u.error;
      result.invoice = u.data;
    } else if (op === 'send') {
      if (inv.status !== 'draft') return P.json(409, { error: 'This invoice has already been sent.' });
      if (!c.declaration_read_at || c.status !== 'checked') return P.json(409, { error: 'Read his application and background declaration first, then mark them as read.' });
      if (!process.env.INVOICE_PAYMENT_DETAILS) return P.json(409, { error: 'INVOICE_PAYMENT_DETAILS is not set in Netlify, so the invoice would have no bank details. Set it, redeploy, then send.' });
      const number = await I.nextInvoiceNumber(sb, new Date().getUTCFullYear());
      const u = await sb.from('client_invoices').update({ number, status: 'sent', sent_at: now, sent_by: ctx.email }).eq('id', inv.id).eq('status', 'draft').select('*').single();
      if (u.error) throw u.error;
      inv = u.data;
      await CC.setStatus(sb, id, 'invoiced');
      const pdf = I.invoicePdfFor(inv, c);
      const ok = await sendEmail((c.application && c.application.email) || c.email, E.R7.build({
        firstName: CC.firstName(c.full_name), number, description: inv.description, amount: I.money(inv.amount_cents, inv.currency),
        dueOn: I.fmtDate(I.dueAt(now)), paymentDetails: process.env.INVOICE_PAYMENT_DETAILS,
      }), { attachments: [{ filename: number + '.pdf', content: pdf.toString('base64') }] });
      result.invoice = inv;
      if (!ok) result.warning = 'The invoice is numbered and marked sent, but the email failed. Download the PDF and send it by hand.';
    } else if (op === 'paid') {
      if (inv.status !== 'sent') return P.json(409, { error: 'Only a sent invoice can be marked paid.' });
      const u = await sb.from('client_invoices').update({ status: 'paid', paid_at: now, marked_paid_by: ctx.email }).eq('id', inv.id).select('*').single();
      if (u.error) throw u.error;
      result.invoice = u.data;
      if (inv.kind === 'initiation') {
        const ends = CC.addMonths(new Date(now), CC.C.ENGAGEMENT_MONTHS).toISOString();
        const t = CC.newClientToken(CC.C.CLIENT_LINK_DAYS);
        await CC.setStatus(sb, id, 'active', { paid_at: now, engagement_starts_at: now, engagement_ends_at: ends, access_token_hash: t.hash, access_token_expires_at: t.expiresAt, link_sent_at: now });
        const ok = await sendEmail((c.application && c.application.email) || c.email, E.R8.build({
          firstName: CC.firstName(c.full_name), link: clientPageLink(t.token), expiresOn: CC.fmtDate(t.expiresAt), endsOn: CC.fmtDate(ends),
        }));
        if (!ok) result.warning = 'Marked paid, but the welcome email failed. Use "Send a new link" to send his link.';
      }
    } else if (op === 'void') {
      if (inv.status === 'paid' || inv.status === 'void') return P.json(409, { error: 'A paid or voided invoice can\'t be voided.' });
      const u = await sb.from('client_invoices').update({ status: 'void', voided_at: now }).eq('id', inv.id).select('*').single();
      if (u.error) throw u.error;
      result.invoice = u.data;
      if (inv.status === 'sent' && c.status === 'invoiced') await CC.setStatus(sb, id, 'checked');
    } else if (op === 'pdf') {
      const preview = Object.assign({}, inv, { number: inv.number || 'DRAFT', sent_at: inv.sent_at || now });
      return P.json(200, { ok: true, pdf: I.invoicePdfFor(preview, c).toString('base64'), filename: (inv.number || 'draft-invoice') + '.pdf' });
    }

    await CC.logEvent(sb, id, 'invoice_' + op, ctx.email, (result.invoice && result.invoice.number) || null);
    logAction(ctx.email, 'client_invoice_' + op, id);
    return P.json(200, Object.assign({ ok: true }, result));
  } catch (e) {
    console.error('admin-client-invoice failed:', e);
    return P.json(502, { error: 'Could not do that just now.' });
  }
};
