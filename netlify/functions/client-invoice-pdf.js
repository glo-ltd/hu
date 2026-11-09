// Lets him download his own invoice as a PDF. POST { token, invoiceId }.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const { invoicePdfFor } = require('../shared/invoices');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const { supabase, client, data } = ctx;
  try {
    const r = await supabase.from('client_invoices').select('*').eq('id', String(data.invoiceId || '')).eq('client_id', client.id).maybeSingle();
    if (r.error) throw r.error;
    if (!r.data || (r.data.status !== 'sent' && r.data.status !== 'paid')) return json(404, { error: 'Invoice not found.' });
    const full = await supabase.from('clients').select('full_name, application, country').eq('id', client.id).single();
    const pdf = invoicePdfFor(r.data, full.data);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="' + r.data.number + '.pdf"', 'Cache-Control': 'no-store' },
      body: pdf.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error('client-invoice-pdf failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
