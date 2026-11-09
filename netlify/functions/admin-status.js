// Admin facts only. POST { id, action } where action is one of
// zalo_confirm, zalo_unconfirm, withdraw.
const P = require('../shared/profile-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

var ACTIONS = ['zalo_confirm', 'zalo_unconfirm', 'withdraw'];

exports.handler = async function (event) {
  var ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  var id = ctx.data.id;
  var action = ctx.data.action;
  if (!isUuid(id) || ACTIONS.indexOf(action) === -1) return P.json(400, { error: 'Invalid request.' });
  try {
    var c = await ctx.supabase.from('candidates').select('id, status').eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    if (!c.data || c.data.status === 'deleted') return P.json(404, { error: 'Not found.' });
    // A withdrawn row is left alone (its updated_at is the withdrawal date
    // that drives the 30-day deletion reminder).
    if (c.data.status === 'withdrawn') return P.json(409, { error: 'She has withdrawn. Nothing to change; delete within 30 days.' });

    if (action === 'withdraw') {
      var w = await ctx.supabase.from('candidates').update({ status: 'withdrawn' }).eq('id', id);
      if (w.error) throw w.error;
      await P.applyWithdrawal(ctx.supabase, id);
    } else {
      var at = action === 'zalo_confirm' ? new Date().toISOString() : null;
      var u = await ctx.supabase.from('candidates').update({ zalo_confirmed_at: at }).eq('id', id);
      if (u.error) throw u.error;
    }
    logAction(ctx.email, action, id);
    return P.json(200, { ok: true });
  } catch (err) {
    console.error('admin-status failed:', err);
    return P.json(502, { error: 'Could not update.' });
  }
};
