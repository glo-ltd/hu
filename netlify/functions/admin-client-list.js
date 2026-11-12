// Clients for the team page, newest first, plus press/other enquiries.
// Filtering and search happen in the page. POST {}.
const P = require('../shared/profile-common');
const { requireAdmin, logAction } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  try {
    const c = await ctx.supabase.from('clients')
      .select('id, full_name, email, country, age, status, status_changed_at, created_at, fee_document_sent_at, submitted_at, declaration_read_at, paid_at, engagement_ends_at, source, engagement_flagged_at, closed_kind, paused_at')
      .order('created_at', { ascending: false }).limit(2000);
    if (c.error) throw c.error;
    const g = await ctx.supabase.from('general_enquiries').select('id, full_name, email, country, message, created_at').order('created_at', { ascending: false }).limit(200);
    if (g.error) throw g.error;
    const oc = await ctx.supabase.from('concerns').select('id', { count: 'exact', head: true }).is('handled_at', null);
    logAction(ctx.email, 'client_list');
    return P.json(200, { ok: true, clients: c.data || [], general: g.data || [], signupsOpen: process.env.CLIENT_SIGNUPS_OPEN === 'true', openConcerns: oc.count || 0 });
  } catch (e) {
    console.error('admin-client-list failed:', e);
    return P.json(502, { error: 'Could not load clients.' });
  }
};
