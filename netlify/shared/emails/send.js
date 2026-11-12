// Sends a rendered email with Resend. Never throws: returns true/false and
// logs failures (without the recipient's address).
const { Resend } = require('resend');
const { teamNotifyEmails } = require('../candidate-common');

const FROM = 'Heritage Union <team@heritage-union.com>';
const REPLY_TO = 'team@heritage-union.com';

async function sendEmail(to, email, opts) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured; email not sent:', email.subject);
    return false;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const msg = { from: FROM, to, reply_to: REPLY_TO, subject: email.subject, html: email.html, text: email.text };
    if (opts && opts.attachments) msg.attachments = opts.attachments;
    const res = await resend.emails.send(msg);
    if (res && res.error) {
      console.error('Resend failed for "' + email.subject + '":', res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Resend threw for "' + email.subject + '":', err);
    return false;
  }
}

// Team notifications: everyone in ADMIN_EMAILS. Reference numbers only.
function sendTeam(email) {
  return sendEmail(teamNotifyEmails(), email);
}

module.exports = { sendEmail, sendTeam };
