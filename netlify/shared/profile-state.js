// Builds the candidate-facing view of her profile. This is the ONLY shape
// the profile-* functions return, so it is the one place to check that no
// full name, date of birth, Zalo number, email or ip hash leaves the server.
const P = require('./profile-common');

async function profileState(supabase, candidate, profile) {
  var age = P.ageFrom(candidate.date_of_birth);
  var answers = Object.assign({}, (profile && profile.answers) || {});
  var displayName = profile ? profile.display_name : null;
  var paths = (profile && profile.photo_paths) || [];
  return {
    ok: true,
    status: candidate.status,
    questionsVersion: P.QUESTIONS.version,
    answers: answers,
    displayName: displayName,
    prefill: {
      display_name: P.givenName(candidate.full_name),
      province: candidate.province,
      about: candidate.about_text || '',
      age: age,
    },
    photos: await P.signedPhotos(supabase, paths),
    consents: {
      profileSharing: !!candidate.consent_profile_sharing_at,
      photoSharing: !!(profile && profile.consent_photo_sharing_at),
      confirmedTrue: !!(profile && profile.confirmed_true_at),
    },
    submittedAt: (profile && profile.submitted_at) || null,
    resumeStep: P.resumeStep(profile),
  };
}

module.exports = { profileState };
