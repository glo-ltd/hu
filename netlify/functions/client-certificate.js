// A certificate a woman asked him for (optional; his choice).
// POST { token, introId, op, type?, path? }
//   upload-url  a signed upload URL for <id>/certificate/<uuid>.<pdf|jpg|png>
//   confirm     checks the file really is a PDF/JPEG/PNG of at most 10 MB,
//               records it and tells the team, who look at it and mark it
//               seen before she can open it (through a 10-minute link).
//   decline     "I'd rather not": she is told he chose not to provide one,
//               and her 30-day expiry starts running again.
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const I = require('../shared/introductions');
const S = require('../shared/client-stage');
const E = require('../shared/emails');
const { sendTeam } = require('../shared/emails/send');

function isUuid(v) { return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v); }

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  const { op, introId, type, path } = ctx.data;
  if (!isUuid(introId) || ['upload-url', 'confirm', 'decline'].indexOf(op) === -1) return CC.err(400, 'invalid');
  const sb = ctx.supabase;
  const bucket = sb.storage.from(CC.DOC_BUCKET);
  try {
    const r = await sb.from('introductions').select('*').eq('id', introId).eq('client_id', ctx.client.id).maybeSingle();
    if (r.error) throw r.error;
    const intro = r.data;
    if (!intro || !intro.cert_request_sent_at) return CC.err(400, 'invalid');
    if (['sent', 'opened'].indexOf(intro.status) === -1) return json(409, { error: 'This request is no longer open, so nothing more is needed.', code: 'closed' });
    if (intro.cert_response) return json(409, { error: 'You have already answered this request.', code: 'answered' });
    const now = new Date().toISOString();

    if (op === 'upload-url') {
      const ext = CC.EXT_BY_TYPE[type];
      if (!ext) return json(400, { error: 'Please choose a PDF, JPEG or PNG file.', code: 'type' });
      const p = CC.docPath(ctx.client.id, 'certificate', ext);
      const u = await bucket.createSignedUploadUrl(p);
      if (u.error) throw u.error;
      return json(200, { ok: true, path: p, signedUrl: u.data.signedUrl });
    }
    if (op === 'confirm') {
      if (!CC.isOwnDocPath(ctx.client.id, 'certificate', path)) return CC.err(400, 'invalid');
      const dl = await bucket.download(path);
      if (dl.error || !dl.data) return json(400, { error: 'We couldn\'t find that file. Please try again.', code: 'missing' });
      const bytes = Buffer.from(await dl.data.arrayBuffer());
      if (bytes.length > CC.C.DOCUMENT_MAX_BYTES) { await bucket.remove([path]); return json(400, { error: 'That file is larger than 10 MB. Please try a smaller one.', code: 'size' }); }
      if (!CC.sniffMatches(bytes, path)) { await bucket.remove([path]); return json(400, { error: 'That file couldn\'t be read as a PDF, JPEG or PNG. Please try another.', code: 'type' }); }
      const u = await sb.from('introductions').update({ cert_response: 'provided', cert_path: path, cert_responded_at: now }).eq('id', intro.id).is('cert_response', null);
      if (u.error) throw u.error;
      await CC.logEvent(sb, intro.client_id, 'intro_cert_provided', 'client', I.introRef(intro.id));
      await sendTeam(E.team.certProvided.build({ clientId: intro.client_id, introId: intro.id }));
    } else {
      const u = await sb.from('introductions').update(Object.assign({ cert_response: 'declined', cert_responded_at: now }, I.resumedExpiryFields(intro))).eq('id', intro.id).is('cert_response', null);
      if (u.error) throw u.error;
      await CC.logEvent(sb, intro.client_id, 'intro_cert_declined', 'client', I.introRef(intro.id));
      await sendTeam(E.team.certDeclined.build({ clientId: intro.client_id, introId: intro.id }));
    }
    return json(200, { ok: true, state: await CC.ownState(sb, ctx.client.id) });
  } catch (e) {
    console.error('client-certificate failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
