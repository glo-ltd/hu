// He sends his finished profile (F4) to James. POST { token }.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  try {
    const prof = await S.loadProfile(ctx.supabase, ctx.client.id);
    if (!prof) return json(400, { error: 'Please complete your profile first.', code: 'incomplete', step: 1 });
    if (prof.submitted_at) return json(409, { error: 'Your profile has already been sent.', code: 'locked' });
    const missing = CP.firstMissing(prof);
    if (missing) return json(400, { error: 'Please complete: "' + missing.label + '".', code: 'incomplete', field: missing.id, step: missing.step });
    await S.saveProfile(ctx.supabase, ctx.client.id, prof, { submitted_at: new Date().toISOString() });
    await CC.logEvent(ctx.supabase, ctx.client.id, 'profile_submitted', 'client');
    await sendTeam(E.team.profileSubmitted.build({ clientId: ctx.client.id }));
    return json(200, await CC.ownState(ctx.supabase, ctx.client.id));
  } catch (e) {
    console.error('client-profile-submit failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
