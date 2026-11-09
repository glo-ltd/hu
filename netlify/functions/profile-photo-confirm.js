// Step 2 of a photo upload: POST { token, path }. Checks the path is in her
// own folder and the object exists, then adds it to photo_paths (max 3).
const P = require('../shared/profile-common');
const { profileState } = require('../shared/profile-state');

exports.handler = async function (event) {
  var ctx = await P.candidateFromRequest(event);
  if (ctx.response) return ctx.response;
  var supabase = ctx.supabase;
  var candidate = ctx.candidate;
  var path = ctx.data.path;
  if (!P.isOwnPhotoPath(candidate.id, path)) return P.viError(400, 'photoInvalid');
  try {
    var profile = await P.loadProfile(supabase, candidate.id);
    var paths = (profile && profile.photo_paths) || [];
    if (paths.indexOf(path) === -1) {
      if (paths.length >= P.MAX_PHOTOS) {
        await supabase.storage.from(P.PHOTO_BUCKET).remove([path]);
        return P.viError(400, 'tooManyPhotos');
      }
      // The object must really be there (a signed URL can't be made otherwise).
      var probe = await supabase.storage.from(P.PHOTO_BUCKET).createSignedUrl(path, 60);
      if (probe.error) return P.viError(400, 'photoInvalid');
      paths = paths.concat([path]);
      profile = await P.saveProfile(supabase, candidate.id, profile, { photo_paths: paths });
    }
    return P.json(200, await profileState(supabase, candidate, profile));
  } catch (err) {
    console.error('profile-photo-confirm failed:', err);
    return P.viError(502, 'photoInvalid');
  }
};
