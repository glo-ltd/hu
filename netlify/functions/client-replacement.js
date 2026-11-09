// After a "no" or an expired request, he may choose someone else from the
// rest of his list, up to 5 introductions in total. POST { token, candidateId }.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const I = require('../shared/introductions');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  const sb = ctx.supabase;
  const cid = ctx.data.candidateId;
  if (typeof cid !== 'string') return CC.err(400, 'invalid');
  try {
    if ((await I.usedCount(sb, ctx.client.id)) >= CC.C.MAX_INTRODUCTIONS) return json(409, { error: 'You have used all ' + CC.C.MAX_INTRODUCTIONS + ' introductions.', code: 'noneLeft' });
    const sl = await sb.from('client_shortlists').select('candidate_id').eq('client_id', ctx.client.id).eq('candidate_id', cid).maybeSingle();
    if (!sl.data) return json(400, { error: 'You can only choose from the profiles on your list.', code: 'notOnList' });
    const ex = await sb.from('introductions').select('id').eq('client_id', ctx.client.id).eq('candidate_id', cid).maybeSingle();
    if (ex.data) return json(409, { error: 'You have already chosen her.', code: 'already' });
    const cand = (await sb.from('candidates').select('id, status, consent_profile_sharing_at').eq('id', cid).maybeSingle()).data;
    if (!CP.eligible(cand)) return json(409, { error: 'She is no longer available. Please choose someone else.', code: 'unavailable' });
    const all = (await sb.from('introductions').select('rank').eq('client_id', ctx.client.id)).data || [];
    const rank = all.reduce((m, x) => Math.max(m, x.rank), 0) + 1;
    await I.createRequests(sb, ctx.client.id, [cid], rank, true);
    await CC.logEvent(sb, ctx.client.id, 'replacement_chosen', 'client');
    await sendTeam(E.team.choicesReceived.build({ clientId: ctx.client.id }));
    return json(200, await CC.ownState(sb, ctx.client.id));
  } catch (e) {
    console.error('client-replacement failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
