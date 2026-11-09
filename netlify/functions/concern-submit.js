// "Report a concern" (/contact?concern=1, /vi/contact?concern=1). Always
// stored and always notifies the team (reference only). Anyone can use it:
// candidates, clients, anyone. Turnstile when configured; honeypot; limit.
const P = require('../shared/profile-common');
const U = require('../shared/request-utils');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

const ABOUT = ['client', 'woman', 'heritage_union', 'other'];
const ROLES = ['candidate', 'client', 'other'];

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return U.json(405, { error: 'Method not allowed.' });
  const d = U.parseBody(event);
  if (!d) return U.json(400, { error: 'Invalid request.' });
  const vi = d.lang === 'vi';
  const t = (en, v) => (vi ? v : en);
  if (d.website) return U.json(200, { ok: true });
  const about = ABOUT.indexOf(d.about) !== -1 ? d.about : '';
  const role = ROLES.indexOf(d.role) !== -1 ? d.role : '';
  const message = U.cleanText(d.message, 5000);
  if (!about) return U.json(400, { error: t('Please choose who or what this is about.', 'Bạn vui lòng chọn điều này liên quan đến ai.'), field: 'about' });
  if (!role) return U.json(400, { error: t('Please tell us who you are.', 'Bạn vui lòng cho biết bạn là ai.'), field: 'role' });
  if (!message) return U.json(400, { error: t('Please tell us what happened.', 'Bạn vui lòng cho chúng tôi biết chuyện gì đã xảy ra.'), field: 'message' });
  if (U.turnstileConfigured() && !(await U.verifyTurnstile(d.turnstileToken, event))) {
    return U.json(400, { error: t('We could not complete the verification. Please try again.', 'Chưa hoàn tất được bước xác minh. Bạn vui lòng thử lại.'), field: 'turnstile' });
  }
  const sb = P.serviceClient();
  if (!sb) return U.json(500, { error: t('Please email team@heritage-union.com.', 'Bạn vui lòng email team@heritage-union.com.') });
  const ipHash = U.ipHash(event);
  try {
    const since = new Date(Date.now() - 3600000).toISOString();
    const n = await sb.from('concerns').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
    if ((n.count || 0) >= 10) return U.json(429, { error: t('Please try again later, or email team@heritage-union.com.', 'Bạn vui lòng thử lại sau, hoặc email team@heritage-union.com.') });
    const ins = await sb.from('concerns').insert({
      about, reporter_role: role, reporter_name: U.cleanText(d.name, 120) || null, reporter_contact: U.cleanText(d.contact, 200) || null,
      subject_hint: U.cleanText(d.subject, 200) || null, message, lang: vi ? 'vi' : 'en', ip_hash: ipHash,
    }).select('id').single();
    if (ins.error) throw ins.error;
    await sendTeam(E.team.newConcern.build({ concernId: ins.data.id }));
    return U.json(200, { ok: true });
  } catch (e) {
    console.error('concern-submit failed:', e);
    return U.json(502, { error: t('We could not send this just now. Please email team@heritage-union.com.', 'Chưa gửi được. Bạn vui lòng email team@heritage-union.com.') });
  }
};
