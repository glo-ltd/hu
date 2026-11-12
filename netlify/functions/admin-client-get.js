// One client for the team page: details, timeline, documents (as flags;
// signed links come from admin-client-doc), declaration, agreement, invoices.
// POST { id }.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const id = ctx.data.id;
  if (!isUuid(id)) return P.json(400, { error: 'Invalid id.' });
  try {
    const c = await ctx.supabase.from('clients').select('*').eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    if (!c.data) return P.json(404, { error: 'Not found.' });
    const ev = await ctx.supabase.from('client_events').select('kind, actor, detail, created_at').eq('client_id', id).order('created_at', { ascending: true });
    const inv = await ctx.supabase.from('client_invoices').select('*').eq('client_id', id).order('created_at', { ascending: true });
    if (ev.error) throw ev.error;
    if (inv.error) throw inv.error;
    const client = Object.assign({}, c.data);
    delete client.access_token_hash;
    delete client.ip_hash;
    delete client.declaration_ip_hash;
    logAction(ctx.email, 'client_view', id);
    return P.json(200, {
      ok: true,
      client,
      events: ev.data || [],
      invoices: inv.data || [],
      form: CC.FORM,
      agreement: CC.AGREEMENT,
      signupsOpen: CC.C.clientSignupsOpen(),
      paymentDetailsSet: !!process.env.INVOICE_PAYMENT_DETAILS,
      fees: CC.C.FEES,
    });
  } catch (e) {
    console.error('admin-client-get failed:', e);
    return P.json(502, { error: 'Could not load this client.' });
  }
};
