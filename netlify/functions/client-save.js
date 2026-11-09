// Saves one section of his application or background declaration.
// POST { token, section: 'application'|'declaration', answers: {id: value} }.
// "Required" is only enforced when he submits. Nothing can change after
// submitting, except through the team.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');

const EDITABLE = ['invited', 'applying'];

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const { supabase, client, data } = ctx;
  const section = data.section;
  if (section !== 'application' && section !== 'declaration') return CC.err(400, 'invalid');
  if (EDITABLE.indexOf(client.status) === -1) return json(409, { error: 'Your application has been sent, so it can no longer be changed here. If something needs correcting, please reply to any email from us.', code: 'locked' });
  const merged = CC.mergeSection(section, client[section], data.answers);
  if (merged.error) return json(400, { error: merged.message || CC.MSG.invalid, code: merged.error, field: merged.field });
  const fields = {};
  fields[section] = merged.values;
  // Changing a declaration answer after signing means it must be signed again.
  if (section === 'declaration' && client.declaration_signed_at && JSON.stringify(merged.values) !== JSON.stringify(client.declaration || {})) {
    Object.assign(fields, { declaration_signed_at: null, declaration_typed_name: null, declaration_ip_hash: null, declaration_version: null });
  }
  if (client.status === 'invited') Object.assign(fields, { status: 'applying', status_changed_at: new Date().toISOString() });
  try {
    const r = await supabase.from('clients').update(fields).eq('id', client.id);
    if (r.error) throw r.error;
    if (client.status === 'invited') await CC.logEvent(supabase, client.id, 'application_started', 'client');
    return json(200, await CC.ownState(supabase, client.id));
  } catch (e) {
    console.error('client-save failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
