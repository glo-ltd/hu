// All candidates for the team list, newest first. Filtering and search
// happen in the page (the list is small). POST {}.
const P = require('../shared/profile-common');
const { requireAdmin, logAction } = require('../shared/admin-auth');

exports.handler = async function (event) {
  var ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  try {
    var c = await ctx.supabase
      .from('candidates')
      .select('id, full_name, province, zalo_number, status, created_at, updated_at, zalo_confirmed_at, profile_link_sent_at, consent_profile_sharing_at')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (c.error) throw c.error;
    var rows = c.data || [];
    var ids = rows.map(function (r) { return r.id; });
    var profiles = {};
    if (ids.length) {
      var p = await ctx.supabase
        .from('candidate_profiles')
        .select('candidate_id, display_name, answers, photo_paths, consent_photo_sharing_at, submitted_at')
        .in('candidate_id', ids);
      if (p.error) throw p.error;
      (p.data || []).forEach(function (r) { profiles[r.candidate_id] = r; });
    }
    var list = rows.map(function (r) {
      var prof = profiles[r.id];
      return {
        id: r.id,
        name: (prof && prof.display_name) || P.givenName(r.full_name),
        fullName: r.full_name,
        province: r.province,
        zalo: r.zalo_number,
        status: r.status,
        createdAt: r.created_at,
        // No withdrawn_at column in production: updated_at is the withdrawal
        // time, because nothing else updates a withdrawn row.
        withdrawnAt: r.status === 'withdrawn' ? r.updated_at : null,
        zaloConfirmedAt: r.zalo_confirmed_at,
        linkSentAt: r.profile_link_sent_at,
        sharingConsent: !!r.consent_profile_sharing_at,
        photoConsent: !!(prof && prof.consent_photo_sharing_at),
        photoCount: prof && prof.photo_paths ? prof.photo_paths.length : 0,
        stepsComplete: prof ? P.stepsComplete(prof) : 0,
        submittedAt: prof ? prof.submitted_at : null,
      };
    });
    logAction(ctx.email, 'list');
    return P.json(200, { ok: true, candidates: list, me: ctx.email });
  } catch (err) {
    console.error('admin-list failed:', err);
    return P.json(502, { error: 'Could not load candidates.' });
  }
};
