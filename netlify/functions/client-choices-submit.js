// He sends up to 5 choices, in order. POST { token, candidateIds: [...] }.
// They can't be changed afterwards except through James.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  const sb = ctx.supabase;
  const ids = ctx.data.candidateIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > CC.C.CHOICES_MAX || new Set(ids).size !== ids.length || !ids.every((x) => typeof x === 'string')) {
    return json(400, { error: 'Please choose between 1 and ' + CC.C.CHOICES_MAX + ' profiles.', code: 'count' });
  }
  try {
    const full = await S.fullClient(sb, ctx.client.id);
    if (!full.shortlist_sent_at) return json(409, { error: 'Your profiles aren\'t ready yet.', code: 'noShortlist' });
    if (full.choices_submitted_at) return json(409, { error: 'Your choices have already been sent. To change them, please write to James.', code: 'locked' });
    const sl = await sb.from('client_shortlists').select('candidate_id').eq('client_id', full.id).in('candidate_id', ids);
    if (sl.error) throw sl.error;
    if ((sl.data || []).length !== ids.length) return json(400, { error: 'You can only choose from the profiles on your list.', code: 'notOnList' });
    const cs = await sb.from('candidates').select('id, status, consent_profile_sharing_at').in('id', ids);
    if (cs.error) throw cs.error;
    if (!ids.every((id) => CP.eligible((cs.data || []).find((x) => x.id === id)))) {
      return json(409, { error: 'One of the profiles you chose is no longer available. Please reload the page and choose again.', code: 'unavailable' });
    }
    const now = new Date().toISOString();
    const ins = await sb.from('client_choices').insert(ids.map((id, i) => ({ client_id: full.id, candidate_id: id, rank: i + 1, chosen_at: now })));
    if (ins.error) throw ins.error;
    const u = await sb.from('clients').update({ choices_submitted_at: now }).eq('id', full.id);
    if (u.error) throw u.error;
    await CC.logEvent(sb, full.id, 'choices_submitted', 'client', ids.length + ' chosen');
    await sendEmail((full.application && full.application.email) || full.email, E.R12.build({ firstName: CC.firstName(full.full_name), count: ids.length }));
    await sendTeam(E.team.choicesReceived.build({ clientId: full.id }));
    return json(200, { ok: true, choicesSubmittedAt: now });
  } catch (e) {
    console.error('client-choices-submit failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
