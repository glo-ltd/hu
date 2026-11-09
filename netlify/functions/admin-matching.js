// The matching screen for one client. POST { id }.
// Lists only women with a complete profile who consented to sharing and
// haven't withdrawn. For each: ticks or crosses against his must-haves,
// from her own answers only. No scores. Registration date order.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const id = ctx.data.id;
  if (!isUuid(id)) return P.json(400, { error: 'Invalid id.' });
  try {
    const c = await S.fullClient(sb, id).catch(() => null);
    if (!c) return P.json(404, { error: 'Not found.' });
    const prof = await S.loadProfile(sb, id);
    if (!prof || !prof.submitted_at) return P.json(409, { error: 'He hasn\'t sent his profile yet.' });
    const cs = await sb.from('candidates').select('id, date_of_birth, status, consent_profile_sharing_at, preferred_language, created_at')
      .eq('status', 'profile_complete').not('consent_profile_sharing_at', 'is', null).order('created_at', { ascending: true }).limit(5000);
    if (cs.error) throw cs.error;
    const ids = (cs.data || []).map((x) => x.id);
    const ps = ids.length ? await sb.from('candidate_profiles').select('candidate_id, display_name, answers, translations, photo_paths, consent_photo_sharing_at, submitted_at').in('candidate_id', ids) : { data: [] };
    if (ps.error) throw ps.error;
    const sl = await sb.from('client_shortlists').select('candidate_id').eq('client_id', id);
    const shortlisted = new Set((sl.data || []).map((x) => x.candidate_id));
    const women = [];
    for (const cand of cs.data || []) {
      const p = (ps.data || []).find((x) => x.candidate_id === cand.id);
      if (!CP.eligible(cand) || !p) continue;
      const t = CP.ticks(c, prof, cand, p);
      women.push({
        id: cand.id,
        displayName: p.display_name,
        age: P.ageFrom(cand.date_of_birth),
        province: (p.answers || {}).province || null,
        registeredAt: cand.created_at,
        photoConsent: !!p.consent_photo_sharing_at,
        photoCount: (p.photo_paths || []).length,
        needsTranslation: CP.untranslated(cand, p),
        shortlisted: shortlisted.has(cand.id),
        checks: t.checks,
        ticks: t.count,
        matchesAll: t.all,
      });
    }
    logAction(ctx.email, 'matching_view', id);
    return P.json(200, {
      ok: true,
      mustHaves: prof.answers || {},
      hisAge: P.ageFrom((c.application || {}).date_of_birth),
      summaryApproved: !!prof.summary_approved_at,
      shortlistSentAt: c.shortlist_sent_at || null,
      choicesSubmittedAt: c.choices_submitted_at || null,
      max: CC.C.SHORTLIST_MAX,
      women,
    });
  } catch (e) {
    console.error('admin-matching failed:', e);
    return P.json(502, { error: 'Could not load the matching screen.' });
  }
};
