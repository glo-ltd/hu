// His private page loads from here. POST { token }.
const CC = require('../shared/client-common');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  try {
    return require('../shared/request-utils').json(200, await CC.ownState(ctx.supabase, ctx.client.id));
  } catch (e) {
    console.error('client-get failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
