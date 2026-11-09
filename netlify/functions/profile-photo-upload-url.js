// Step 1 of a photo upload: a signed upload URL for "<candidate_id>/<uuid>.jpg".
// The browser has already resized and re-encoded the photo (no EXIF/GPS).
const crypto = require('crypto');
const P = require('../shared/profile-common');

exports.handler = async function (event) {
  var ctx = await P.candidateFromRequest(event);
  if (ctx.response) return ctx.response;
  try {
    var profile = await P.loadProfile(ctx.supabase, ctx.candidate.id);
    var count = profile && profile.photo_paths ? profile.photo_paths.length : 0;
    if (count >= P.MAX_PHOTOS) return P.viError(400, 'tooManyPhotos');
    var path = ctx.candidate.id + '/' + crypto.randomUUID() + '.jpg';
    var res = await ctx.supabase.storage.from(P.PHOTO_BUCKET).createSignedUploadUrl(path);
    if (res.error) throw res.error;
    return P.json(200, { ok: true, path: path, signedUrl: res.data.signedUrl });
  } catch (err) {
    console.error('profile-photo-upload-url failed:', err);
    return P.viError(502, 'photoInvalid');
  }
};
