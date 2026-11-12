// Invoice numbering and PDFs.
const C = require('./client-config');
const { buildInvoicePdf, money, fmtDate } = require('./invoice-pdf');

// Next HU-YYYY-NNNN for the year. Sent invoices only, so drafts leave no gaps.
async function nextInvoiceNumber(supabase, year) {
  const prefix = C.INVOICE_PREFIX + '-' + year + '-';
  const r = await supabase.from('client_invoices').select('number').ilike('number', prefix + '%');
  if (r.error) throw r.error;
  let max = 0;
  for (const row of r.data || []) {
    const n = Number(String(row.number).slice(prefix.length));
    if (Number.isInteger(n) && n > max) max = n;
  }
  return prefix + String(max + 1).padStart(4, '0');
}

function billTo(client) {
  const a = (client && client.application) || {};
  return [a.legal_name || client.full_name].concat(String(a.address || '').split('\n'), [a.city, a.country || client.country]).filter(Boolean);
}

function dueAt(sentAt) {
  return new Date(Date.parse(sentAt) + C.INVOICE_DUE_DAYS * 86400000).toISOString();
}

function invoicePdfFor(inv, client) {
  return buildInvoicePdf({
    number: inv.number,
    issuedAt: inv.sent_at,
    dueAt: dueAt(inv.sent_at),
    description: inv.description,
    amountCents: inv.amount_cents,
    currency: inv.currency,
    billTo: billTo(client),
    paymentDetails: process.env.INVOICE_PAYMENT_DETAILS || '',
  });
}

module.exports = { nextInvoiceNumber, invoicePdfFor, billTo, dueAt, money, fmtDate };
