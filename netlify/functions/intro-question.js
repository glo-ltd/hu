// "I have a question first". POST { token, lang, message }. Stores her
// message and emails the team a reference only.
const { json } = require('../shared/request-utils');
const I = require('../shared/introductions');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

exports.handler = async function (event) {
  const ctx = await I.decisionFromRequest(event);
  if (ctx.response) return ctx.response;
  const { sb, intro, data, lang } = ctx;
  const message = typeof data.message === 'string' ? data.message.normalize('NFC').trim().slice(0, 2000) : '';
  if (!message) return json(400, { error: 'Bạn vui lòng viết câu hỏi của bạn.', error_en: 'Please write your question.', code: 'message', field: 'message' });
  if (['sent', 'opened'].indexOf(intro.status) === -1) return json(409, { error: 'Bạn đã trả lời lời mời này rồi. Nếu có câu hỏi, hãy nhắn cho Heritage Union qua Zalo.', error_en: 'You have already answered this request. For any questions, message Heritage Union on Zalo.', code: 'decided' });
  try {
    const r = await sb.from('introduction_questions').insert({ introduction_id: intro.id, message, lang });
    if (r.error) throw r.error;
    await CC.logEvent(sb, intro.client_id, 'intro_question', 'woman', I.introRef(intro.id));
    await sendTeam(E.team.introQuestion.build({ clientId: intro.client_id, introId: intro.id }));
    return json(200, { ok: true });
  } catch (e) {
    console.error('intro-question failed:', e);
    return I.herErr(502, 'failed');
  }
};
