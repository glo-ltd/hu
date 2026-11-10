// Sends his application. POST { token }. Everything must be complete:
// application, sworn background declaration (signed), accepted agreement.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const { supabase, client } = ctx;
  if (['invited', 'applying'].indexOf(client.status) === -1) return json(409, { error: 'Your application has already been sent.', code: 'locked' });
  const a = CC.firstMissing('application', client.application || {});
  if (a) return json(400, { error: 'Please complete your application: "' + a.label + '".', code: 'incomplete', field: a.id, step: 1 });
  const d = CC.firstMissing('declaration', client.declaration || {});
  if (d) return json(400, { error: 'Please complete your background declaration: "' + d.label + '".', code: 'incomplete', field: d.id, step: 2 });
  if (!client.declaration_signed_at) return json(400, { error: 'Please sign your background declaration.', code: 'unsigned', step: 2 });
  if (CC.agreementIsDraft()) return json(409, { error: 'The client agreement is not ready yet. We\'ll let you know as soon as it is.', code: 'agreementDraft', step: 3 });
  if (client.agreement_version !== CC.AGREEMENT.version) return json(400, { error: 'Please read and accept the client agreement.', code: 'agreement', step: 3 });
  try {
    await CC.setStatus(supabase, client.id, 'submitted', { submitted_at: new Date().toISOString() });
    await CC.logEvent(supabase, client.id, 'application_submitted', 'client');
    const to = (client.application && client.application.email) || client.email;
    await sendEmail(to, E.R6.build({ firstName: CC.firstName(client.full_name) }));
    await sendTeam(E.team.applicationSubmitted.build({ clientId: client.id }));
    return json(200, await CC.ownState(supabase, client.id));
  } catch (e) {
    console.error('client-submit failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
