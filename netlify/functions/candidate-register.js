const crypto = require('crypto');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { normaliseZalo, isValidZalo, signupsOpen, pickLang, msg, teamNotifyEmails } = require('../shared/candidate-common');
const { newProfileToken, profileLink } = require('../shared/profile-common');

const FROM_EMAIL = 'Heritage Union <team@heritage-union.com>';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_TEXT_VERSION = 'vi-2026-10-v2';
const MAX_NAME_LENGTH = 100;
const MAX_CONTACT_LENGTH = 100;
const MAX_ABOUT_LENGTH = 1500;
// Generous on purpose: Vietnamese mobile networks put many phones behind one
// shared IP address, so a low limit would turn away genuine women after a
// group post. Turnstile is the main bot defence; this only stops floods.
const RATE_LIMIT_PER_HOUR = 30;

const VALID_SOURCES = ['facebook_group', 'friend', 'search', 'other'];
const VALID_LANGUAGES = ['vi', 'en'];
// The 34 provincial-level units in force since 1 July 2025 (Resolution
// 202/2025/QH15), in Vietnamese alphabetical order. Must match the
// province <option> values on /become-a-candidate and /vi/become-a-candidate.
const VALID_PROVINCES = [
  'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Cần Thơ', 'Đà Nẵng', 'Đắk Lắk',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Nội', 'Hà Tĩnh', 'Hải Phòng',
  'TP. Hồ Chí Minh', 'Huế', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lạng Sơn', 'Lào Cai',
  'Lâm Đồng', 'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sơn La', 'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa', 'Tuyên Quang', 'Vĩnh Long',
  'Khác', 'Other',
];

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
    return jsonResponse(405, { error: msg('method', 'en') });
  }

  var open = signupsOpen();

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return jsonResponse(400, { error: msg('invalid', 'en') });
  }
  var lang = pickLang(data);

  var website = data.website;
  if (website) {
    // Honeypot tripped — pretend success so bots don't learn anything.
    return jsonResponse(200, { ok: true });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase is not configured.');
    return jsonResponse(500, { error: msg('notConfigured', lang) });
  }

  var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  var ipHash = clientIpHash(event);

  if (!open) {
    return handleWaitlist(supabase, data, ipHash, lang);
  }
  return handleRegistration(supabase, data, ipHash, event, lang);
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

async function handleWaitlist(supabase, data, ipHash, lang) {
  var name = typeof data.name === 'string' ? data.name.trim().slice(0, MAX_NAME_LENGTH) : '';
  var contact = typeof data.contact === 'string' ? data.contact.trim().slice(0, MAX_CONTACT_LENGTH) : '';
  var consentNotify = !!data.consentNotify;

  if (!name || !contact) {
    return jsonResponse(400, { error: msg('waitlistRequired', lang) });
  }
  if (!consentNotify) {
    return jsonResponse(400, { error: msg('waitlistConsent', lang) });
  }

  if (await isRateLimited(supabase, 'candidate_waitlist', ipHash)) {
    return jsonResponse(429, { error: msg('rateLimited', lang) });
  }

  var insertResult = await supabase.from('candidate_waitlist').insert({
    name: name,
    contact: contact,
    consent_notify_at: new Date().toISOString(),
    ip_hash: ipHash,
  });

  if (insertResult.error) {
    console.error('Supabase waitlist insert failed:', insertResult.error);
    return jsonResponse(502, { error: msg('saveFailed', lang) });
  }

  return jsonResponse(200, { ok: true, mode: 'waitlist' });
}

async function handleRegistration(supabase, data, ipHash, event, lang) {
  var fullName = typeof data.fullName === 'string' ? data.fullName.trim().slice(0, MAX_NAME_LENGTH) : '';
  var dateOfBirth = typeof data.dateOfBirth === 'string' ? data.dateOfBirth.trim() : '';
  var ageDeclared = !!data.ageDeclared;
  var province = typeof data.province === 'string' ? data.province.normalize('NFC').trim().slice(0, MAX_NAME_LENGTH) : '';
  var zaloNumber = typeof data.zaloNumber === 'string' ? normaliseZalo(data.zaloNumber.trim().slice(0, 30)) : '';
  var email = typeof data.email === 'string' ? data.email.trim().toLowerCase().slice(0, MAX_CONTACT_LENGTH) : '';
  var preferredLanguage = typeof data.preferredLanguage === 'string' ? data.preferredLanguage.trim() : '';
  var aboutText = typeof data.aboutText === 'string' ? data.aboutText.trim().slice(0, MAX_ABOUT_LENGTH) : '';
  var source = typeof data.source === 'string' ? data.source.trim() : '';
  var consentContact = !!data.consentContact;
  var consentProcessing = !!data.consentProcessing;
  // Optional and separate: only if she ticks it can her profile be shown to clients.
  var consentProfileSharing = data.consentProfileSharing === true;
  var turnstileToken = typeof data.turnstileToken === 'string' ? data.turnstileToken : '';

  if (!fullName || !dateOfBirth || !province || !zaloNumber || !preferredLanguage || !aboutText) {
    return jsonResponse(400, { error: msg('required', lang) });
  }
  if (VALID_LANGUAGES.indexOf(preferredLanguage) === -1) {
    return jsonResponse(400, { error: msg('language', lang) });
  }
  if (VALID_PROVINCES.indexOf(province) === -1) {
    return jsonResponse(400, { error: msg('province', lang) });
  }
  if (source && VALID_SOURCES.indexOf(source) === -1) {
    source = 'other';
  }
  if (!isValidZalo(zaloNumber)) {
    return jsonResponse(400, { error: msg('phone', lang) });
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return jsonResponse(400, { error: msg('email', lang) });
  }
  if (!ageDeclared) {
    return jsonResponse(400, { error: msg('ageConfirm', lang) });
  }
  // Server-side age check — never trust the client-side one alone.
  if (!isAdultBirthDate(dateOfBirth)) {
    return jsonResponse(400, { error: msg('age', lang) });
  }
  if (!consentContact || !consentProcessing) {
    return jsonResponse(400, { error: msg('consents', lang) });
  }

  var remoteIp =
    (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || '';
  var turnstileOk = await verifyTurnstile(turnstileToken, remoteIp);
  if (!turnstileOk) {
    return jsonResponse(400, { error: msg('human', lang) });
  }

  if (await isRateLimited(supabase, 'candidates', ipHash)) {
    return jsonResponse(429, { error: msg('rateLimited', lang) });
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
      consent_profile_sharing_at: consentProfileSharing ? now : null,
      consent_text_version: CONSENT_TEXT_VERSION,
      ip_hash: ipHash,
      status: 'new',
      needs_zalo_followup: needsZaloFollowup,
    })
    .select('id')
    .single();

  if (insertResult.error) {
    console.error('Supabase candidate insert failed:', insertResult.error);
    return jsonResponse(502, { error: msg('saveFailed', lang) });
  }

  var candidateId = insertResult.data.id;

  // Her private profile link: /my-profile#t=... if she chose English as her
  // language, otherwise /vi/ho-so#t=... Only the sha256 is stored.
  // Saved in a separate update so that, if this ever fails, the registration
  // itself is still kept and she simply gets her link later on Zalo.
  var profileToken = null;
  var t = newProfileToken();
  var tokenResult = await supabase
    .from('candidates')
    .update({ profile_token_hash: t.hash, profile_token_expires_at: t.expiresAt })
    .eq('id', candidateId);
  if (tokenResult.error) {
    console.error('Saving profile token failed:', tokenResult.error);
  } else {
    profileToken = t.token;
  }

  if (process.env.RESEND_API_KEY) {
    var resend = new Resend(process.env.RESEND_API_KEY);

    if (email) {
      try {
        var autoReply = buildAutoReply(preferredLanguage, fullName, profileToken ? profileLink(profileToken, preferredLanguage) : null);
        var visitorResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: autoReply.subject,
          html: autoReply.html,
        });
        if (visitorResult.error) {
          console.error('Resend send to candidate failed:', visitorResult.error);
        } else if (profileToken) {
          var sentResult = await supabase
            .from('candidates')
            .update({ profile_link_sent_at: new Date().toISOString() })
            .eq('id', candidateId);
          if (sentResult.error) console.error('Saving profile_link_sent_at failed:', sentResult.error);
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
        to: teamNotifyEmails(),
        subject: 'New candidate registration',
        html: '<p>New candidate registration (#' + escapeHtml(candidateId) + ').</p>' +
          '<p><a href="https://heritage-union.com/admin/#' + escapeHtml(candidateId) + '">Open in the team tool</a></p>',
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

  // The token goes back only to the browser that just registered, which puts
  // it in the thank-you page's URL fragment (never sent to any server).
  return jsonResponse(200, { ok: true, mode: 'registered', profileToken: profileToken, profileLang: preferredLanguage === 'en' ? 'en' : 'vi' });
}

function buildAutoReply(language, fullName, link) {
  if (language === 'vi') {
    return {
      subject: 'Heritage Union — Chúng tôi đã nhận được đăng ký của bạn',
      html:
        '<p>Chào ' + escapeHtml(fullName) + ',</p>' +
        '<p>Cảm ơn bạn đã đăng ký với Heritage Union. Chúng tôi đã nhận được thông tin của bạn.</p>' +
        (link
          ? '<p>Bước tiếp theo: bạn có thể tự hoàn thiện hồ sơ của mình (khoảng 10 phút) bằng đường link riêng này:<br>' +
            '<a href="' + escapeHtml(link) + '">Hoàn thiện hồ sơ của tôi</a></p>' +
            '<p>Đường link này chỉ dành riêng cho bạn và dùng được trong 60 ngày. Bạn vui lòng không chia sẻ nó cho người khác. Chúng tôi cũng sẽ nhắn cho bạn qua Zalo để xác nhận thông tin liên lạc.</p>'
          : '<p>Bước tiếp theo: chúng tôi sẽ gửi thêm một tin nhắn ngắn để bạn xác nhận thông tin liên lạc và tự hoàn thiện hồ sơ của mình.</p>') +
        '<p>Đăng ký hoàn toàn miễn phí và tự nguyện — bạn có thể rút lại bất cứ lúc nào.</p>' +
        '<p>Nếu muốn rút đăng ký, bạn chỉ cần vào trang <a href="https://heritage-union.com/vi/withdraw">heritage-union.com/vi/withdraw</a>.</p>' +
        '<p>Trân trọng,<br>Đội ngũ Heritage Union</p>',
    };
  }
  return {
    subject: 'Heritage Union — We have received your registration',
    html:
      '<p>Dear ' + escapeHtml(fullName) + ',</p>' +
      '<p>Thank you for registering with Heritage Union. We have received your details.</p>' +
      (link
        ? '<p>What happens next: you can complete your own profile (about 10 minutes) with this private link:<br>' +
          '<a href="' + escapeHtml(link) + '">Complete my profile</a></p>' +
          '<p>This link is private to you and works for 60 days. Please do not share it with anyone. We will also message you on Zalo to confirm your contact details.</p>'
        : '<p>What happens next: we will send a short follow-up so you can verify your contact information and complete your own profile.</p>') +
      '<p>Registration is entirely free and voluntary — you can withdraw at any time.</p>' +
      '<p>If you would like to withdraw your registration, please visit <a href="https://heritage-union.com/withdraw">heritage-union.com/withdraw</a>.</p>' +
      '<p>Warm regards,<br>The Heritage Union Team</p>',
  };
}
