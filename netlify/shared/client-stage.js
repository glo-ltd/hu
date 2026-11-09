// Small shared pieces for the phase 2+ client functions.
const { json } = require('./request-utils');
const CC = require('./client-common');

async function loadProfile(supabase, clientId) {
  const r = await supabase.from('client_profiles').select('*').eq('client_id', clientId).maybeSingle();
  if (r.error) throw r.error;
  return r.data;
}

async function saveProfile(supabase, clientId, existing, fields) {
  if (existing) {
    const u = await supabase.from('client_profiles').update(fields).eq('client_id', clientId).select('*').single();
    if (u.error) throw u.error;
    return u.data;
  }
  const CP = require('./client-profile');
  const ins = await supabase.from('client_profiles').insert(Object.assign({ client_id: clientId, questions_version: CP.PQ.version, answers: {} }, fields)).select('*').single();
  if (ins.error) throw ins.error;
  return ins.data;
}

function notActive(client) {
  if (client.status === 'paused') return json(409, { error: 'Your engagement is paused for the moment. James will be in touch with you directly.', code: 'paused' });
  if (client.status !== 'active') return json(409, { error: 'This step opens once your payment has been received.', code: 'notActive' });
  return null;
}

async function fullClient(supabase, id) {
  const r = await supabase.from('clients').select('*').eq('id', id).single();
  if (r.error) throw r.error;
  return r.data;
}

module.exports = { loadProfile, saveProfile, notActive, fullClient, CC };
