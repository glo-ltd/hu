// His profile photos: confirm an upload, delete one, or reorder.
// POST { token, op: 'confirm'|'delete'|'order', path?, paths? }
const { json } = require('../shared/request-utils');
const CC = require('../shared/client-common');
const CP = require('../shared/client-profile');
const S = require('../shared/client-stage');

exports.handler = async function (event) {
  const ctx = await CC.clientFromRequest(event);
  if (ctx.response) return ctx.response;
  const blocked = S.notActive(ctx.client);
  if (blocked) return blocked;
  const { op, path, paths } = ctx.data;
  const sb = ctx.supabase;
  const bucket = sb.storage.from(CC.DOC_BUCKET);
  try {
    const prof = await S.loadProfile(sb, ctx.client.id);
    if (prof && prof.submitted_at) return json(409, { error: 'Your profile has already been sent.', code: 'locked' });
    let list = (prof && prof.photo_paths) || [];
    if (op === 'confirm') {
      if (!CP.isOwnPhotoPath(ctx.client.id, path)) return CC.err(400, 'invalid');
      if (list.indexOf(path) === -1) {
        if (list.length >= CC.C.CLIENT_PHOTOS_MAX) { await bucket.remove([path]); return json(400, { error: 'You can add up to ' + CC.C.CLIENT_PHOTOS_MAX + ' photos.', code: 'tooManyPhotos' }); }
        const dl = await bucket.download(path);
        if (dl.error || !dl.data) return json(400, { error: 'We couldn\'t find that photo. Please try again.', code: 'missing' });
        const bytes = Buffer.from(await dl.data.arrayBuffer());
        if (!CC.sniffMatches(bytes, path)) { await bucket.remove([path]); return json(400, { error: 'That photo couldn\'t be read. Please try another.', code: 'type' }); }
        list = list.concat([path]);
      }
    } else if (op === 'delete') {
      if (!CP.isOwnPhotoPath(ctx.client.id, path) || list.indexOf(path) === -1) return CC.err(400, 'invalid');
      await bucket.remove([path]);
      list = list.filter((p) => p !== path);
    } else if (op === 'order') {
      const ok = Array.isArray(paths) && paths.length === list.length && new Set(paths).size === paths.length && paths.every((p) => list.indexOf(p) !== -1);
      if (!ok) return CC.err(400, 'invalid');
      list = paths.slice();
    } else {
      return CC.err(400, 'invalid');
    }
    await S.saveProfile(sb, ctx.client.id, prof, { photo_paths: list });
    return json(200, { ok: true, photos: await CP.signedPaths(sb, CC.DOC_BUCKET, list) });
  } catch (e) {
    console.error('client-photo-update failed:', e);
    return CC.err(502, 'saveFailed');
  }
};
