// F4 autosave. POST { token, answers }. "Required" is only checked when he
// sends his profile. Locked once sent (changes then go through James).
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  try {
    const prof = await S.loadProfile(ctx.supabase, ctx.client.id);
    if (prof && prof.submitted_at) return json(409, { error: 'Your profile has been sent to James. If something needs changing, use "Ask for changes" or reply to his email.', code: 'locked' });
    const m = CP.mergeAnswers(prof || {}, ctx.data.answers);
    if (m.error) return json(400, { error: m.error === 'answerTooLong' ? 'One of your answers is too long.' : 'Please check this answer.', code: m.error, field: m.field });
    await S.saveProfile(ctx.supabase, ctx.client.id, prof, { answers: m.answers, display_name: m.displayName, message_to_women: m.message, questions_version: CP.PQ.version });
    return json(200, { ok: true, savedAt: new Date().toISOString() });
  } catch (e) {
    console.error('client-profile-save failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
