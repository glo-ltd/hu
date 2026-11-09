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
    // Phase 2: his profile, photos (10-minute links), shortlist and choices.
    const pr = await ctx.supabase.from('client_profiles').select('*').eq('client_id', id).maybeSingle();
    if (pr.error) throw pr.error;
    const CP = require('../shared/client-profile');
    const photos = pr.data ? await CP.signedPaths(ctx.supabase, CC.DOC_BUCKET, pr.data.photo_paths || []) : [];
    const sl = await ctx.supabase.from('client_shortlists').select('candidate_id, sent_at').eq('client_id', id);
    const ch = await ctx.supabase.from('client_choices').select('candidate_id, rank, chosen_at').eq('client_id', id);
    const names = {};
    const ids = [].concat((sl.data || []).map((x) => x.candidate_id), (ch.data || []).map((x) => x.candidate_id));
    if (ids.length) {
      const cp = await ctx.supabase.from('candidate_profiles').select('candidate_id, display_name').in('candidate_id', ids);
      (cp.data || []).forEach((x) => { names[x.candidate_id] = x.display_name; });
    }
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
      certificateMaxAgeMonths: CC.C.CERTIFICATE_MAX_AGE_MONTHS,
      profile: pr.data || null,
      profilePhotos: photos,
      profileQuestions: CP.PQ,
      shortlist: (sl.data || []).map((x) => ({ id: x.candidate_id, name: names[x.candidate_id] || '—', sentAt: x.sent_at })),
      choices: (ch.data || []).sort((a, b) => a.rank - b.rank).map((x) => ({ id: x.candidate_id, rank: x.rank, name: names[x.candidate_id] || '—' })),
    });
  } catch (e) {
    console.error('admin-client-get failed:', e);
    return P.json(502, { error: 'Could not load this client.' });
  }
};
