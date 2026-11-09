// Her answer. POST { token, lang, decision: 'accept'|'decline', ... }
//   accept: { share: { zalo?, email?, phone? }, contact: ['messages'|'voice'|'video'], agree: true, typedName }
//           Stores exactly what she chose, the wording version, time and IP hash.
//           Nothing reaches him until the team taps "Introduce".
//   decline: { reason? }  The reason is private and never shown to him.
//            He gets R17, kind and without reasons.
// TODO(James): counsel to approve the consent wording on her decision page.
const { json, ipHash } = require('../shared/request-utils');
const I = require('../shared/introductions');
const CC = require('../shared/client-common');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');
const { clientPageLink } = require('../shared/emails/refs');

function bad(code, vi, en, field) { return json(400, { error: vi, error_en: en, code, field }); }

exports.handler = async function (event) {
  const ctx = await I.decisionFromRequest(event);
  if (ctx.response) return ctx.response;
  const { sb, intro, data, lang } = ctx;
  if (['sent', 'opened'].indexOf(intro.status) === -1) return json(409, { error: 'Bạn đã trả lời lời mời này rồi.', error_en: 'You have already answered this request.', code: 'decided' });
  const now = new Date().toISOString();
  try {
    if (data.decision === 'accept') {
      const share = {};
      const s = data.share || {};
      for (const k of ['zalo', 'email', 'phone']) {
        if (typeof s[k] !== 'string' || !s[k].trim()) continue;
        const v = s[k].normalize('NFC').trim().slice(0, 120);
        if (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return bad('email', 'Bạn vui lòng kiểm tra lại địa chỉ email.', 'Please check the email address.', 'email');
        if ((k === 'zalo' || k === 'phone') && !/^[+0-9 ().-]{6,30}$/.test(v)) return bad(k, 'Bạn vui lòng kiểm tra lại số điện thoại.', 'Please check the phone number.', k);
        share[k] = v;
      }
      if (!Object.keys(share).length) return bad('share', 'Bạn vui lòng chọn ít nhất một cách để anh ấy liên lạc với bạn.', 'Please choose at least one way for him to contact you.', 'share');
      const contact = Array.isArray(data.contact) ? data.contact.filter((m) => I.CONTACT_METHODS.indexOf(m) !== -1) : [];
      if (!contact.length) return bad('contact', 'Bạn vui lòng chọn cách bạn muốn được liên lạc lần đầu.', 'Please choose how you would like the first contact to be.', 'contact');
      if (data.agree !== true) return bad('agree', 'Bạn vui lòng đánh dấu ô đồng ý.', 'Please tick the box to agree.', 'agree');
      const typed = typeof data.typedName === 'string' ? data.typedName.normalize('NFC').trim().replace(/\s+/g, ' ').slice(0, 120) : '';
      if (typed.length < 2) return bad('typedName', 'Bạn vui lòng gõ tên của bạn để xác nhận.', 'Please type your name to confirm.', 'typedName');
      share.contact = Array.from(new Set(contact));
      await I.setIntroStatus(sb, intro, 'accepted', {
        decided_at: now, decision_lang: lang, consent: share, consent_typed_name: typed, consent_text_version: I.CONSENT_VERSION[lang],
        consent_ip_hash: ipHash(event),
      });
      await CC.logEvent(sb, intro.client_id, 'intro_accepted', 'woman', I.introRef(intro.id));
      await sendTeam(E.team.introAccepted.build({ clientId: intro.client_id, introId: intro.id }));
    } else if (data.decision === 'decline') {
      const reason = typeof data.reason === 'string' ? data.reason.normalize('NFC').trim().slice(0, 2000) : '';
      await I.setIntroStatus(sb, intro, 'declined', { decided_at: now, decision_lang: lang, decline_reason: reason || null });
      await CC.logEvent(sb, intro.client_id, 'intro_declined', 'woman', I.introRef(intro.id));
      await notifyHimNotThisTime(sb, intro);
      await sendTeam(E.team.introDeclined.build({ clientId: intro.client_id, introId: intro.id }));
    } else {
      return bad('decision', 'Yêu cầu không hợp lệ.', 'Invalid request.');
    }
    return json(200, { ok: true, status: data.decision === 'accept' ? 'accepted' : 'declined' });
  } catch (e) {
    console.error('intro-decide failed:', e);
    return I.herErr(502, 'failed');
  }
};

// R17 to him: kind, no reasons. If he has introductions left and women on
// his list he hasn't chosen yet, a fresh link to choose someone else.
async function notifyHimNotThisTime(sb, intro) {
  const c = (await sb.from('clients').select('*').eq('id', intro.client_id).single()).data;
  const herName = ((await sb.from('candidate_profiles').select('display_name').eq('candidate_id', intro.candidate_id).maybeSingle()).data || {}).display_name || 'her';
  const canReplace = c.status === 'active' && (await I.usedCount(sb, c.id)) < CC.C.MAX_INTRODUCTIONS;
  const d = { firstName: CC.firstName(c.full_name), herName, canReplace };
  if (canReplace) {
    const t = CC.newClientToken(CC.C.CLIENT_LINK_DAYS);
    await sb.from('clients').update({ access_token_hash: t.hash, access_token_expires_at: t.expiresAt, link_sent_at: new Date().toISOString() }).eq('id', c.id);
    d.link = clientPageLink(t.token);
    d.expiresOn = CC.fmtDate(t.expiresAt);
  }
  await sendEmail((c.application && c.application.email) || c.email, E.R17.build(d));
  await sb.from('introductions').update({ declined_notice_sent_at: new Date().toISOString() }).eq('id', intro.id);
}

exports.notifyHimNotThisTime = notifyHimNotThisTime;
