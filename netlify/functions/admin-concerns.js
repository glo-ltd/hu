// Concerns on the team page. POST { op: 'list'|'handled'|'link', concernId?, clientId? }
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const { op, concernId, clientId } = ctx.data;
  try {
    if (op === 'list') {
      const r = await sb.from('concerns').select('id, about, reporter_role, reporter_name, reporter_contact, subject_hint, message, lang, client_id, handled_at, handled_by, created_at').order('created_at', { ascending: false }).limit(500);
      if (r.error) throw r.error;
      const cl = await sb.from('clients').select('id, full_name, status').in('status', ['active', 'paused', 'invoiced', 'checked', 'submitted']);
      logAction(ctx.email, 'concerns_list');
      return P.json(200, { ok: true, concerns: r.data || [], clients: (cl.data || []).map((c) => ({ id: c.id, name: c.full_name, status: c.status })) });
    }
    if (!isUuid(concernId)) return P.json(400, { error: 'Invalid request.' });
    if (op === 'handled') {
      const u = await sb.from('concerns').update({ handled_at: new Date().toISOString(), handled_by: ctx.email }).eq('id', concernId);
      if (u.error) throw u.error;
    } else if (op === 'link') {
      if (clientId !== null && !isUuid(clientId)) return P.json(400, { error: 'Invalid client.' });
      const u = await sb.from('concerns').update({ client_id: clientId }).eq('id', concernId);
      if (u.error) throw u.error;
      if (clientId) await CC.logEvent(sb, clientId, 'concern_linked', ctx.email, 'R-' + concernId.slice(0, 8).toUpperCase());
    } else {
      return P.json(400, { error: 'Invalid request.' });
    }
    logAction(ctx.email, 'concern_' + op, clientId || null);
    return P.json(200, { ok: true });
  } catch (e) {
    console.error('admin-concerns failed:', e);
    return P.json(502, { error: 'Could not do that just now.' });
  }
};
