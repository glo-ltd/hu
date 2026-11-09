// The Introductions screen on his client page. POST { id, op, introId }.
//   send       "Send to her": only when the request is ready, she has no other
//              open request, his engagement is active, and the texts exist in
//              her language. Makes her decision link (30 days), emails R13 if
//              she has an email, and returns the R13 Zalo message to copy.
//   resend     a fresh decision link and Zalo message (the old link stops).
//   introduce  after she said yes: R15 to him, R16 to her (email if she has
//              one, plus a Zalo message to copy). Status "introduced".
//   cancel     the team withdraws a request that hasn't been answered.
//   answered   mark her question answered.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const I = require('../shared/introductions');
const E = require('../shared/emails');
const { sendEmail } = require('../shared/emails/send');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const { id, op, introId } = ctx.data;
  if (!isUuid(id) || !isUuid(introId) || ['send', 'resend', 'introduce', 'cancel', 'answered', 'reminder'].indexOf(op) === -1) return P.json(400, { error: 'Invalid request.' });
  try {
    const ir = await sb.from('introductions').select('*').eq('id', introId).eq('client_id', id).maybeSingle();
    if (ir.error) throw ir.error;
    const intro = ir.data;
    if (!intro) return P.json(404, { error: 'Not found.' });
    const c = (await sb.from('clients').select('*').eq('id', id).single()).data;
    const prof = (await sb.from('client_profiles').select('*').eq('client_id', id).maybeSingle()).data;
    const cand = (await sb.from('candidates').select('id, full_name, status, preferred_language, email, zalo_number, consent_profile_sharing_at').eq('id', intro.candidate_id).single()).data;
    const herProf = (await sb.from('candidate_profiles').select('display_name').eq('candidate_id', intro.candidate_id).maybeSingle()).data || {};
    const lang = cand.preferred_language === 'en' ? 'en' : 'vi';
    const herName = herProf.display_name || P.givenName(cand.full_name);
    const now = new Date().toISOString();
    let out = {};

    if (op === 'send' || op === 'resend') {
      if (op === 'send' && intro.status !== 'ready') return P.json(409, { error: intro.status === 'queued' ? 'She has another request open. This one waits until she answers it.' : 'This request can\'t be sent now.' });
      if (op === 'resend' && ['sent', 'opened'].indexOf(intro.status) === -1) return P.json(409, { error: 'Only a sent request can get a new link.' });
      if (c.status !== 'active') return P.json(409, { error: c.status === 'paused' ? 'His engagement is paused.' : 'His engagement isn\'t active.' });
      if (['withdrawn', 'deleted'].indexOf(cand.status) !== -1 || !cand.consent_profile_sharing_at) return P.json(409, { error: 'She is no longer available.' });
      const open = (await I.introsForWoman(sb, cand.id, I.OPEN)).filter((x) => x.id !== intro.id);
      if (open.length) return P.json(409, { error: 'She already has another request open. Wait for her answer.' });
      const gaps = I.translationGaps(c, prof, lang);
      if (gaps.length) return P.json(409, { error: 'The Vietnamese translations aren\'t complete yet (' + gaps.join(', ') + '). Huyen can add them on his page.' });
      const t = I.newDecisionToken();
      const u = await sb.from('introductions').update({ status: op === 'send' ? 'sent' : intro.status, status_changed_at: now, decision_token_hash: t.hash, decision_token_expires_at: t.expiresAt, sent_at: now, sent_by: ctx.email, reminder_sent_at: null }).eq('id', intro.id);
      if (u.error) throw u.error;
      const d = { lang, name: herName, link: I.decisionLink(t.token, lang), expiresOn: new Date(t.expiresAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', { day: 'numeric', month: lang === 'en' ? 'long' : 'numeric', year: 'numeric' }) };
      out.zalo = E.R13.zalo(d);
      out.emailed = cand.email ? await sendEmail(cand.email, E.R13.build(d)) : false;
      out.lang = lang;
    } else if (op === 'introduce') {
      if (intro.status !== 'accepted') return P.json(409, { error: 'Only a request she has said yes to can be introduced.' });
      if (c.status !== 'active') return P.json(409, { error: 'His engagement isn\'t active.' });
      const a = c.application || {};
      const shared = intro.consent || {};
      const hisName = (prof && prof.display_name) || CC.firstName(c.full_name);
      const r15 = await sendEmail(a.email || c.email, E.R15.build({ firstName: CC.firstName(c.full_name), herName, details: { zalo: shared.zalo, email: shared.email, phone: shared.phone }, contact: shared.contact || [] }));
      if (!r15) return P.json(502, { error: 'The email to him could not be sent, so nothing was changed. Try again.' });
      const d16 = { lang, name: herName, hisName, hisEmail: a.email || c.email, hisPhone: a.phone || null };
      out.zalo = E.R16.zalo(d16);
      out.emailed = cand.email ? await sendEmail(cand.email, E.R16.build(d16)) : false;
      out.lang = lang;
      await I.setIntroStatus(sb, intro, 'introduced', { introduced_at: now, introduced_by: ctx.email, decision_token_hash: intro.decision_token_hash });
    } else if (op === 'cancel') {
      if (I.PENDING.indexOf(intro.status) === -1) return P.json(409, { error: 'Only a request that hasn\'t been answered can be cancelled.' });
      await I.setIntroStatus(sb, intro, 'cancelled', { cancelled_at: now, cancel_reason: 'team', decision_token_hash: null, decision_token_expires_at: null });
    } else if (op === 'reminder') {
      // The R14 text for a woman without email, to paste into Zalo.
      if (I.OPEN.indexOf(intro.status) === -1) return P.json(409, { error: 'This request isn\'t waiting for her answer.' });
      out.zalo = E.R14.zalo({ lang, name: herName, expiresOn: new Date(intro.decision_token_expires_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', { day: 'numeric', month: lang === 'en' ? 'long' : 'numeric', year: 'numeric' }) });
      out.lang = lang;
    } else if (op === 'answered') {
      const q = await sb.from('introduction_questions').update({ answered_at: now, answered_by: ctx.email }).eq('introduction_id', intro.id).is('answered_at', null);
      if (q.error) throw q.error;
    }
    await CC.logEvent(sb, id, 'intro_' + op, ctx.email, I.introRef(intro.id));
    logAction(ctx.email, 'intro_' + op, id);
    return P.json(200, Object.assign({ ok: true }, out));
  } catch (e) {
    console.error('admin-intro failed:', e);
    return P.json(502, { error: 'Could not do that just now.' });
  }
};
