// POST { token, paths: [...] }: new order for her photos (first = main photo).
// Must be exactly the photos she already has, in any order.
const P = require('../shared/profile-common');
const { profileState } = require('../shared/profile-state');

exports.handler = async function (event) {
  var ctx = await P.candidateFromRequest(event);
  if (ctx.response) return ctx.response;
  var supabase = ctx.supabase;
  var candidate = ctx.candidate;
  var order = ctx.data.paths;
  try {
    var profile = await P.loadProfile(supabase, candidate.id);
    var paths = (profile && profile.photo_paths) || [];
    var sameSet =
      Array.isArray(order) &&
      order.length === paths.length &&
      new Set(order).size === order.length &&
      order.every(function (p) { return paths.indexOf(p) !== -1 && P.isOwnPhotoPath(candidate.id, p); });
    if (!sameSet) return P.viError(400, 'photoInvalid');
    profile = await P.saveProfile(supabase, candidate.id, profile, { photo_paths: order });
    return P.json(200, await profileState(supabase, candidate, profile));
  } catch (err) {
    console.error('profile-photo-order failed:', err);
    return P.viError(502, 'photoInvalid');
  }
};
