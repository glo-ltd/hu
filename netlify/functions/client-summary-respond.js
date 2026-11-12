// He approves James's summary (R10) or asks for changes.
// POST { token, decision: 'approve'|'changes', comment? }
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  const { decision } = ctx.data;
  const comment = typeof ctx.data.comment === 'string' ? ctx.data.comment.normalize('NFC').trim().slice(0, 2000) : '';
  try {
    const prof = await S.loadProfile(ctx.supabase, ctx.client.id);
    if (!prof || !prof.summary_sent_at) return json(409, { error: 'There is no summary waiting for you right now.', code: 'noSummary' });
    if (prof.summary_approved_at) return json(409, { error: 'You have already approved your profile.', code: 'approved' });
    const now = new Date().toISOString();
    if (decision === 'approve') {
      await S.saveProfile(ctx.supabase, ctx.client.id, prof, { summary_approved_at: now });
      await CC.logEvent(ctx.supabase, ctx.client.id, 'summary_approved', 'client');
      const full = await S.fullClient(ctx.supabase, ctx.client.id);
      await sendEmail((full.application && full.application.email) || full.email, E.R10.build({ firstName: CC.firstName(full.full_name) }));
      await sendTeam(E.team.profileApproved.build({ clientId: ctx.client.id }));
    } else if (decision === 'changes') {
      if (!comment) return json(400, { error: 'Please tell James what you would like changed.', code: 'comment', field: 'comment' });
      await S.saveProfile(ctx.supabase, ctx.client.id, prof, { changes_requested_at: now, changes_comment: comment, summary_sent_at: null });
      await CC.logEvent(ctx.supabase, ctx.client.id, 'summary_changes_requested', 'client');
      await sendTeam(E.team.changesRequested.build({ clientId: ctx.client.id }));
    } else {
      return CC.err(400, 'invalid');
    }
    return json(200, await CC.ownState(ctx.supabase, ctx.client.id));
  } catch (e) {
    console.error('client-summary-respond failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
