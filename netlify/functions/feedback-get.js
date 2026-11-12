// R21 feedback form (/feedback#t=...). POST { token } -> his first name and
// whether he has already answered.
const { json } = require('../shared/request-utils');
const FB = require('../shared/feedback');

exports.handler = async function (event) {
  const ctx = await FB.fromRequest(event);
  if (ctx.response) return ctx.response;
  return json(200, { ok: true, firstName: ctx.firstName, country: ctx.country, permissionText: FB.PERMISSION_TEXT, options: FB.OPTIONS });
};
