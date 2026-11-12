// His profile photos, step 1: a signed upload URL for <id>/photos/<uuid>.jpg.
// The browser has already resized and re-encoded the photo (no metadata).
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  try {
    const prof = await S.loadProfile(ctx.supabase, ctx.client.id);
    if (prof && prof.submitted_at) return json(409, { error: 'Your profile has already been sent.', code: 'locked' });
    if (prof && (prof.photo_paths || []).length >= CC.C.CLIENT_PHOTOS_MAX) return json(400, { error: 'You can add up to ' + CC.C.CLIENT_PHOTOS_MAX + ' photos.', code: 'tooManyPhotos' });
    const path = CP.photoPath(ctx.client.id);
    const r = await ctx.supabase.storage.from(CC.DOC_BUCKET).createSignedUploadUrl(path);
    if (r.error) throw r.error;
    return json(200, { ok: true, path, signedUrl: r.data.signedUrl });
  } catch (e) {
    console.error('client-photo-upload-url failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
