// Final step. POST { token, consents: { confirmTrue, profileSharing, photoSharing } }.
// TODO(James): counsel to approve the consent texts on /vi/ho-so (version vi-2026-11-profile-v1).
const { Resend } = require('resend');
const P = require('../shared/profile-common');
const { profileState } = require('../shared/profile-state');
const { teamNotifyEmails } = require('../shared/candidate-common');

exports.handler = async function (event) {
  var ctx = await P.candidateFromRequest(event);
  if (ctx.response) return ctx.response;
  var supabase = ctx.supabase;
  var candidate = ctx.candidate;
  var consents = ctx.data.consents || {};
  if (consents.confirmTrue !== true) return P.viError(400, 'confirmTrue');

  try {
    var profile = await P.loadProfile(supabase, candidate.id);
    if (!profile) return P.viError(400, 'answerRequired', { field: 'display_name', step: 1 });

    // Re-validate every stored answer as a whole, now with "required".
    var recheck = P.mergeAnswers({}, null, Object.assign({ display_name: profile.display_name }, profile.answers));
    if (recheck.error) return P.viError(400, recheck.error, { field: recheck.field });
    var missing = P.firstMissing(recheck.answers, recheck.displayName);
    if (missing) return P.viError(400, 'answerRequired', { field: missing.id, step: missing.step });

    var now = new Date().toISOString();
    var paths = profile.photo_paths || [];
    var photoConsent = consents.photoSharing === true && paths.length > 0;
    var fields = {
      answers: recheck.answers,
      display_name: recheck.displayName,
      questions_version: P.QUESTIONS.version,
      confirmed_true_at: now,
      consent_profile_text_version: P.CONSENT_PROFILE_TEXT_VERSION,
      consent_photo_sharing_at: photoConsent ? profile.consent_photo_sharing_at || now : null,
      submitted_at: now,
    };
    var hadSubmitted = !!profile.submitted_at;

    // Photos without photo consent are deleted, as the page told her.
    if (!photoConsent) {
      await P.deleteAllPhotos(supabase, candidate.id);
      fields.photo_paths = [];
    }
    profile = await P.saveProfile(supabase, candidate.id, profile, fields);

    var sharingAt = consents.profileSharing === true ? candidate.consent_profile_sharing_at || now : null;
    var upd = await supabase
      .from('candidates')
      .update({ status: 'profile_complete', consent_profile_sharing_at: sharingAt })
      .eq('id', candidate.id);
    if (upd.error) throw upd.error;
    candidate = Object.assign({}, candidate, { status: 'profile_complete', consent_profile_sharing_at: sharingAt });

    await notifyTeam(candidate.id, hadSubmitted);
    return P.json(200, await profileState(supabase, candidate, profile));
  } catch (err) {
    console.error('profile-submit failed:', err);
    return P.viError(502, 'profileSaveFailed');
  }
};

// No personal data: just the id and a link to the team tool.
async function notifyTeam(candidateId, updated) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured; skipping team notification.');
    return;
  }
  try {
    var resend = new Resend(process.env.RESEND_API_KEY);
    var id = P.escapeHtml(candidateId);
    var res = await resend.emails.send({
      from: P.FROM_EMAIL,
      to: teamNotifyEmails(),
      subject: 'Candidate profile ' + (updated ? 'updated' : 'submitted') + ' (#' + candidateId + ')',
      html: '<p>Candidate profile ' + (updated ? 'updated' : 'submitted') + ' (#' + id + ').</p>' +
        '<p><a href="' + P.SITE_URL + '/admin/#' + id + '">Open in the team tool</a></p>',
    });
    if (res && res.error) console.error('Resend team notification failed:', res.error);
  } catch (err) {
    console.error('Resend team notification threw:', err);
  }
}
