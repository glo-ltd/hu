// Step 2 of a document upload: POST { token, kind, path }. Checks the path is
// in his own folder, the file exists, is under 10 MB and really is a PDF,
// JPEG or PNG, then records it (replacing and deleting any earlier one).
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const { supabase, client, data } = ctx;
  const column = CC.DOC_KINDS[data.kind];
  if (!column || !CC.isOwnDocPath(client.id, data.kind, data.path)) return CC.err(400, 'invalid');
  if (['invited', 'applying'].indexOf(client.status) === -1) return json(409, { error: 'Your application has already been sent.', code: 'locked' });
  const bucket = supabase.storage.from(CC.DOC_BUCKET);
  try {
    const dl = await bucket.download(data.path);
    if (dl.error || !dl.data) return json(400, { error: 'We couldn\'t find that upload. Please try again.', code: 'missing' });
    const bytes = Buffer.from(await dl.data.arrayBuffer());
    if (bytes.length > CC.C.DOCUMENT_MAX_BYTES || !CC.sniffMatches(bytes, data.path)) {
      await bucket.remove([data.path]);
      return json(400, { error: 'That file isn\'t a readable PDF, JPEG or PNG under 10 MB. Please try another.', code: 'type' });
    }
    const previous = client[column];
    const fields = {};
    fields[column] = data.path;
    // A replaced document has to be checked again.
    fields[data.kind === 'id' ? 'id_checked_at' : 'certificate_checked_at'] = null;
    if (client.status === 'invited') Object.assign(fields, { status: 'applying', status_changed_at: new Date().toISOString() });
    const r = await supabase.from('clients').update(fields).eq('id', client.id);
    if (r.error) throw r.error;
    if (previous && previous !== data.path) await bucket.remove([previous]);
    await CC.logEvent(supabase, client.id, data.kind === 'id' ? 'id_uploaded' : 'certificate_uploaded', 'client');
    return json(200, await CC.ownState(supabase, client.id));
  } catch (e) {
    console.error('client-doc-confirm failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
