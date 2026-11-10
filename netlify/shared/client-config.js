// Every business decision for the client side, in one place.
// TODO(James): confirm each value below (listed in the PR description).
// Changing a value here changes the site, emails and team page together.

module.exports = {
  // Payment: bank transfer only. Invoices are made by James on the team page.
  // The bank details printed on invoices come from the Netlify env var
  // INVOICE_PAYMENT_DETAILS (multi-line), never from the repo.
  PAYMENT_METHOD: 'Bank transfer',
  CURRENCY: 'USD',
  INVOICE_PREFIX: 'HU',            // HU-YYYY-0001
  INVOICE_DUE_DAYS: 14,            // printed as "Due by" on the invoice
  FEES: {
    initiation: { label: 'Concierge Initiation', amountCents: 15000 * 100 },
    honour: { label: 'Honour payment', amountCents: 10000 * 100 },
  },

  // Heritage Union does not carry out background checks. Each client signs a
  // sworn background declaration, which every woman he chooses reads before
  // deciding. A woman may ask him for an official certificate (phase 3);
  // that upload is optional for him.
  DOCUMENT_MAX_BYTES: 10 * 1024 * 1024,
  DOCUMENT_TYPES: { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' },

  // Client photos (phase 2): same in-browser resize and metadata stripping
  // as candidate photos.
  CLIENT_PHOTOS_MIN: 1,
  CLIENT_PHOTOS_MAX: 3,

  // Matching and introductions (phases 2-3)
  SHORTLIST_MAX: 20,
  CHOICES_MAX: 5,
  MAX_INTRODUCTIONS: 5,            // including replacements
  MATCHING_TIME_TEXT: 'within 2–4 weeks',

  // Engagement and retention
  ENGAGEMENT_MONTHS: 12,           // from the date payment is received
  DOCUMENT_RETENTION_MONTHS_AFTER_CLOSE: 6,

  // Private links
  APPLICATION_LINK_DAYS: 30,
  CLIENT_LINK_DAYS: 30,            // any later link to his private page
  REVIEW_LINK_DAYS: 30,
  DECISION_LINK_DAYS: 30,

  // Reminders (phase 4)
  THINKING_REMINDER_DAYS: 7,
  DECISION_REMINDER_DAYS: 14,
  DECISION_EXPIRY_DAYS: 30,
  CHECK_IN_MONTHS: 3,

  // Text versions stored with what he signs.
  DECLARATION_VERSION: 'en-2026-12-declaration-v2',   // sworn statement, no background check
  ENQUIRY_CONSENT_VERSION: 'en-2026-12-enquiry-v1',

  // Who signs client emails.
  SIGNATURE: ['James', 'Founder, Heritage Union'],
};

// Everything after the enquiry form is switched off until James sets
// CLIENT_SIGNUPS_OPEN=true in Netlify (when the client agreement is final).
module.exports.clientSignupsOpen = function () {
  return process.env.CLIENT_SIGNUPS_OPEN === 'true';
};
