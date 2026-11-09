// Saves the team's English translation of her free-text answers.
// POST { id, translations: { questionId: "English text" } }.
// Only free-text question ids; her own answers are never touched.
const P = require('../shared/profile-common');
const { requireAdmin, logAction, isUuid } = require('../shared/admin-auth');

var MAX_TRANSLATION = 4000;

exports.handler = async function (event) {
  var ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  var id = ctx.data.id;
  var incoming = ctx.data.translations;
  if (!isUuid(id) || !incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return P.json(400, { error: 'Invalid request.' });
  }
  try {
    var prof = await ctx.supabase.from('candidate_profiles').select('candidate_id, translations').eq('candidate_id', id).maybeSingle();
    if (prof.error) throw prof.error;
    if (!prof.data) return P.json(404, { error: 'She has not started her profile yet.' });
    var translations = Object.assign({}, prof.data.translations || {});
    var keys = Object.keys(incoming);
    for (var i = 0; i < keys.length; i++) {
      var q = P.QUESTION_BY_ID[keys[i]];
      if (!q || !P.isFreeText(q)) return P.json(400, { error: 'Only free-text answers can be translated.' });
      var text = typeof incoming[keys[i]] === 'string' ? incoming[keys[i]].trim() : '';
      if (text.length > MAX_TRANSLATION) return P.json(400, { error: 'Translation is too long.' });
      if (text) translations[keys[i]] = text; else delete translations[keys[i]];
    }
    var now = new Date().toISOString();
    var upd = await ctx.supabase
      .from('candidate_profiles')
      .update({ translations: translations, translated_by: ctx.email, translated_at: now })
      .eq('candidate_id', id);
    if (upd.error) throw upd.error;
    logAction(ctx.email, 'translate', id);
    return P.json(200, { ok: true, translations: translations, translated_by: ctx.email, translated_at: now });
  } catch (err) {
    console.error('admin-translate failed:', err);
    return P.json(502, { error: 'Could not save the translation.' });
  }
};
