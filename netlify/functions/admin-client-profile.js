// The team's work on his profile. POST { id, op, ... }
//   summary_save  { html }                 James's English summary (draft)
//   summary_send  {}                       R9: he reads and approves it
//   translate     { summaryVi?, declarationVi?, messageVi? }   Huyen's translations
// The team never edits his answers.
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sanitizeHtml, textOf } = require('../shared/sanitize-html');
const { sendEmail } = require('../shared/emails/send');
const { clientPageLink } = require('../shared/emails/refs');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const sb = ctx.supabase;
  const { id, op } = ctx.data;
  if (!isUuid(id) || ['summary_save', 'summary_send', 'translate'].indexOf(op) === -1) return P.json(400, { error: 'Invalid request.' });
  try {
    const c = await S.fullClient(sb, id).catch(() => null);
    if (!c) return P.json(404, { error: 'Not found.' });
    const prof = await S.loadProfile(sb, id);
    if (!prof || !prof.submitted_at) return P.json(409, { error: 'He hasn\'t sent his profile yet.' });
    const now = new Date().toISOString();
    let fields;
    if (op === 'summary_save') {
      const html = sanitizeHtml(ctx.data.html, 20000);
      if (!textOf(html)) return P.json(400, { error: 'The summary is empty.' });
      if (prof.summary_approved_at) return P.json(409, { error: 'He has already approved this summary.' });
      fields = { summary_html: html, summary_by: ctx.email, summary_at: now };
    } else if (op === 'summary_send') {
      if (c.status !== 'active') return P.json(409, { error: 'His engagement isn\'t active.' });
      if (!prof.summary_html) return P.json(409, { error: 'Write and save the summary first.' });
      if (prof.summary_approved_at) return P.json(409, { error: 'He has already approved this summary.' });
      const t = CC.newClientToken(CC.C.CLIENT_LINK_DAYS);
      const u = await sb.from('clients').update({ access_token_hash: t.hash, access_token_expires_at: t.expiresAt, link_sent_at: now }).eq('id', id);
      if (u.error) throw u.error;
      fields = { summary_sent_at: now, changes_requested_at: null };
      const ok = await sendEmail((c.application && c.application.email) || c.email, E.R9.build({ firstName: CC.firstName(c.full_name), link: clientPageLink(t.token), expiresOn: CC.fmtDate(t.expiresAt) }));
      if (!ok) console.error('R9 email failed for', id);
    } else {
      fields = { translated_by: ctx.email, translated_at: now };
      if (typeof ctx.data.summaryVi === 'string') fields.summary_vi_html = sanitizeHtml(ctx.data.summaryVi, 20000);
      if (typeof ctx.data.messageVi === 'string') fields.message_vi = ctx.data.messageVi.normalize('NFC').trim().slice(0, 2000);
      if (ctx.data.declarationVi && typeof ctx.data.declarationVi === 'object') {
        const ids = CC.FORM.fields.filter((f) => f.section === 'declaration' && f.type !== 'document').map((f) => f.id);
        const dv = Object.assign({}, prof.declaration_vi || {});
        for (const k of Object.keys(ctx.data.declarationVi)) {
          if (ids.indexOf(k) === -1) return P.json(400, { error: 'Unknown declaration item.' });
          const v = String(ctx.data.declarationVi[k] || '').normalize('NFC').trim().slice(0, 3000);
          if (v) dv[k] = v; else delete dv[k];
        }
        fields.declaration_vi = dv;
      }
    }
    await S.saveProfile(sb, id, prof, fields);
    await CC.logEvent(sb, id, 'profile_' + op, ctx.email);
    logAction(ctx.email, 'client_profile_' + op, id);
    return P.json(200, { ok: true });
  } catch (e) {
    console.error('admin-client-profile failed:', e);
    return P.json(502, { error: 'Could not save just now.' });
  }
};
