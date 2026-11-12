// R17 to him after a "no" or an expired request: kind, no reasons. If he
// can still choose someone else, it carries a fresh link to his page.
const CC = require('./client-common');
const I = require('./introductions');
const E = require('./emails');
const { sendEmail } = require('./emails/send');
const { clientPageLink } = require('./emails/refs');

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

module.exports = { notifyHimNotThisTime };
