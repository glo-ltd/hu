// Her decision page loads from here (/vi/gioi-thieu and /introduction).
// POST { token, lang }. Marks the request "opened" the first time.
// Returns only what she needs: his first name, age, country, city, summary,
// photos, message and background declaration in her language; her own
// contact details to pre-fill the form; and the state of her answer.
const { json } = require('../shared/request-utils');
const I = require('../shared/introductions');
const CC = require('../shared/client-common');
const P = require('../shared/profile-common');

exports.handler = async function (event) {
  const ctx = await I.decisionFromRequest(event);
  if (ctx.response) return ctx.response;
  const { sb, intro, candidate, lang } = ctx;
  try {
    if (intro.status === 'sent') {
      await sb.from('introductions').update({ status: 'opened', status_changed_at: new Date().toISOString(), opened_at: new Date().toISOString() }).eq('id', intro.id).eq('status', 'sent');
      intro.status = 'opened';
    }
    const c = await sb.from('clients').select('*').eq('id', intro.client_id).single();
    const pr = await sb.from('client_profiles').select('*').eq('client_id', intro.client_id).single();
    if (c.error || pr.error) throw c.error || pr.error;
    const herProf = await sb.from('candidate_profiles').select('display_name').eq('candidate_id', candidate.id).maybeSingle();
    const him = await I.hisViewForHer(sb, c.data, pr.data, lang);
    const out = {
      ok: true,
      lang,
      status: intro.status,
      expiresAt: intro.decision_token_expires_at,
      name: (herProf.data && herProf.data.display_name) || P.givenName(candidate.full_name),
      him,
      prefill: { zalo: candidate.zalo_number, email: candidate.email || '', phone: candidate.zalo_number },
      consentVersion: I.CONSENT_VERSION[lang],
      decision: ['accepted', 'introduced', 'declined', 'expired'].indexOf(intro.status) !== -1 ? {
        status: intro.status, decidedAt: intro.decided_at, shared: intro.consent || null,
      } : null,
    };
    // Once introduced, she can also see his contact details here.
    if (intro.status === 'introduced') {
      const a = c.data.application || {};
      out.hisContact = { email: a.email || c.data.email, phone: a.phone || null };
    }
    return json(200, out);
  } catch (e) {
    console.error('intro-get failed:', e);
    return I.herErr(502, 'failed');
  }
};
