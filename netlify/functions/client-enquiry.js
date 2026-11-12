// F1 Enquiry form on /contact. Always open (not gated by CLIENT_SIGNUPS_OPEN).
// Men are saved as clients (status "enquiry"); press and others go to
// general_enquiries; women are pointed to registration and nothing is saved.
const P = require('../shared/profile-common');
const U = require('../shared/request-utils');
const C = require('../shared/client-config');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');
const { logEvent, firstName } = require('../shared/client-common');

const RATE_LIMIT_PER_HOUR = 20;
const SOURCES = ['search', 'social', 'friend', 'press', 'facebook_group', 'other'];
const I_AM = ['client', 'woman', 'other'];

function escapeLike(s) { return String(s).replace(/[\\%_]/g, (c) => '\\' + c); }

async function countRecent(supabase, table, ipHash) {
  const since = new Date(Date.now() - 3600000).toISOString();
  const r = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
  return r.count || 0;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return U.json(405, { error: 'Method not allowed.' });
  const data = U.parseBody(event);
  if (!data) return U.json(400, { error: 'Invalid request. Please reload the page and try again.' });
  if (data.website) return U.json(200, { ok: true }); // honeypot

  const iAm = I_AM.indexOf(data.iAm) !== -1 ? data.iAm : '';
  if (!iAm) return U.json(400, { error: 'Please tell us who you are.', field: 'iAm' });
  if (iAm === 'woman') return U.json(200, { ok: true, mode: 'woman' }); // nothing saved

  const fullName = U.cleanText(data.fullName, 120);
  const email = U.cleanText(data.email, 200).toLowerCase();
  const country = U.cleanText(data.country, 80);
  const phone = U.cleanText(data.phone, 40);
  const message = U.cleanText(data.message, 3000);
  const source = SOURCES.indexOf(data.source) !== -1 ? data.source : null;
  const age = typeof data.age === 'number' ? data.age : /^\d+$/.test(String(data.age || '').trim()) ? Number(data.age) : null;

  if (!fullName) return U.json(400, { error: 'Please enter your full name.', field: 'fullName' });
  if (!U.EMAIL_PATTERN.test(email)) return U.json(400, { error: 'Please check your email address.', field: 'email' });
  if (!country) return U.json(400, { error: 'Please enter your country of residence.', field: 'country' });
  if (iAm === 'client') {
    if (!Number.isInteger(age) || age < 18 || age > 99) return U.json(400, { error: 'Please enter your age (you must be 18 or over).', field: 'age' });
  }
  if (!message) return U.json(400, { error: 'Please write a short message.', field: 'message' });
  if (data.consent !== true) return U.json(400, { error: 'Please confirm you agree to be contacted and to our Privacy Policy.', field: 'consent' });

  // Turnstile protects the form whenever both keys are set. Without them
  // the form still works (it must always work), protected by the honeypot
  // and the per-connection limit below.
  if (U.turnstileConfigured() && !(await U.verifyTurnstile(data.turnstileToken, event))) {
    return U.json(400, { error: 'We could not complete the verification. Please try again.', field: 'turnstile' });
  }

  const supabase = P.serviceClient();
  if (!supabase) return U.json(500, { error: 'This form is not available right now. Please email team@heritage-union.com.' });
  const ipHash = U.ipHash(event);
  if ((await countRecent(supabase, 'clients', ipHash)) + (await countRecent(supabase, 'general_enquiries', ipHash)) >= RATE_LIMIT_PER_HOUR) {
    return U.json(429, { error: 'There have been a lot of messages from your connection in the last hour. Please try again later, or email team@heritage-union.com.' });
  }
  const now = new Date().toISOString();

  try {
    if (iAm === 'other') {
      const ins = await supabase.from('general_enquiries').insert({ full_name: fullName, email, country, message, consent_contact_at: now, ip_hash: ipHash }).select('id').single();
      if (ins.error) throw ins.error;
      await sendTeam({
        subject: 'New press or general enquiry (G-' + ins.data.id.slice(0, 8).toUpperCase() + ')',
        html: '<p>A new press or general enquiry has arrived. Reference G-' + ins.data.id.slice(0, 8).toUpperCase() + '.</p><p><a href="https://heritage-union.com/admin/#clients">Open the team page</a></p>',
        text: 'A new press or general enquiry has arrived. Reference G-' + ins.data.id.slice(0, 8).toUpperCase() + '.\nhttps://heritage-union.com/admin/#clients\n',
      });
      return U.json(200, { ok: true, mode: 'other' });
    }

    // One client record per email address (case-insensitive).
    const found = await supabase.from('clients').select('id, status').ilike('email', escapeLike(email)).maybeSingle();
    if (found.error) throw found.error;
    let id;
    if (found.data) {
      id = found.data.id;
      const upd = await supabase.from('clients').update({ enquiry_message: message, phone: phone || undefined, consent_contact_at: now, consent_text_version: C.ENQUIRY_CONSENT_VERSION }).eq('id', id);
      if (upd.error) throw upd.error;
      await logEvent(supabase, id, 'enquiry_again', 'client');
    } else {
      const ins = await supabase.from('clients').insert({
        full_name: fullName, email, country, age, phone: phone || null, source, enquiry_message: message,
        consent_contact_at: now, consent_text_version: C.ENQUIRY_CONSENT_VERSION, ip_hash: ipHash, status: 'enquiry', status_changed_at: now,
      }).select('id').single();
      if (ins.error) throw ins.error;
      id = ins.data.id;
      await logEvent(supabase, id, 'enquiry', 'client');
    }
    await sendEmail(email, E.R1.build({ firstName: firstName(fullName) }));
    await sendTeam(E.team.newEnquiry.build({ clientId: id }));
    return U.json(200, { ok: true, mode: 'client' });
  } catch (e) {
    console.error('client-enquiry failed:', e);
    return U.json(502, { error: 'We could not send your message just now. Please try again shortly, or email team@heritage-union.com.' });
  }
};
