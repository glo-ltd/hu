const fs = require('fs');
const path = require('path');
const P = require('../shared/profile-common');
const E = require('../shared/emails');
const { sendEmail, sendTeam } = require('../shared/emails/send');
const { logEvent, firstName } = require('../shared/client-common');
const { ipHash } = require('../shared/request-utils');
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

  var pdfPath = path.join(__dirname, 'assets', 'heritage-union-fee-structure.pdf');
  var pdfBuffer = fs.readFileSync(pdfPath);
  var attachments = [{ filename: 'Heritage-Union-Fee-Structure.pdf', content: pdfBuffer.toString('base64') }];

  var sent = await sendEmail(email, E.R2.build({ firstName: firstName(name) }), { attachments: attachments });
  if (!sent) {
    return jsonResponse(502, { error: 'We could not send the document right now. Please try again shortly.' });
  }

  // Create or update the client record (matched by email, case-insensitive),
  // so the team page shows who asked for the fee document. Never fails the
  // request: he already has his document.
  var clientId = null;
  try {
    var supabase = P.serviceClient();
    if (supabase) {
      var now = new Date().toISOString();
      var lower = email.toLowerCase();
      var found = await supabase.from('clients').select('id').ilike('email', lower.replace(/[\\%_]/g, function (c) { return '\\' + c; })).maybeSingle();
      if (found.error) throw found.error;
      if (found.data) {
        clientId = found.data.id;
        var upd = await supabase.from('clients').update({ fee_document_sent_at: now }).eq('id', clientId);
        if (upd.error) throw upd.error;
      } else {
        var ins = await supabase.from('clients').insert({
          full_name: name, email: lower, country: country, status: 'enquiry', status_changed_at: now, fee_document_sent_at: now,
          source: 'fee_document', ip_hash: ipHash(event),
        }).select('id').single();
        if (ins.error) throw ins.error;
        clientId = ins.data.id;
      }
      await logEvent(supabase, clientId, 'fee_document_sent', 'system');
    }
  } catch (err) {
    console.error('Fee request: saving the client record failed:', err);
  }

  // Team notification: reference number only, never personal details.
  if (clientId) await sendTeam(E.team.feeRequest.build({ clientId: clientId }));

  return jsonResponse(200, { ok: true });
};
