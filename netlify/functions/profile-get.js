// Her private profile page loads its state from here. POST { token }.
const P = require('../shared/profile-common');
const { profileState } = require('../shared/profile-state');

exports.handler = async function (event) {
  var ctx = await P.candidateFromRequest(event);
  if (ctx.response) return ctx.response;
  try {
    var profile = await P.loadProfile(ctx.supabase, ctx.candidate.id);
    return P.json(200, await profileState(ctx.supabase, ctx.candidate, profile));
  } catch (err) {
    console.error('profile-get failed:', err);
    return P.viError(502, 'profileSaveFailed');
  }
};
