// Autosave for one step (or one textarea). POST { token, answers: {id: value} }.
// Validates type, options and length; "required" is only enforced on submit.
const P = require('../shared/profile-common');

exports.handler = async function (event) {
  var ctx = await P.candidateFromRequest(event);
  if (ctx.response) return ctx.response;
  var supabase = ctx.supabase;
  var candidate = ctx.candidate;
  try {
    var profile = await P.loadProfile(supabase, candidate.id);
    var merged = P.mergeAnswers(profile && profile.answers, profile && profile.display_name, ctx.data.answers);
    if (merged.error) return P.viError(400, merged.error, merged.field ? { field: merged.field } : null);

    var saved = await P.saveProfile(supabase, candidate.id, profile, {
      answers: merged.answers,
      display_name: merged.displayName,
      questions_version: P.QUESTIONS.version,
    });

    if (candidate.status === 'new' || candidate.status === 'contacted') {
      var st = await supabase
        .from('candidates')
        .update({ status: 'profile_in_progress' })
        .eq('id', candidate.id)
        .in('status', ['new', 'contacted']);
      if (st.error) console.error('profile-save status update failed:', st.error);
    }
    return P.json(200, { ok: true, savedAt: saved.updated_at || new Date().toISOString(), resumeStep: P.resumeStep(saved) });
  } catch (err) {
    console.error('profile-save failed:', err);
    return P.viError(502, 'profileSaveFailed');
  }
};
