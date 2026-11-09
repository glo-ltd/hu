// A 10-minute signed link to one of his documents. POST { id, kind }.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const { id, kind } = ctx.data;
  const column = CC.DOC_KINDS[kind];
  if (!isUuid(id) || !column) return P.json(400, { error: 'Invalid request.' });
  try {
    const c = await ctx.supabase.from('clients').select('id, ' + column).eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    const path = c.data && c.data[column];
    if (!path) return P.json(404, { error: 'No document uploaded.' });
    const s = await ctx.supabase.storage.from(CC.DOC_BUCKET).createSignedUrl(path, CC.DOC_SIGNED_SECONDS);
    if (s.error) throw s.error;
    logAction(ctx.email, 'client_doc_view_' + kind, id);
    return P.json(200, { ok: true, url: s.data.signedUrl, type: path.split('.').pop() });
  } catch (e) {
    console.error('admin-client-doc failed:', e);
    return P.json(502, { error: 'Could not open the document.' });
  }
};
