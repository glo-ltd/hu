const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const FROM_EMAIL = 'Heritage Union <team@heritage-union.com>';
const INTERNAL_NOTIFY_EMAIL = 'james@heritage-union.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CONTACT_LENGTH = 100;

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

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
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

  var contact = typeof data.contact === 'string' ? data.contact.trim().slice(0, MAX_CONTACT_LENGTH) : '';
  if (!contact) {
    return jsonResponse(400, { error: 'Please provide the Zalo number or email you registered with.' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase is not configured.');
    return jsonResponse(500, { error: 'This form is not yet configured. Please try again later.' });
  }

  var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  var matchedIds = [];
  try {
    // Two separate lookups (rather than a single .or() filter) so a
    // contact value containing a comma or other PostgREST filter
    // syntax can never be interpreted as part of the filter itself.
    var byZalo = await supabase
      .from('candidates')
      .update({ status: 'withdrawn' })
      .eq('zalo_number', contact)
      .neq('status', 'withdrawn')
      .select('id');
    if (byZalo.error) {
      console.error('Supabase withdraw-by-zalo failed:', byZalo.error);
    } else if (byZalo.data) {
      matchedIds = matchedIds.concat(byZalo.data.map(function (row) { return row.id; }));
    }

    if (EMAIL_PATTERN.test(contact)) {
      var byEmail = await supabase
        .from('candidates')
        .update({ status: 'withdrawn' })
        .eq('email', contact)
        .neq('status', 'withdrawn')
        .select('id');
      if (byEmail.error) {
        console.error('Supabase withdraw-by-email failed:', byEmail.error);
      } else if (byEmail.data) {
        matchedIds = matchedIds.concat(byEmail.data.map(function (row) { return row.id; }));
      }
    }
  } catch (err) {
    console.error('Supabase withdraw lookup threw:', err);
    // Fall through — we still return a generic success response below so
    // we never reveal via the response whether a contact was registered.
  }

  if (process.env.RESEND_API_KEY && matchedIds.length > 0) {
    try {
      var resend = new Resend(process.env.RESEND_API_KEY);
      var idList = matchedIds.map(function (id) { return escapeHtml(id); }).join(', ');
      var internalResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: INTERNAL_NOTIFY_EMAIL,
        subject: 'Candidate withdrawal request',
        html: '<p>Withdrawal processed for candidate ID(s): ' + idList + ' — view in Supabase.</p>',
      });
      if (internalResult.error) {
        console.error('Resend send to james@ failed:', internalResult.error);
      }
    } catch (err) {
      console.error('Resend internal notification threw:', err);
    }
  }

  // Always return a generic success response, whether or not a match was
  // found, so this endpoint can never be used to probe which Zalo numbers
  // or email addresses are registered with Heritage Union.
  return jsonResponse(200, { ok: true });
};
