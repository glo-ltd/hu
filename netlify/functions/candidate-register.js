const crypto = require('crypto');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const FROM_EMAIL = 'Heritage Union <team@heritage-union.com>';
const INTERNAL_NOTIFY_EMAIL = 'james@heritage-union.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZALO_PHONE_PATTERN = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
const CONSENT_TEXT_VERSION = 'vi-2026-10-v1';
const MAX_NAME_LENGTH = 100;
const MAX_CONTACT_LENGTH = 100;
const MAX_ABOUT_LENGTH = 1500;
const RATE_LIMIT_PER_HOUR = 5;

const VALID_SOURCES = ['facebook_group', 'friend', 'search', 'other'];
const VALID_LANGUAGES = ['vi', 'en'];

function jsonResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clientIpHash(event) {
  var ip =
    (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) ||
    ((event.headers && event.headers['x-forwarded-for']) || '').split(',')[0].trim() ||
    'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function isAdultBirthDate(dateString) {
  // dateString expected as YYYY-MM-DD from a <input type="date">
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  var dob = new Date(dateString + 'T00:00:00Z');
  if (isNaN(dob.getTime())) return false;
  var now = new Date();
  var cutoff = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()));
  return dob.getTime() <= cutoff.getTime() && dob.getFullYear() > 1900;
}

async function verifyTurnstile(token, remoteIp) {
  if (!process.env.TURNSTILE_SECRET) {
    console.error('TURNSTILE_SECRET is not configured.');
    return false;
  }
  if (!token) return false;
  try {
    var params = new URLSearchParams();
    params.append('secret', process.env.TURNSTILE_SECRET);
    params.append('response', token);
    if (remoteIp && remoteIp !== 'unknown') params.append('remoteip', remoteIp);

    var res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    var json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('Turnstile verification threw:', err);
    return false;
  }
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  var signupsOpen = process.env.CANDIDATE_SIGNUPS_OPEN === 'true';

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return jsonResponse(400, { error: 'Invalid request.' });
  }

  var website = data.website;
  if (website) {
    // Honeypot tripped — pretend success so bots don't learn anything.
    return jsonResponse(200, { ok: true });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase is not configured.');
    return jsonResponse(500, { error: 'This form is not yet configured. Please try again later.' });
  }

  var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  var ipHash = clientIpHash(event);

  if (!signupsOpen) {
    return handleWaitlist(supabase, data, ipHash);
  }
  return handleRegistration(supabase, data, ipHash, event);
};

async function isRateLimited(supabase, table, ipHash) {
  var oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  var result = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', oneHourAgo);
  return result.count !== null && result.count >= RATE_LIMIT_PER_HOUR;
}

async function handleWaitlist(supabase, data, ipHash) {
  var name = typeof data.name === 'string' ? data.name.trim().slice(0, MAX_NAME_LENGTH) : '';
  var contact = typeof data.contact === 'string' ? data.contact.trim().slice(0, MAX_CONTACT_LENGTH) : '';
  var consentNotify = !!data.consentNotify;

  if (!name || !contact) {
    return jsonResponse(400, { error: 'Please complete all fields.' });
  }
  if (!consentNotify) {
    return jsonResponse(400, { error: 'Please confirm you agree to be contacted.' });
  }

  if (await isRateLimited(supabase, 'candidate_waitlist', ipHash)) {
    return jsonResponse(429, { error: 'Too many submissions. Please try again later.' });
  }

  var insertResult = await supabase.from('candidate_waitlist').insert({
    name: name,
    contact: contact,
    consent_notify_at: new Date().toISOString(),
    ip_hash: ipHash,
  });

  if (insertResult.error) {
    console.error('Supabase waitlist insert failed:', insertResult.error);
    return jsonResponse(502, { error: 'We could not save your details right now. Please try again shortly.' });
  }

  return jsonResponse(200, { ok: true, mode: 'waitlist' });
}

async function handleRegistration(supabase, data, ipHash, event) {
  var fullName = typeof data.fullName === 'string' ? data.fullName.trim().slice(0, MAX_NAME_LENGTH) : '';
  var dateOfBirth = typeof data.dateOfBirth === 'string' ? data.dateOfBirth.trim() : '';
  var ageDeclared = !!data.ageDeclared;
  var province = typeof data.province === 'string' ? data.province.trim().slice(0, MAX_NAME_LENGTH) : '';
  var zaloNumber = typeof data.zaloNumber === 'string' ? data.zaloNumber.trim().slice(0, 20) : '';
  var email = typeof data.email === 'string' ? data.email.trim().slice(0, MAX_CONTACT_LENGTH) : '';
  var preferredLanguage = typeof data.preferredLanguage === 'string' ? data.preferredLanguage.trim() : '';
  var aboutText = typeof data.aboutText === 'string' ? data.aboutText.trim().slice(0, MAX_ABOUT_LENGTH) : '';
  var source = typeof data.source === 'string' ? data.source.trim() : '';
  var consentContact = !!data.consentContact;
  var consentProcessing = !!data.consentProcessing;
  var turnstileToken = typeof data.turnstileToken === 'string' ? data.turnstileToken : '';

  if (!fullName || !dateOfBirth || !province || !zaloNumber || !preferredLanguage || !aboutText) {
    return jsonResponse(400, { error: 'Please complete all required fields.' });
  }
  if (VALID_LANGUAGES.indexOf(preferredLanguage) === -1) {
    return jsonResponse(400, { error: 'Please select a valid language.' });
  }
  if (source && VALID_SOURCES.indexOf(source) === -1) {
    source = 'other';
  }
  if (!ZALO_PHONE_PATTERN.test(zaloNumber.replace(/[\s-]/g, ''))) {
    return jsonResponse(400, { error: 'Please provide a valid Vietnamese phone number.' });
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return jsonResponse(400, { error: 'Please provide a valid email address.' });
  }
  if (!ageDeclared) {
    return jsonResponse(400, { error: 'You must confirm you are 18 or over.' });
  }
  // Server-side age check — never trust the client-side one alone.
  if (!isAdultBirthDate(dateOfBirth)) {
    return jsonResponse(400, { error: 'You must be 18 or over to register.' });
  }
  if (!consentContact || !consentProcessing) {
    return jsonResponse(400, { error: 'Please agree to both consent statements to continue.' });
  }

  var remoteIp =
    (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || '';
  var turnstileOk = await verifyTurnstile(turnstileToken, remoteIp);
  if (!turnstileOk) {
    return jsonResponse(400, { error: 'We could not verify you are human. Please try again.' });
  }

  if (await isRateLimited(supabase, 'candidates', ipHash)) {
    return jsonResponse(429, { error: 'Too many submissions. Please try again later.' });
  }

  var now = new Date().toISOString();
  var needsZaloFollowup = !email;

  var insertResult = await supabase
    .from('candidates')
    .insert({
      full_name: fullName,
      date_of_birth: dateOfBirth,
      province: province,
      zalo_number: zaloNumber,
      email: email || null,
      preferred_language: preferredLanguage,
      about_text: aboutText,
      source: source || null,
      consent_contact_at: now,
      consent_processing_at: now,
      consent_text_version: CONSENT_TEXT_VERSION,
      ip_hash: ipHash,
      status: 'new',
      needs_zalo_followup: needsZaloFollowup,
    })
    .select('id')
    .single();

  if (insertResult.error) {
    console.error('Supabase candidate insert failed:', insertResult.error);
    return jsonResponse(502, { error: 'We could not save your registration right now. Please try again shortly.' });
  }

  var candidateId = insertResult.data.id;

  if (process.env.RESEND_API_KEY) {
    var resend = new Resend(process.env.RESEND_API_KEY);

    if (email) {
      try {
        var autoReply = buildAutoReply(preferredLanguage, fullName);
        var visitorResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: autoReply.subject,
          html: autoReply.html,
        });
        if (visitorResult.error) {
          console.error('Resend send to candidate failed:', visitorResult.error);
        }
      } catch (err) {
        console.error('Resend send to candidate threw:', err);
      }
    }

    try {
      // Deliberately no personal data in this email — just enough to find
      // the record in Supabase. See README / brief: no candidate PII in
      // notification emails.
      var internalResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: INTERNAL_NOTIFY_EMAIL,
        subject: 'New candidate registration',
        html: '<p>New candidate registration (#' + escapeHtml(candidateId) + ') — view in Supabase.</p>',
      });
      if (internalResult.error) {
        console.error('Resend send to james@ failed:', internalResult.error);
      }
    } catch (err) {
      console.error('Resend internal notification threw:', err);
    }
  } else {
    console.error('RESEND_API_KEY is not configured — skipping confirmation/notification emails.');
  }

  return jsonResponse(200, { ok: true, mode: 'registered' });
}

function buildAutoReply(language, fullName) {
  if (language === 'vi') {
    return {
      subject: 'Heritage Union — Đã nhận được đăng ký của bạn',
      html:
        '<p>Chào ' + escapeHtml(fullName) + ',</p>' +
        '<p>Cảm ơn bạn đã đăng ký với Heritage Union. Chúng tôi đã nhận được thông tin của bạn.</p>' +
        '<p>Bước tiếp theo: chúng tôi sẽ gửi một tin nhắn ngắn để bạn xác nhận thông tin liên hệ và hoàn thiện hồ sơ của mình. Việc đăng ký là hoàn toàn miễn phí và tự nguyện — bạn có thể rút lại bất cứ lúc nào.</p>' +
        '<p>Nếu bạn muốn rút đăng ký, vui lòng truy cập <a href="https://heritage-union.com/vi/withdraw">heritage-union.com/vi/withdraw</a>.</p>' +
        '<p>Trân trọng,<br>Đội ngũ Heritage Union</p>',
    };
  }
  return {
    subject: 'Heritage Union — We have received your registration',
    html:
      '<p>Dear ' + escapeHtml(fullName) + ',</p>' +
      '<p>Thank you for registering with Heritage Union. We have received your details.</p>' +
      '<p>What happens next: we will send a short follow-up so you can verify your contact information and complete your own profile. Registration is entirely free and voluntary — you can withdraw at any time.</p>' +
      '<p>If you would like to withdraw your registration, please visit <a href="https://heritage-union.com/withdraw">heritage-union.com/withdraw</a>.</p>' +
      '<p>Warm regards,<br>The Heritage Union Team</p>',
  };
}
