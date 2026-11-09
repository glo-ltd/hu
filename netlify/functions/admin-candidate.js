// One candidate for the detail screen. POST { id }.
const P = require('../shared/profile-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  var ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  var id = ctx.data.id;
  if (!isUuid(id)) return P.json(400, { error: 'Invalid id.' });
  try {
    var c = await ctx.supabase
      .from('candidates')
      .select('id, full_name, date_of_birth, province, zalo_number, email, preferred_language, about_text, source, consent_contact_at, consent_processing_at, consent_text_version, consent_profile_sharing_at, status, created_at, updated_at, zalo_confirmed_at, profile_link_sent_at, profile_token_expires_at')
      .eq('id', id)
      .maybeSingle();
    if (c.error) throw c.error;
    if (!c.data || c.data.status === 'deleted') return P.json(404, { error: 'Not found.' });
    var prof = await ctx.supabase
      .from('candidate_profiles')
      .select('candidate_id, answers, questions_version, display_name, photo_paths, consent_photo_sharing_at, consent_profile_text_version, confirmed_true_at, submitted_at, translations, translated_by, translated_at, created_at, updated_at')
      .eq('candidate_id', id)
      .maybeSingle();
    if (prof.error) throw prof.error;
    var profile = prof.data;
    var cand = c.data;
    logAction(ctx.email, 'view', id);
    return P.json(200, {
      ok: true,
      candidate: Object.assign({}, cand, {
        age: P.ageFrom(cand.date_of_birth),
        withdrawn_at: cand.status === 'withdrawn' ? cand.updated_at : null,
        given_name: P.givenName(cand.full_name),
      }),
      profile: profile,
      stepsComplete: profile ? P.stepsComplete(profile) : 0,
      photos: await P.signedPhotos(ctx.supabase, (profile && profile.photo_paths) || []),
      questions: P.QUESTIONS,
    });
  } catch (err) {
    console.error('admin-candidate failed:', err);
    return P.json(502, { error: 'Could not load this candidate.' });
  }
};
