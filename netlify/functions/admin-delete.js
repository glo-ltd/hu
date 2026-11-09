// Permanent deletion (the 30-day promise). POST { id, confirmName }.
// confirmName must match her given name (last word of full name) or her
// display name. Deletes her photos from Storage first, then the candidate
// row; candidate_profiles cascades.
const P = require('../shared/profile-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

function norm(s) {
  return String(s || '').normalize('NFC').trim().toLocaleLowerCase('vi');
}

exports.handler = async function (event) {
  var ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  var id = ctx.data.id;
  if (!isUuid(id)) return P.json(400, { error: 'Invalid id.' });
  try {
    var c = await ctx.supabase.from('candidates').select('id, full_name').eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    if (!c.data) return P.json(404, { error: 'Not found.' });
    var prof = await ctx.supabase.from('candidate_profiles').select('display_name').eq('candidate_id', id).maybeSingle();
    var typed = norm(ctx.data.confirmName);
    var ok = typed && (typed === norm(P.givenName(c.data.full_name)) || (prof.data && typed === norm(prof.data.display_name)));
    if (!ok) return P.json(400, { error: 'The name you typed does not match. Nothing was deleted.' });

    await P.deleteAllPhotos(ctx.supabase, id);
    var del = await ctx.supabase.from('candidates').delete().eq('id', id);
    if (del.error) throw del.error;
    logAction(ctx.email, 'delete_permanently', id);
    return P.json(200, { ok: true });
  } catch (err) {
    console.error('admin-delete failed:', err);
    return P.json(502, { error: 'Could not delete. Nothing may have been removed; try again.' });
  }
};
