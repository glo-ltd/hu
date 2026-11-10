// Netlify scheduled function: runs once a day (see netlify.toml).
// Every step records when it acted, so running it twice changes nothing.
//   1. R14 gentle reminder 14 days after a request with no answer
//      (email if she has one; otherwise the team is asked to send it on Zalo)
//      (not while she waits for a certificate she asked him for)
//   2. expire requests at 30 days (counts as a no: R17 to him); the 30 days
//      are paused while she waits for a certificate she asked him for

//   3. release each woman's next queued request (safety net)
//   4. remind the team about "thinking it over" clients after 7 days
//   5. R18 "We're here if you need us", once, 3 months after his first introduction
//   6. flag engagements reaching 12 months on the team page
//   7. delete client documents (certificates women asked for, and his
//      photos) 6 months after an engagement closes
const P = require('../shared/profile-common');
const CC = require('../shared/client-common');
const I = require('../shared/introductions');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');
const { notifyHimNotThisTime } = require('../shared/intro-notify');

const DAY = 86400000;

async function run(sb, now) {
  now = now || Date.now();
  const iso = (t) => new Date(t).toISOString();
  const out = { reminders: 0, remindersByZalo: 0, expired: 0, released: 0, thinking: 0, checkins: 0, flagged: 0, documentsDeleted: 0, errors: 0 };
  const safe = async (label, fn) => { try { await fn(); } catch (e) { out.errors++; console.error('daily-tasks ' + label + ' failed:', e); } };

  // 1. Gentle reminder at 14 days
  await safe('reminders', async () => {
    const r = await sb.from('introductions').select('*').in('status', I.OPEN).is('reminder_sent_at', null).is('expiry_paused_at', null).lte('sent_at', iso(now - CC.C.DECISION_REMINDER_DAYS * DAY));
    if (r.error) throw r.error;
    for (const intro of r.data || []) {
      // Mark first, so a second run (or a crash after sending) never repeats it.
      const m = await sb.from('introductions').update({ reminder_sent_at: iso(now) }).eq('id', intro.id).is('reminder_sent_at', null).select('id');
      if (m.error) throw m.error;
      if (!(m.data || []).length) continue;
      const cand = (await sb.from('candidates').select('full_name, email, preferred_language, status').eq('id', intro.candidate_id).single()).data;
      const prof = (await sb.from('candidate_profiles').select('display_name').eq('candidate_id', intro.candidate_id).maybeSingle()).data || {};
      const lang = cand.preferred_language === 'en' ? 'en' : 'vi';
      const d = { lang, name: prof.display_name || P.givenName(cand.full_name), expiresOn: new Date(intro.decision_token_expires_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', { day: 'numeric', month: lang === 'en' ? 'long' : 'numeric', year: 'numeric' }) };
      if (cand.email) {
        // Her link is only stored hashed, so the email can't repeat it; it
        // points her to the Zalo/email message she already has.
        await sendEmail(cand.email, E.R14.build(d));
        out.reminders++;
      } else {
        await sendTeam(E.team.reminderDue.build({ clientId: intro.client_id, introId: intro.id }));
        out.remindersByZalo++;
      }
      await CC.logEvent(sb, intro.client_id, 'intro_reminder', 'system', I.introRef(intro.id));
    }
  });

  // 2. Expire at 30 days (counts as a no)
  await safe('expiry', async () => {
    const r = await sb.from('introductions').select('*').in('status', I.OPEN).is('expiry_paused_at', null).lt('decision_token_expires_at', iso(now));
    if (r.error) throw r.error;
    for (const intro of r.data || []) {
      const u = await sb.from('introductions').update({ status: 'expired', status_changed_at: iso(now), expired_at: iso(now), decision_token_hash: null }).eq('id', intro.id).in('status', I.OPEN).select('id');
      if (u.error) throw u.error;
      if (!(u.data || []).length) continue;
      out.expired++;
      await I.releaseQueue(sb, intro.candidate_id);
      await notifyHimNotThisTime(sb, intro);
      await CC.logEvent(sb, intro.client_id, 'intro_expired', 'system', I.introRef(intro.id));
      await sendTeam(E.team.introExpired.build({ clientId: intro.client_id, introId: intro.id }));
    }
  });

  // 3. Release queued requests whose woman has nothing open
  await safe('queue', async () => {
    const r = await sb.from('introductions').select('candidate_id').eq('status', 'queued');
    if (r.error) throw r.error;
    for (const cid of Array.from(new Set((r.data || []).map((x) => x.candidate_id)))) {
      if (await I.releaseQueue(sb, cid)) out.released++;
    }
  });

  // 4. "Thinking it over" for 7 days: remind the team (once)
  await safe('thinking', async () => {
    const r = await sb.from('clients').select('id').eq('status', 'thinking').is('thinking_reminder_sent_at', null).lte('thinking_since', iso(now - CC.C.THINKING_REMINDER_DAYS * DAY));
    if (r.error) throw r.error;
    for (const c of r.data || []) {
      const u = await sb.from('clients').update({ thinking_reminder_sent_at: iso(now) }).eq('id', c.id).is('thinking_reminder_sent_at', null).select('id');
      if (u.error) throw u.error;
      if (!(u.data || []).length) continue;
      await sendTeam(E.team.thinkingReminder.build({ clientId: c.id }));
      out.thinking++;
    }
  });

  // 5. R18, once, 3 months after his first introduction
  await safe('checkin', async () => {
    const r = await sb.from('introductions').select('client_id, introduced_at').eq('status', 'introduced');
    if (r.error) throw r.error;
    const first = {};
    (r.data || []).forEach((x) => { if (x.introduced_at && (!first[x.client_id] || x.introduced_at < first[x.client_id])) first[x.client_id] = x.introduced_at; });
    const cutoff = CC.addMonths(new Date(now), -CC.C.CHECK_IN_MONTHS).getTime();
    for (const id of Object.keys(first)) {
      if (Date.parse(first[id]) > cutoff) continue;
      const u = await sb.from('clients').update({ checkin_sent_at: iso(now) }).eq('id', id).eq('status', 'active').is('checkin_sent_at', null).select('id, full_name, email, application');
      if (u.error) throw u.error;
      const c = (u.data || [])[0];
      if (!c) continue;
      await sendEmail((c.application && c.application.email) || c.email, E.R18.build({ firstName: CC.firstName(c.full_name) }));
      await CC.logEvent(sb, id, 'checkin_sent', 'system');
      out.checkins++;
    }
  });

  // 6. Engagements reaching 12 months: flag on the team page (once)
  await safe('twelve-months', async () => {
    const r = await sb.from('clients').select('id').in('status', ['active', 'paused']).is('engagement_flagged_at', null).lte('engagement_ends_at', iso(now));
    if (r.error) throw r.error;
    for (const c of r.data || []) {
      const u = await sb.from('clients').update({ engagement_flagged_at: iso(now) }).eq('id', c.id).is('engagement_flagged_at', null).select('id');
      if (u.error) throw u.error;
      if (!(u.data || []).length) continue;
      await sendTeam(E.team.engagementYear.build({ clientId: c.id }));
      await CC.logEvent(sb, c.id, 'engagement_12_months', 'system');
      out.flagged++;
    }
  });

  // 7. Delete his documents (and photos) 6 months after closing
  await safe('documents', async () => {
    const r = await sb.from('clients').select('id').eq('status', 'closed').is('documents_deleted_at', null).lte('documents_delete_after', iso(now));
    if (r.error) throw r.error;
    for (const c of r.data || []) {
      await CC.deleteClientFolder(sb, c.id);
      const u = await sb.from('clients').update({ documents_deleted_at: iso(now) }).eq('id', c.id);
      if (u.error) throw u.error;
      const ui = await sb.from('introductions').update({ cert_path: null }).eq('client_id', c.id).not('cert_path', 'is', null);
      if (ui.error) throw ui.error;
      await sb.from('client_profiles').update({ photo_paths: [] }).eq('client_id', c.id);
      await CC.logEvent(sb, c.id, 'documents_deleted', 'system');
      out.documentsDeleted++;
    }
  });

  return out;
}

exports.handler = async function () {
  const sb = P.serviceClient();
  if (!sb) { console.error('daily-tasks: Supabase is not configured.'); return { statusCode: 500 }; }
  const out = await run(sb);
  console.log(JSON.stringify({ daily_tasks: out, at: new Date().toISOString() }));
  return { statusCode: 200, body: JSON.stringify(out) };
};

exports.run = run;
