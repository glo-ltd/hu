// Signs the background declaration or accepts the client agreement.
// POST { token, what: 'declaration'|'agreement', typedName, agreed: true, version? }
// The typed name must match the full legal name in his application.
const { json, ipHash } = require('../shared/request-utils');
const CC = require('../shared/client-common');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const { supabase, client, data } = ctx;
  if (['invited', 'applying'].indexOf(client.status) === -1) return json(409, { error: 'Your application has already been sent.', code: 'locked' });
  if (data.agreed !== true) return json(400, { error: 'Please tick the box to confirm.', code: 'notAgreed' });
  const legal = (client.application || {}).legal_name;
  if (!legal) return json(400, { error: 'Please complete your application first, including your full legal name.', code: 'noLegalName', step: 1 });
  const typed = typeof data.typedName === 'string' ? data.typedName.normalize('NFC').trim().replace(/\s+/g, ' ').slice(0, 120) : '';
  if (CC.normName(typed) !== CC.normName(legal)) {
    return json(400, { error: 'Please type your full legal name exactly as in your application: ' + legal + '.', code: 'nameMismatch' });
  }
  const now = new Date().toISOString();
  let fields;
  if (data.what === 'declaration') {
    const missing = CC.firstMissing('declaration', client.declaration || {}, { certificate: client.certificate_path });
    if (missing) return json(400, { error: 'Please answer every question in the declaration first.', code: 'incomplete', field: missing.id, step: 2 });
    fields = { declaration_typed_name: typed, declaration_signed_at: now, declaration_ip_hash: ipHash(event), declaration_version: CC.C.DECLARATION_VERSION };
  } else if (data.what === 'agreement') {
    if (CC.agreementIsDraft()) return json(409, { error: 'The client agreement is not ready yet. We\'ll let you know as soon as it is.', code: 'agreementDraft' });
    if (data.version !== CC.AGREEMENT.version) return json(409, { error: 'The agreement has been updated. Please reload the page and read it again.', code: 'agreementChanged' });
    fields = { agreement_version: CC.AGREEMENT.version, agreement_typed_name: typed, agreement_accepted_at: now };
  } else {
    return CC.err(400, 'invalid');
  }
  try {
    const r = await supabase.from('clients').update(fields).eq('id', client.id);
    if (r.error) throw r.error;
    await CC.logEvent(supabase, client.id, data.what === 'declaration' ? 'declaration_signed' : 'agreement_accepted', 'client', data.what === 'agreement' ? 'version ' + CC.AGREEMENT.version : CC.C.DECLARATION_VERSION);
    return json(200, await CC.ownState(supabase, client.id));
  } catch (e) {
    console.error('client-sign failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
