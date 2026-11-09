// Step 1 of a document upload: POST { token, kind: 'id'|'certificate', type }.
// Returns a signed upload URL for "<client_id>/<kind>/<uuid>.<ext>".
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const { supabase, client, data } = ctx;
  if (!CC.DOC_KINDS[data.kind]) return CC.err(400, 'invalid');
  const ext = CC.EXT_BY_TYPE[data.type];
  if (!ext) return json(400, { error: 'Please upload a PDF, JPEG or PNG file.', code: 'type' });
  if (['invited', 'applying'].indexOf(client.status) === -1) return json(409, { error: 'Your application has already been sent.', code: 'locked' });
  try {
    const path = CC.docPath(client.id, data.kind, ext);
    const r = await supabase.storage.from(CC.DOC_BUCKET).createSignedUploadUrl(path);
    if (r.error) throw r.error;
    return json(200, { ok: true, path, signedUrl: r.data.signedUrl, maxBytes: CC.C.DOCUMENT_MAX_BYTES });
  } catch (e) {
    console.error('client-doc-upload-url failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
