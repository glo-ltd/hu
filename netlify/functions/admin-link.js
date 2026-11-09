// "Copy Zalo message": makes a fresh private link (the old one stops
// working) and returns a ready-to-paste Vietnamese message. POST { id }.
const P = require('../shared/profile-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

function zaloMessage(name, link) {
  return [
    'Chào ' + name + ',',
    '',
    'Heritage Union cảm ơn bạn đã đăng ký. Bạn vui lòng trả lời tin nhắn này để xác nhận đây đúng là Zalo của bạn nhé.',
    '',
    'Đây là đường link riêng để bạn tự hoàn thiện hồ sơ của mình (khoảng 10 phút):',
    link,
    'Đường link này chỉ dành riêng cho bạn, bạn vui lòng không chia sẻ cho người khác.',
    '',
    'Đăng ký hoàn toàn miễn phí, và bạn sẽ không bao giờ phải trả bất kỳ khoản tiền nào.',
    '',
    'Nếu muốn rút đăng ký, bạn chỉ cần trả lời "RÚT" hoặc vào heritage-union.com/vi/withdraw.',
    '',
    'Trân trọng,',
    'Heritage Union',
  ].join('\n');
}

exports.handler = async function (event) {
  var ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  var id = ctx.data.id;
  if (!isUuid(id)) return P.json(400, { error: 'Invalid id.' });
  try {
    var c = await ctx.supabase.from('candidates').select('id, full_name, status').eq('id', id).maybeSingle();
    if (c.error) throw c.error;
    if (!c.data || c.data.status === 'deleted') return P.json(404, { error: 'Not found.' });
    if (c.data.status === 'withdrawn') return P.json(409, { error: 'She has withdrawn. Do not send her a link.' });
    var prof = await ctx.supabase.from('candidate_profiles').select('display_name').eq('candidate_id', id).maybeSingle();
    var name = (prof.data && prof.data.display_name) || P.givenName(c.data.full_name);

    var t = P.newProfileToken();
    var now = new Date().toISOString();
    var upd = await ctx.supabase
      .from('candidates')
      .update({ profile_token_hash: t.hash, profile_token_expires_at: t.expiresAt, profile_link_sent_at: now })
      .eq('id', id);
    if (upd.error) throw upd.error;
    logAction(ctx.email, 'new_profile_link', id);
    var link = P.profileLink(t.token);
    return P.json(200, { ok: true, message: zaloMessage(name, link), link: link, expiresAt: t.expiresAt, sentAt: now });
  } catch (err) {
    console.error('admin-link failed:', err);
    return P.json(502, { error: 'Could not create a link.' });
  }
};

exports.zaloMessage = zaloMessage;
