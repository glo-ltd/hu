// F5: the profiles on his shortlist, as consent allows. POST { token }.
// Only women still eligible (profile complete, sharing consent given, not
// withdrawn) are returned; anyone else simply drops off the list.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  const sb = ctx.supabase;
  try {
    const full = await S.fullClient(sb, ctx.client.id);
    if (!full.shortlist_sent_at) return json(409, { error: 'Your profiles aren\'t ready yet.', code: 'noShortlist' });
    const sl = await sb.from('client_shortlists').select('candidate_id, sent_at').eq('client_id', full.id);
    if (sl.error) throw sl.error;
    const ids = (sl.data || []).map((r) => r.candidate_id);
    const cards = [];
    if (ids.length) {
      const cs = await sb.from('candidates').select('id, date_of_birth, status, consent_profile_sharing_at, preferred_language, created_at').in('id', ids);
      const ps = await sb.from('candidate_profiles').select('candidate_id, display_name, answers, translations, photo_paths, consent_photo_sharing_at').in('candidate_id', ids);
      if (cs.error) throw cs.error;
      if (ps.error) throw ps.error;
      for (const id of ids) {
        const cand = (cs.data || []).find((x) => x.id === id);
        const prof = (ps.data || []).find((x) => x.candidate_id === id);
        if (!CP.eligible(cand) || !prof) continue;
        cards.push(await CP.clientCard(sb, cand, prof));
      }
    }
    const ch = await sb.from('client_choices').select('candidate_id, rank').eq('client_id', full.id);
    if (ch.error) throw ch.error;
    const it = await sb.from('introductions').select('candidate_id').eq('client_id', full.id);
    return json(200, {
      ok: true,
      viewer: (full.application && full.application.legal_name) || full.full_name,
      cards,
      choices: (ch.data || []).sort((a, b) => a.rank - b.rank).map((x) => x.candidate_id),
      choicesSubmittedAt: full.choices_submitted_at || null,
      maxChoices: CC.C.CHOICES_MAX,
      taken: ((it && it.data) || []).map((x) => x.candidate_id),
    });
  } catch (e) {
    console.error('client-review-get failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
