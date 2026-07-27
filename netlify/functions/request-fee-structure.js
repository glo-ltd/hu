const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

const FROM_EMAIL = 'Heritage Union <team@heritage-union.com>';
const INTERNAL_NOTIFY_EMAIL = 'james@heritage-union.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;

function jsonResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured.');
    return jsonResponse(500, { error: 'This form is not yet configured. Please try again later.' });
  }

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

  var name = typeof data.name === 'string' ? data.name.trim().slice(0, MAX_FIELD_LENGTH) : '';
  var email = typeof data.email === 'string' ? data.email.trim().slice(0, MAX_FIELD_LENGTH) : '';
  var country = typeof data.country === 'string' ? data.country.trim().slice(0, MAX_FIELD_LENGTH) : '';

  if (!name || !email || !country) {
    return jsonResponse(400, { error: 'Please complete all fields.' });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse(400, { error: 'Please provide a valid email address.' });
  }

  var resend = new Resend(process.env.RESEND_API_KEY);
  var pdfPath = path.join(__dirname, 'assets', 'heritage-union-fee-structure.pdf');
  var pdfBuffer = fs.readFileSync(pdfPath);
  var submittedAt = new Date();

  try {
    var visitorResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Heritage Union — Service & Investment Structure',
      html:
        '<p>Dear ' + escapeHtml(name) + ',</p>' +
        '<p>Thank you for your interest in Heritage Union. As requested, please find attached our full Service &amp; Investment Structure document, setting out exactly how our engagement works and how fees are structured.</p>' +
        '<p>If you have any questions after reading it, or would like to schedule a free, no-obligation consultation, simply reply to this email or visit <a href="https://heritage-union.com/contact">heritage-union.com/contact</a>.</p>' +
        '<p>Warm regards,<br>The Heritage Union Team</p>',
      attachments: [
        {
          filename: 'Heritage-Union-Fee-Structure.pdf',
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    if (visitorResult.error) {
      console.error('Resend send to visitor failed:', visitorResult.error);
      return jsonResponse(502, { error: 'We could not send the document right now. Please try again shortly.' });
    }

    var internalResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: INTERNAL_NOTIFY_EMAIL,
      subject: 'New fee structure request — ' + name,
      html:
        '<p>A new fee structure request was submitted on heritage-union.com:</p>' +
        '<ul>' +
        '<li><strong>Name:</strong> ' + escapeHtml(name) + '</li>' +
        '<li><strong>Email:</strong> ' + escapeHtml(email) + '</li>' +
        '<li><strong>Country:</strong> ' + escapeHtml(country) + '</li>' +
        '<li><strong>Submitted:</strong> ' + submittedAt.toUTCString() + '</li>' +
        '</ul>',
    });

    if (internalResult.error) {
      // The visitor already has their document — don't fail the request over
      // the internal notification, just log it so it can be investigated.
      console.error('Resend send to james@ failed:', internalResult.error);
    }
  } catch (err) {
    console.error('Resend send threw:', err);
    return jsonResponse(502, { error: 'We could not send the document right now. Please try again shortly.' });
  }

  return jsonResponse(200, { ok: true });
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
