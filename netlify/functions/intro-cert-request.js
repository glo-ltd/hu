// "Ask him for an official background check first". POST { token, lang }.
// Heritage Union does not check his declaration. She may ask him for an
// official criminal record certificate before she decides: this records her
// request, pauses her 30-day expiry, and emails the team a reference only.
// The team then sends him the request (R22); providing one is his choice.
const { json } = require('../shared/request-utils');
const I = require('../shared/introductions');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await I.decisionFromRequest(event);
  if (ctx.response) return ctx.response;
  const { sb, intro } = ctx;
  if (['sent', 'opened'].indexOf(intro.status) === -1) return json(409, { error: 'Bạn đã trả lời lời mời này rồi. Nếu có câu hỏi, hãy nhắn cho Heritage Union qua Zalo.', error_en: 'You have already answered this request. For any questions, message Heritage Union on Zalo.', code: 'decided' });
  try {
    if (!intro.cert_requested_at) {
      const now = new Date().toISOString();
      const u = await sb.from('introductions').update({ cert_requested_at: now, expiry_paused_at: now }).eq('id', intro.id).is('cert_requested_at', null);
      if (u.error) throw u.error;
      intro.cert_requested_at = now;
      await CC.logEvent(sb, intro.client_id, 'intro_cert_requested', 'woman', I.introRef(intro.id));
      await sendTeam(E.team.certRequested.build({ clientId: intro.client_id, introId: intro.id }));
    }
    return json(200, { ok: true, certificate: await I.certStateForHer(sb, intro) });
  } catch (e) {
    console.error('intro-cert-request failed:', e);
    return I.herErr(502, 'failed');
  }
};
