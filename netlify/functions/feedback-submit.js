// R21 feedback. POST { token, rating 1-5, comments?, permission, agree }.
// permission: none | first_name | first_name_country | anonymous. Anything
// other than "none" needs the written-permission box ticked. The link then
// stops working (one answer per closing).
const { json } = require('../shared/request-utils');
const FB = require('../shared/feedback');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await FB.fromRequest(event);
  if (ctx.response) return ctx.response;
  const d = ctx.data;
  const rating = Number(d.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json(400, { error: 'Please choose a rating from 1 to 5.', field: 'rating' });
  const permission = FB.OPTIONS.map((o) => o.value).indexOf(d.permission) !== -1 ? d.permission : 'none';
  if (permission !== 'none' && d.agree !== true) return json(400, { error: 'Please tick the box to give written permission, or choose "Please don\'t publish".', field: 'agree' });
  const comments = typeof d.comments === 'string' ? d.comments.normalize('NFC').trim().slice(0, 4000) : '';
  try {
    const ins = await ctx.sb.from('client_feedback').insert({ client_id: ctx.clientId, rating, comments: comments || null, publish_permission: permission, permission_text_version: FB.PERMISSION_VERSION });
    if (ins.error) throw ins.error;
    await ctx.sb.from('clients').update({ feedback_token_hash: null, feedback_token_expires_at: null }).eq('id', ctx.clientId);
    await CC.logEvent(ctx.sb, ctx.clientId, 'feedback_received', 'client');
    await sendTeam(E.team.feedbackReceived.build({ clientId: ctx.clientId }));
    return json(200, { ok: true });
  } catch (e) {
    console.error('feedback-submit failed:', e);
    return json(502, { error: 'We couldn\'t save your feedback just now. Please try again.' });
  }
};
