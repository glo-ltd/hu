// POST { token, path }: removes one of her photos from Storage and her profile.
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
    var rm = await supabase.storage.from(P.PHOTO_BUCKET).remove([path]);
    if (rm.error) throw rm.error;
    if (paths.indexOf(path) !== -1) {
      var rest = paths.filter(function (p) { return p !== path; });
      var fields = { photo_paths: rest };
      if (!rest.length) fields.consent_photo_sharing_at = null;
      profile = await P.saveProfile(supabase, candidate.id, profile, fields);
    }
    return P.json(200, await profileState(supabase, candidate, profile));
  } catch (err) {
    console.error('profile-photo-delete failed:', err);
    return P.viError(502, 'photoInvalid');
  }
};
