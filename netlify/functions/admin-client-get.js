// One client for the team page: details, timeline, declaration, agreement,
// invoices, his profile, choices and introductions (with any certificate a
// woman asked him for: links come from admin-intro op cert_view).
// POST { id }.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const id = ctx.data.id;
  if (!isUuid(id)) return P.json(400, { error: 'Invalid id.' });
  try {
    const c = await ctx.supabase.from('clients').select('*').eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    if (!c.data) return P.json(404, { error: 'Not found.' });
    const ev = await ctx.supabase.from('client_events').select('kind, actor, detail, created_at').eq('client_id', id).order('created_at', { ascending: true });
    const inv = await ctx.supabase.from('client_invoices').select('*').eq('client_id', id).order('created_at', { ascending: true });
    if (ev.error) throw ev.error;
    if (inv.error) throw inv.error;
    const client = Object.assign({}, c.data);
    delete client.access_token_hash;
    delete client.ip_hash;
    delete client.declaration_ip_hash;
    // Phase 2: his profile, photos (10-minute links), shortlist and choices.
    const pr = await ctx.supabase.from('client_profiles').select('*').eq('client_id', id).maybeSingle();
    if (pr.error) throw pr.error;
    const CP = require('../shared/client-profile');
    const photos = pr.data ? await CP.signedPaths(ctx.supabase, CC.DOC_BUCKET, pr.data.photo_paths || []) : [];
    const sl = await ctx.supabase.from('client_shortlists').select('candidate_id, sent_at').eq('client_id', id);
    const ch = await ctx.supabase.from('client_choices').select('candidate_id, rank, chosen_at').eq('client_id', id);
    const names = {};
    const ids = [].concat((sl.data || []).map((x) => x.candidate_id), (ch.data || []).map((x) => x.candidate_id));
    if (ids.length) {
      const cp = await ctx.supabase.from('candidate_profiles').select('candidate_id, display_name').in('candidate_id', ids);
      (cp.data || []).forEach((x) => { names[x.candidate_id] = x.display_name; });
    }
    // Phase 3: introduction requests, her consent records and questions.
    const I = require('../shared/introductions');
    const it = await ctx.supabase.from('introductions').select('*').eq('client_id', id).order('rank', { ascending: true });
    if (it.error) throw it.error;
    const iids = (it.data || []).map((x) => x.id);
    const qs = iids.length ? (await ctx.supabase.from('introduction_questions').select('*').in('introduction_id', iids)).data || [] : [];
    const cids = (it.data || []).map((x) => x.candidate_id);
    const cands = cids.length ? (await ctx.supabase.from('candidates').select('id, preferred_language, status, email').in('id', cids)).data || [] : [];
    const cprofs = cids.length ? (await ctx.supabase.from('candidate_profiles').select('candidate_id, display_name').in('candidate_id', cids)).data || [] : [];
    const otherOpen = {};
    for (const cid of cids) otherOpen[cid] = (await I.introsForWoman(ctx.supabase, cid, I.OPEN)).filter((x) => x.client_id !== id).length > 0;
    const introductions = (it.data || []).map((x) => {
      const cand = cands.find((y) => y.id === x.candidate_id) || {};
      const lang = cand.preferred_language === 'en' ? 'en' : 'vi';
      return {
        id: x.id, candidateId: x.candidate_id, rank: x.rank, replacement: x.is_replacement, status: x.status, statusChangedAt: x.status_changed_at,
        name: (cprofs.find((y) => y.candidate_id === x.candidate_id) || {}).display_name || '—', lang, hasEmail: !!cand.email, herStatus: cand.status,
        sentAt: x.sent_at, sentBy: x.sent_by, openedAt: x.opened_at, decidedAt: x.decided_at, expiresAt: x.decision_token_expires_at,
        introducedAt: x.introduced_at, introducedBy: x.introduced_by, cancelReason: x.cancel_reason, reminderSentAt: x.reminder_sent_at, expiredAt: x.expired_at,
        consent: x.consent, consentTypedName: x.consent_typed_name, consentVersion: x.consent_text_version, decisionLang: x.decision_lang,
        declineReason: x.decline_reason,
        cert: x.cert_requested_at ? {
          requestedAt: x.cert_requested_at, sentAt: x.cert_request_sent_at, sentBy: x.cert_request_sent_by,
          response: x.cert_response, respondedAt: x.cert_responded_at, seenAt: x.cert_seen_at, seenBy: x.cert_seen_by,
          paused: !!x.expiry_paused_at,
        } : null,
        questions: qs.filter((q) => q.introduction_id === x.id).map((q) => ({ message: q.message, at: q.created_at, answeredAt: q.answered_at, answeredBy: q.answered_by })),
        otherOpen: otherOpen[x.candidate_id],
        translationGaps: I.translationGaps(c.data, pr.data, lang),
      };
    });
    // Phase 4: feedback and concerns linked to him.
    const fb = await ctx.supabase.from('client_feedback').select('rating, comments, publish_permission, permission_text_version, created_at').eq('client_id', id);
    const cn = await ctx.supabase.from('concerns').select('id, about, reporter_role, message, created_at, handled_at').eq('client_id', id);
    delete client.feedback_token_hash;
    logAction(ctx.email, 'client_view', id);
    return P.json(200, {
      ok: true,
      client,
      events: ev.data || [],
      invoices: inv.data || [],
      form: CC.FORM,
      agreement: CC.AGREEMENT,
      signupsOpen: CC.C.clientSignupsOpen(),
      paymentDetailsSet: !!process.env.INVOICE_PAYMENT_DETAILS,
      fees: CC.C.FEES,
      profile: pr.data || null,
      profilePhotos: photos,
      profileQuestions: CP.PQ,
      shortlist: (sl.data || []).map((x) => ({ id: x.candidate_id, name: names[x.candidate_id] || '—', sentAt: x.sent_at })),
      choices: (ch.data || []).sort((a, b) => a.rank - b.rank).map((x) => ({ id: x.candidate_id, rank: x.rank, name: names[x.candidate_id] || '—' })),
      introductions,
      feedback: fb.data || [],
      concerns: cn.data || [],
      honourFeeCents: CC.C.FEES.honour.amountCents,
      retentionMonths: CC.C.DOCUMENT_RETENTION_MONTHS_AFTER_CLOSE,
      maxIntroductions: CC.C.MAX_INTRODUCTIONS,
    });
  } catch (e) {
    console.error('admin-client-get failed:', e);
    return P.json(502, { error: 'Could not load this client.' });
  }
};
