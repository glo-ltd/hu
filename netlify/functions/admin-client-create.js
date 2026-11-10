// Team page "Add client": for a man who got in touch another way (email,
// WhatsApp, phone, in person, referral) rather than through the enquiry form.
// Creates the same client record the enquiry form would (status "enquiry"),
// sends nothing to him, and logs who added him. If a client with the same
// email already exists, returns that record instead of creating a second.
// POST { fullName, email, country, age?, phone?, channel, message? }
// message = what he asked about (his enquiry, as the enquiry form saves it).
const P = require('../shared/profile-common');
const U = require('../shared/request-utils');
const CC = require('../shared/client-common');
const { requireAdmin, logAction } = require('../shared/admin-auth');

const CHANNELS = ['email', 'whatsapp', 'phone', 'in_person', 'referral', 'other'];
const CHANNEL_LABEL = { email: 'email', whatsapp: 'WhatsApp', phone: 'phone', in_person: 'in person', referral: 'a referral', other: 'another way' };

function escapeLike(s) { return String(s).replace(/[\\%_]/g, (c) => '\\' + c); }

exports.handler = async function (event) {
  const ctx = await requireAdmin(event);
  if (ctx.response) return ctx.response;
  const d = ctx.data || {};

  const fullName = U.cleanText(d.fullName, 120);
  const email = U.cleanText(d.email, 200).toLowerCase();
  const country = U.cleanText(d.country, 80);
  const phone = U.cleanText(d.phone, 40);
  const asked = U.cleanText(d.message, 1000);
  const channel = CHANNELS.indexOf(d.channel) !== -1 ? d.channel : '';
  const ageRaw = String(d.age === undefined || d.age === null ? '' : d.age).trim();
  const age = ageRaw === '' ? null : /^\d+$/.test(ageRaw) ? Number(ageRaw) : NaN;

  if (!fullName) return P.json(400, { error: 'Enter his full name.' });
  if (!U.EMAIL_PATTERN.test(email)) return P.json(400, { error: 'Check the email address.' });
  if (!country) return P.json(400, { error: 'Enter his country of residence.' });
  if (!channel) return P.json(400, { error: 'Choose how he got in touch.' });
  if (age !== null && (!Number.isInteger(age) || age < 18 || age > 99)) return P.json(400, { error: 'Age must be a number from 18 to 99, or left blank.' });

  try {
    const found = await ctx.supabase.from('clients').select('id').ilike('email', escapeLike(email)).maybeSingle();
    if (found.error) throw found.error;
    if (found.data) return P.json(200, { ok: true, id: found.data.id, existing: true });

    const now = new Date().toISOString();
    const message = 'Added by the team. Got in touch by ' + CHANNEL_LABEL[channel] + '.' + (asked ? ' ' + asked : '');
    const ins = await ctx.supabase.from('clients').insert({
      full_name: fullName, email, country, age, phone: phone || null,
      source: 'direct_' + channel, enquiry_message: message.slice(0, 3000),
      status: 'enquiry', status_changed_at: now,
    }).select('id').single();
    if (ins.error) throw ins.error;
    await CC.logEvent(ctx.supabase, ins.data.id, 'added_by_team', ctx.email);
    logAction(ctx.email, 'client_add', ins.data.id);
    return P.json(200, { ok: true, id: ins.data.id, existing: false });
  } catch (e) {
    console.error('admin-client-create failed:', e);
    return P.json(502, { error: 'Could not add him just now.' });
  }
};
