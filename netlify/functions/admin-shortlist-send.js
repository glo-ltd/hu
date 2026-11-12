// "Send to client": up to 20 women, then R11 with a 30-day review link.
// POST { id, candidateIds }. Every woman must still be eligible and every
// free-text answer she wrote must have an English translation.
// Re-sending before he has chosen replaces the earlier list.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sendEmail } = require('../shared/emails/send');
const { clientPageLink } = require('../shared/emails/refs');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const { id, candidateIds } = ctx.data;
  if (!isUuid(id) || !Array.isArray(candidateIds) || !candidateIds.length || candidateIds.length > CC.C.SHORTLIST_MAX ||
      new Set(candidateIds).size !== candidateIds.length || !candidateIds.every(isUuid)) {
    return P.json(400, { error: 'Choose between 1 and ' + CC.C.SHORTLIST_MAX + ' women.' });
  }
  try {
    const c = await S.fullClient(sb, id).catch(() => null);
    if (!c) return P.json(404, { error: 'Not found.' });
    if (c.status !== 'active') return P.json(409, { error: c.status === 'paused' ? 'His engagement is paused.' : 'His engagement isn\'t active.' });
    const prof = await S.loadProfile(sb, id);
    if (!prof || !prof.summary_approved_at) return P.json(409, { error: 'He must approve his profile summary first.' });
    if (c.choices_submitted_at) return P.json(409, { error: 'He has already sent his choices.' });
    const cs = await sb.from('candidates').select('id, status, consent_profile_sharing_at, preferred_language').in('id', candidateIds);
    const ps = await sb.from('candidate_profiles').select('candidate_id, answers, translations').in('candidate_id', candidateIds);
    if (cs.error) throw cs.error;
    if (ps.error) throw ps.error;
    for (const cid of candidateIds) {
      const cand = (cs.data || []).find((x) => x.id === cid);
      const p = (ps.data || []).find((x) => x.candidate_id === cid);
      if (!CP.eligible(cand) || !p) return P.json(409, { error: 'One of the women is no longer available (withdrawn, or no sharing consent). Reload the matching screen.' });
      if (CP.untranslated(cand, p).length) return P.json(409, { error: 'One of the women still has answers without an English translation. Translate them on her page first.' });
    }
    const now = new Date().toISOString();
    const del = await sb.from('client_shortlists').delete().eq('client_id', id);
    if (del.error) throw del.error;
    const ins = await sb.from('client_shortlists').insert(candidateIds.map((cid) => ({ client_id: id, candidate_id: cid, added_by: ctx.email, sent_at: now })));
    if (ins.error) throw ins.error;
    const t = CC.newClientToken(CC.C.REVIEW_LINK_DAYS);
    const u = await sb.from('clients').update({ shortlist_sent_at: now, access_token_hash: t.hash, access_token_expires_at: t.expiresAt, link_sent_at: now }).eq('id', id);
    if (u.error) throw u.error;
    const ok = await sendEmail((c.application && c.application.email) || c.email, E.R11.build({
      firstName: CC.firstName(c.full_name), count: candidateIds.length, link: clientPageLink(t.token), expiresOn: CC.fmtDate(t.expiresAt),
    }));
    await CC.logEvent(sb, id, 'shortlist_sent', ctx.email, candidateIds.length + ' women');
    logAction(ctx.email, 'shortlist_send', id);
    return P.json(200, ok ? { ok: true } : { ok: true, warning: 'Shortlist saved, but the email failed. Use "Send a new private link".' });
  } catch (e) {
    console.error('admin-shortlist-send failed:', e);
    return P.json(502, { error: 'Could not send just now.' });
  }
};
