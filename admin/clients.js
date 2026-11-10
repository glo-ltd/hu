/* /admin/ Clients tab: enquiries to engagement.
 * Uses the helpers admin.js exposes on window.HUAdmin. Every action goes
 * through admin-client-* functions (signed-in team members only), and is
 * logged there (who and what, no personal data).
 * There are no fields for notes, ratings or scores about anyone.
 */
(function () {
  'use strict';

  var H = null;
  var $ = function (id) { return document.getElementById(id); };
  var all = [];
  var general = [];
  var signupsOpen = false;
  var filter = 'enquiry';

  var STATUS = {
    enquiry: 'New enquiry', call_booked: 'Call booked', call_held: 'Call held', thinking: 'Thinking it over',
    invited: 'Invited to apply', applying: 'Applying', submitted: 'Documents to check', checked: 'Ready to invoice',
    invoiced: 'Awaiting payment', active: 'Active', paused: 'Paused', not_a_fit: 'Not the right fit', closed: 'Closed',
  };
  var SOURCES = { search: 'Search engine', social: 'Social media', friend: 'A friend or family member', press: 'Press or an article', facebook_group: 'Facebook group', other: 'Other', fee_document: 'Fee document request' };
  var FILTERS = [
    ['enquiry', 'New enquiries', ['enquiry']],
    ['call', 'Call booked', ['call_booked', 'call_held', 'thinking']],
    ['applying', 'Applying', ['invited', 'applying']],
    ['documents', 'Documents to check', ['submitted']],
    ['payment', 'Awaiting payment', ['checked', 'invoiced']],
    ['active', 'Active', ['active', 'paused']],
    ['closed', 'Closed', ['closed', 'not_a_fit']],
    ['all', 'All', null],
  ];
  var EVENT_LABEL = {
    enquiry: 'Enquiry received', added_by_team: 'Added by the team (got in touch directly)', enquiry_again: 'Wrote again through the enquiry form', fee_document_sent: 'Fee document sent (R2)',
    call_booked: 'Call booked', call_held: 'Call held', thinking: 'Thinking it over', invite: 'Invited to apply (R3)', not_a_fit: 'Not the right fit (R4)',
    resend_link: 'New private link sent (R5)', application_started: 'Started his application', id_uploaded: 'Uploaded photo ID',
    certificate_uploaded: 'Uploaded criminal record certificate', declaration_signed: 'Signed background declaration', agreement_accepted: 'Accepted client agreement',
    application_submitted: 'Sent his application (R6)', profile_submitted: 'Sent his profile', profile_summary_save: 'Summary saved',
    profile_summary_send: 'Summary sent for approval (R9)', profile_translate: 'Translations saved', summary_approved: 'Approved his summary (R10)',
    summary_changes_requested: 'Asked for changes to his summary', intro_send: 'Request sent to her (R13)', intro_resend: 'New decision link made',
    intro_introduce: 'Introduced (R15, R16)', intro_cancel: 'Request cancelled', intro_answered: 'Her question answered', intro_accepted: 'She said yes',
    intro_declined: 'She said no (R17 to him)', intro_reminder: '14-day reminder (R14)', intro_expired: 'Request expired at 30 days (R17 to him)', intro_reminder_copy: 'Reminder copied for Zalo',
    pause: 'Paused', unpause: 'Unpaused', closed_success: 'Closed: relationship success (R19, honour invoice, R21)', closed_completed: 'Closed: 12 months complete (R20, R21)', closed_closed: 'Closed (R21)',
    checkin_sent: '3-month check-in (R18)', engagement_12_months: 'Reached 12 months', documents_deleted: 'Documents deleted (6 months after closing)', feedback_received: 'Feedback received', concern_linked: 'A concern was linked to him', intro_question: 'She asked a question', replacement_chosen: 'He chose a replacement', shortlist_sent: 'Shortlist sent (R11)', choices_submitted: 'Sent his choices (R12)', check_id: 'Photo ID checked', check_certificate: 'Certificate checked',
    uncheck_id: 'Photo ID check undone', uncheck_certificate: 'Certificate check undone', invoice_create: 'Invoice drafted', invoice_update: 'Invoice draft changed',
    invoice_send: 'Invoice sent (R7)', invoice_paid: 'Payment received (R8 welcome)', invoice_void: 'Invoice voided',
  };

  function el() { return H.el.apply(null, arguments); }
  function money(cents, cur) { return (cur || 'USD') + ' ' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function ref(id) { return 'C-' + String(id).slice(0, 8).toUpperCase(); }
  function isShown(f, vals) {
    if (!f.showIf) return true;
    var v = vals[f.showIf.id];
    if (f.showIf.equals !== undefined) return v === f.showIf.equals;
    return typeof v === 'number' && v >= f.showIf.min;
  }

  // ------------------------------------------------------------------ modal
  function modal(title, body, okText, onOk, danger) {
    var m = $('ad-modal');
    $('ad-modal-title').textContent = title;
    var b = $('ad-modal-body');
    b.innerHTML = '';
    (Array.isArray(body) ? body : [el('p', { text: body })]).forEach(function (x) { b.appendChild(x); });
    var ok = el('button', { type: 'button', class: 'btn ' + (danger ? 'btn--danger' : 'btn--primary') + ' btn--md', text: okText });
    var cancel = el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Cancel', onclick: function () { m.hidden = true; } });
    ok.addEventListener('click', function () { m.hidden = true; onOk(); });
    b.appendChild(el('div', { class: 'ad-modal-row' }, [cancel, ok]));
    m.hidden = false;
    ok.focus();
  }

  // ------------------------------------------------------------------ list
  function loadList() {
    H.show('ad-clients');
    var box = $('ad-clients');
    if (!box.firstChild) buildListShell(box);
    $('cl-count').textContent = 'Loading…';
    H.api('admin-client-list').then(function (d) {
      all = d.clients || [];
      general = d.general || [];
      signupsOpen = !!d.signupsOpen;
      $('cl-signups').hidden = signupsOpen;
      var cl = $('cl-concerns-link');
      cl.hidden = false;
      cl.textContent = d.openConcerns ? '⚠ ' + d.openConcerns + ' open concern' + (d.openConcerns === 1 ? '' : 's') + ': read them now' : 'Concerns: none open';
      cl.classList.toggle('is-quiet', !d.openConcerns);
      drawList();
    }, function (err) { H.flash(err.message, true); });
  }

  function buildListShell(box) {
    var filters = el('div', { class: 'ad-filters', role: 'group', 'aria-label': 'Filter clients' });
    FILTERS.forEach(function (f) {
      filters.appendChild(el('button', { type: 'button', class: 'ad-filter', 'data-filter': f[0], 'aria-pressed': f[0] === filter ? 'true' : 'false', text: f[1], onclick: function (e) {
        filter = f[0];
        filters.querySelectorAll('.ad-filter').forEach(function (x) { x.setAttribute('aria-pressed', x === e.currentTarget ? 'true' : 'false'); });
        drawList();
      } }));
    });
    var search = el('input', { class: 'form-input ad-search', type: 'search', id: 'cl-search', placeholder: 'Search name, email or country', 'aria-label': 'Search clients' });
    search.addEventListener('input', drawList);
    box.appendChild(el('p', { id: 'cl-signups', class: 'ad-preview-banner', hidden: true, text: 'Client sign-ups are switched off (CLIENT_SIGNUPS_OPEN is not true). Enquiries still arrive, but application links can\'t be sent and his private page shows "not available yet".' }));
    box.appendChild(el('a', { id: 'cl-concerns-link', class: 'ad-preview-banner cl-concerns-link', href: '#clients/concerns', hidden: true }));
    var add = el('button', { type: 'button', class: 'btn btn--secondary btn--md', id: 'cl-add', text: '+ Add client', onclick: addClient });
    box.appendChild(el('div', { class: 'ad-toolbar' }, [filters, search, add]));
    box.appendChild(el('p', { id: 'cl-count', class: 'form-note' }));
    box.appendChild(el('div', { id: 'cl-cards', class: 'ad-cards' }));
    box.appendChild(el('details', { class: 'ad-section cl-general', id: 'cl-general' }));
  }

  // "Add client": for a man who got in touch by email, WhatsApp, phone, in
  // person or by referral. Same record as the enquiry form; nothing is sent
  // to him. If his email is already a client, it opens that record instead.
  function addClient() {
    function field(id, label, attrs) {
      return el('div', { class: 'form-group' }, [el('label', { class: 'form-label', for: id, text: label }), el('input', Object.assign({ class: 'form-input', id: id }, attrs || {}))]);
    }
    var channel = el('select', { class: 'form-input', id: 'cl-add-channel' }, [
      ['', 'Choose…'], ['email', 'Email'], ['whatsapp', 'WhatsApp'], ['phone', 'Phone'], ['in_person', 'In person'], ['referral', 'Referral'], ['other', 'Other'],
    ].map(function (o) { return el('option', { value: o[0], text: o[1] }); }));
    var body = [
      el('p', { class: 'form-note', text: 'For someone who contacted you directly. Nothing is sent to him.' }),
      field('cl-add-name', 'Full name', { autocomplete: 'off', maxlength: 120 }),
      field('cl-add-email', 'Email', { type: 'email', autocomplete: 'off', maxlength: 200 }),
      field('cl-add-country', 'Country of residence', { maxlength: 80 }),
      field('cl-add-age', 'Age (optional)', { inputmode: 'numeric', maxlength: 2 }),
      field('cl-add-phone', 'Phone or WhatsApp (optional)', { maxlength: 40 }),
      el('div', { class: 'form-group' }, [el('label', { class: 'form-label', for: 'cl-add-channel', text: 'How did he get in touch?' }), channel]),
      el('div', { class: 'form-group' }, [el('label', { class: 'form-label', for: 'cl-add-message', text: 'What he asked about (optional)' }), el('textarea', { class: 'form-input', id: 'cl-add-message', rows: 3, maxlength: 1000 })]),
    ];
    modal('Add client', body, 'Add client', function () {
      H.api('admin-client-create', {
        fullName: $('cl-add-name').value, email: $('cl-add-email').value, country: $('cl-add-country').value,
        age: $('cl-add-age').value, phone: $('cl-add-phone').value, channel: $('cl-add-channel').value, message: $('cl-add-message').value,
      }).then(function (r) {
        H.flash(r.existing ? 'He was already a client, so his record is open.' : 'Client added.');
        location.hash = 'client-' + r.id;
      }, function (err) { H.flash(err.message, true); });
    });
    $('cl-add-name').focus();
  }

  function drawList() {
    var f = FILTERS.filter(function (x) { return x[0] === filter; })[0];
    var q = H.fold($('cl-search').value.trim());
    var rows = all.filter(function (c) { return !f[2] || f[2].indexOf(c.status) !== -1; }).filter(function (c) {
      return !q || H.fold(c.full_name).indexOf(q) !== -1 || H.fold(c.email).indexOf(q) !== -1 || H.fold(c.country).indexOf(q) !== -1;
    });
    var box = $('cl-cards');
    box.innerHTML = '';
    rows.forEach(function (c) { box.appendChild(card(c)); });
    if (!rows.length) box.appendChild(el('p', { class: 'form-note', text: 'Nobody here.' }));
    $('cl-count').textContent = rows.length + ' of ' + all.length + ' clients';
    var g = $('cl-general');
    g.innerHTML = '';
    g.appendChild(el('summary', { text: 'Press and other enquiries (' + general.length + ')' }));
    general.forEach(function (x) {
      g.appendChild(el('div', { class: 'ad-answer' }, [
        el('span', { class: 'ad-q', text: H.fmtDateTime(x.created_at) + ' · ' + (x.country || '') }),
        el('span', { class: 'ad-a', text: x.full_name + ' <' + x.email + '>' }),
        el('span', { class: 'ad-a', text: x.message || '' }),
      ]));
    });
  }

  function card(c) {
    var days = H.daysSince(c.status_changed_at || c.created_at);
    var badges = [el('span', { class: 'ad-badge ad-badge--status', text: STATUS[c.status] || c.status })];
    if (c.fee_document_sent_at) badges.push(el('span', { class: 'ad-badge', text: 'Fee document sent' }));
    if (c.status === 'submitted') badges.push(el('span', { class: 'ad-badge ad-badge--warn', text: (c.id_checked_at ? '✓ ID' : 'ID to check') + ' · ' + (c.certificate_checked_at ? '✓ certificate' : 'certificate to check') }));
    if (c.status === 'active' && c.engagement_ends_at && !c.engagement_flagged_at) badges.push(el('span', { class: 'ad-badge ad-badge--ok', text: 'Until ' + H.fmtDate(c.engagement_ends_at) }));
    if (c.engagement_flagged_at && ['active', 'paused'].indexOf(c.status) !== -1) badges.push(el('span', { class: 'ad-badge ad-badge--danger', text: '12 months reached: decide how to close' }));
    if (c.status === 'closed' && c.closed_kind) badges.push(el('span', { class: 'ad-badge', text: { success: 'Relationship success', completed: '12 months complete', closed: 'Closed' }[c.closed_kind] }));
    return el('button', { type: 'button', class: 'ad-card', onclick: function () { location.hash = 'client-' + c.id; } }, [
      el('div', { class: 'ad-card-top' }, [el('span', { class: 'ad-card-name', text: c.full_name }), el('span', { class: 'ad-card-sub', text: 'Enquired ' + H.fmtDate(c.created_at) })]),
      el('span', { class: 'ad-card-sub', text: [c.country, c.age ? 'age ' + c.age : null].filter(Boolean).join(' · ') }),
      el('span', { class: 'ad-card-sub', text: (STATUS[c.status] || c.status) + ' for ' + days + ' day' + (days === 1 ? '' : 's') }),
      el('div', { class: 'ad-badges' }, badges),
    ]);
  }

  // ------------------------------------------------------------------ detail
  function loadDetail(id, after) {
    H.show('ad-client-detail');
    var box = $('ad-client-detail');
    box.innerHTML = '';
    box.appendChild(el('p', { text: 'Loading…' }));
    H.api('admin-client-get', { id: id }).then(function (d) { drawDetail(d); if (after) after(); }, function (err) {
      box.innerHTML = '';
      box.appendChild(el('p', { class: 'ad-flash is-error', text: err.message }));
      box.appendChild(el('button', { type: 'button', class: 'ad-link', text: '← All clients', onclick: function () { location.hash = 'clients'; } }));
    });
  }

  function act(id, action, done) {
    return H.api('admin-client-action', { id: id, action: action }).then(function (r) {
      H.flash(r.warning || done, !!r.warning);
      loadDetail(id);
    }, function (err) { H.flash(err.message, true); });
  }

  function dl(pairs) {
    var d = el('dl', { class: 'ad-dl' });
    pairs.filter(Boolean).forEach(function (p) {
      d.appendChild(el('dt', { text: p[0] }));
      d.appendChild(el('dd', { text: p[1] === null || p[1] === undefined || p[1] === '' ? '—' : String(p[1]) }));
    });
    return d;
  }

  function answer(f, v) {
    if (v === undefined || v === null || v === '') return null;
    if (f.type === 'single') { var o = f.options.filter(function (x) { return x.value === v; })[0]; return o ? o.label : v; }
    if (f.type === 'languages') return v.map(function (x) { return x.language + ' (' + x.level + ')'; }).join(', ');
    if (f.type === 'date') return H.fmtDate(v + 'T00:00:00Z');
    return String(v);
  }

  function answersBlock(form, section, vals) {
    var wrap = el('div');
    form.fields.forEach(function (f) {
      if (f.section !== section || f.type === 'document' || !isShown(f, vals)) return;
      var t = answer(f, vals[f.id]);
      var yes = f.type === 'single' && vals[f.id] === 'yes' && section === 'declaration';
      wrap.appendChild(el('div', { class: 'ad-answer' }, [
        el('span', { class: 'ad-q', text: f.label }),
        el('span', { class: 'ad-a' + (t ? '' : ' ad-empty') + (yes ? ' cl-yes' : ''), text: t || 'No answer' }),
      ]));
    });
    return wrap;
  }

  function drawDetail(d) {
    var c = d.client;
    var box = $('ad-client-detail');
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'ad-detail-head' }, [el('button', { type: 'button', class: 'ad-link', text: '← All clients', onclick: function () { location.hash = 'clients'; } })]));
    box.appendChild(el('div', { class: 'ad-detail-head' }, [
      el('h1', { text: c.full_name }),
      el('div', { class: 'ad-badges' }, [el('span', { class: 'ad-badge ad-badge--status', text: STATUS[c.status] || c.status }), el('span', { class: 'ad-badge', text: ref(c.id) })]),
    ]));
    if (!d.signupsOpen) box.appendChild(el('p', { class: 'ad-preview-banner', text: 'Client sign-ups are switched off (CLIENT_SIGNUPS_OPEN is not true), so application links can\'t be sent yet.' }));
    var left = el('div', { style: 'display:grid;gap:12px' });
    var right = el('div', { class: 'cl-right', style: 'display:grid;gap:12px' });
    box.appendChild(el('div', { class: 'ad-grid' }, [left, right]));

    left.appendChild(el('section', { class: 'ad-section' }, [
      el('h2', { text: 'Enquiry' }),
      dl([
        ['Email', c.email], ['Country', c.country], ['Age', c.age], ['Phone / WhatsApp', c.phone], ['Heard about us', SOURCES[c.source] || c.source],
        ['Enquired', H.fmtDateTime(c.created_at)], ['Consent to contact', c.consent_contact_at ? H.fmtDateTime(c.consent_contact_at) : null],
        ['Fee document sent', c.fee_document_sent_at ? H.fmtDateTime(c.fee_document_sent_at) : 'Not requested'],
      ]),
      c.enquiry_message ? el('p', { class: 'ad-a', text: c.enquiry_message }) : null,
    ]));

    var hasApp = c.application && Object.keys(c.application).length;
    if (hasApp || ['invited', 'applying', 'submitted', 'checked', 'invoiced', 'active', 'paused'].indexOf(c.status) !== -1) {
      left.appendChild(el('section', { class: 'ad-section' }, [
        el('h2', { text: 'Application (F2)' }),
        hasApp ? answersBlock(d.form, 'application', c.application) : el('p', { class: 'ad-empty', text: 'Not started yet.' }),
      ]));
      left.appendChild(el('section', { class: 'ad-section' }, [
        el('h2', { text: 'Background declaration (F3)' }),
        c.declaration && Object.keys(c.declaration).length ? answersBlock(d.form, 'declaration', c.declaration) : el('p', { class: 'ad-empty', text: 'Not started yet.' }),
        dl([
          ['Signed', c.declaration_signed_at ? H.fmtDateTime(c.declaration_signed_at) + ' as "' + c.declaration_typed_name + '"' : 'Not signed'],
          ['Declaration version', c.declaration_version],
        ]),
      ]));
      left.appendChild(el('section', { class: 'ad-section' }, [
        el('h2', { text: 'Client agreement' }),
        dl([
          ['Current version', d.agreement.version + (/DRAFT/i.test(d.agreement.version) ? ' (draft: clients can\'t accept yet)' : '')],
          ['Accepted', c.agreement_accepted_at ? H.fmtDateTime(c.agreement_accepted_at) + ' as "' + c.agreement_typed_name + '", version ' + c.agreement_version : 'Not accepted'],
        ]),
      ]));
    }

    if (['active', 'paused', 'closed'].indexOf(c.status) !== -1) {
      left.appendChild(profileSection(c, d));
      if (d.profile && d.profile.submitted_at) {
        left.appendChild(summarySection(c, d));
        left.appendChild(translationSection(c, d));
      }
      right.appendChild(matchingSection(c, d));
      if (d.introductions && d.introductions.length) left.insertBefore(introductionsSection(c, d), left.firstChild);
    }
    if (['active', 'paused', 'closed'].indexOf(c.status) !== -1) right.appendChild(engagementSection(c, d));
    right.appendChild(actionsSection(c, d));
    if (['submitted', 'checked', 'invoiced', 'active', 'paused', 'closed'].indexOf(c.status) !== -1 || c.id_document_path || c.certificate_path) right.appendChild(documentsSection(c, d));
    if (['submitted', 'checked', 'invoiced', 'active', 'paused', 'closed'].indexOf(c.status) !== -1 || d.invoices.length) right.appendChild(invoicesSection(c, d));
    right.appendChild(timelineSection(d.events));
  }

  function actionsSection(c, d) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Next step' })]);
    var list = el('div', { class: 'ad-actions' });
    var name = c.full_name.split(' ')[0];
    function btn(label, onClick, cls) { list.appendChild(el('button', { type: 'button', class: 'btn ' + (cls || 'btn--secondary') + ' btn--md', text: label, onclick: onClick })); }
    var s = c.status;
    if (s === 'enquiry' || s === 'thinking') btn('Call booked', function () { act(c.id, 'call_booked', 'Marked call booked.'); });
    if (s === 'enquiry' || s === 'call_booked') btn('Call held', function () { act(c.id, 'call_held', 'Marked call held.'); });
    if (['call_booked', 'call_held', 'thinking'].indexOf(s) !== -1) {
      btn('Invite to apply (R3)', function () {
        modal('Invite ' + name + ' to apply?', 'He receives R3: a summary of the process, the fee document and his private application link (valid 30 days).', 'Send invitation', function () { act(c.id, 'invite', 'Invitation sent.'); });
      }, 'btn--primary');
      if (s !== 'thinking') btn('Thinking it over', function () { act(c.id, 'thinking', 'Marked "thinking it over". You\'ll get a reminder in 7 days.'); });
    }
    if (['enquiry', 'call_booked', 'call_held', 'thinking', 'invited', 'applying', 'submitted', 'checked'].indexOf(s) !== -1) {
      btn('Not the right fit (R4)', function () {
        modal('Send "not the right fit" to ' + name + '?', 'He receives R4, a kind, brief email with no reasons. His private link stops working.', 'Send R4', function () { act(c.id, 'not_a_fit', 'R4 sent.'); }, true);
      });
    }
    if (['invited', 'applying', 'submitted', 'checked', 'invoiced', 'active', 'paused'].indexOf(s) !== -1) {
      btn('Send a new private link (R5)', function () {
        modal('Send ' + name + ' a new private link?', 'His previous link stops working.', 'Send link', function () { act(c.id, 'resend_link', 'New link sent.'); });
      });
      list.appendChild(el('p', { class: 'form-note', text: 'Link last sent ' + H.fmtDateTime(c.link_sent_at) + ', works until ' + H.fmtDateTime(c.access_token_expires_at) + '.' }));
    }
    if (!list.firstChild) list.appendChild(el('p', { class: 'form-note', text: s === 'invoiced' ? 'Waiting for his payment. Mark the invoice paid below when it arrives.' : 'Nothing to do here right now.' }));
    sec.appendChild(list);
    return sec;
  }

  function documentsSection(c, d) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Documents' })]);
    [['id', 'Photo ID', c.id_document_path, c.id_checked_at, c.id_checked_by], ['certificate', 'Criminal record certificate', c.certificate_path, c.certificate_checked_at, c.certificate_checked_by]].forEach(function (x) {
      var kind = x[0];
      var row = el('div', { class: 'ad-answer' }, [el('span', { class: 'ad-q', text: x[1] })]);
      if (!x[2]) { row.appendChild(el('span', { class: 'ad-empty', text: 'Not uploaded' })); sec.appendChild(row); return; }
      if (kind === 'certificate') {
        var dec = c.declaration || {};
        row.appendChild(el('span', { class: 'ad-a', text: 'Issued ' + (dec.certificate_issued_on ? H.fmtDate(dec.certificate_issued_on + 'T00:00:00Z') : '?') + ' in ' + (dec.certificate_country || '?') }));
      }
      var open = el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Open (10-minute link)' });
      open.addEventListener('click', function () {
        // Open the tab first so pop-up blockers allow it, then point it at the signed URL.
        var w = window.open('', '_blank');
        H.api('admin-client-doc', { id: c.id, kind: kind }).then(function (r) { if (w) { w.opener = null; w.location = r.url; } else location.href = r.url; }, function (err) { if (w) w.close(); H.flash(err.message, true); });
      });
      var actions = el('div', { class: 'ad-translate-row' }, [open]);
      var checked = !!x[3];
      if (['submitted', 'checked'].indexOf(c.status) !== -1) {
        actions.appendChild(el('button', { type: 'button', class: 'btn ' + (checked ? 'btn--secondary' : 'btn--primary') + ' btn--sm', text: checked ? 'Undo check' : 'Mark checked', onclick: function () {
          act(c.id, (checked ? 'uncheck_' : 'check_') + kind, checked ? 'Check undone.' : 'Marked checked.');
        } }));
      }
      actions.appendChild(el('span', { text: checked ? '✓ Checked by ' + x[4] + ', ' + H.fmtDateTime(x[3]) : 'Not checked yet' }));
      row.appendChild(actions);
      sec.appendChild(row);
    });
    sec.appendChild(el('p', { class: 'form-note', text: 'Check that the ID matches his legal name and date of birth, and that the certificate is official, from his country of residence and issued within the last ' + d.certificateMaxAgeMonths + ' months. Then mark each as checked. The invoice can only be sent once both are checked.' }));
    return sec;
  }

  function invoicesSection(c, d) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Invoices and payment' })]);
    if (!d.paymentDetailsSet) sec.appendChild(el('p', { class: 'ad-preview-banner', text: 'INVOICE_PAYMENT_DETAILS is not set in Netlify. Invoices can be drafted but not sent.' }));
    d.invoices.forEach(function (inv) {
      var row = el('div', { class: 'ad-answer' }, [
        el('span', { class: 'ad-q', text: (inv.number || 'Draft') + ' · ' + inv.status.toUpperCase() + ' · created by ' + inv.created_by }),
        el('span', { class: 'ad-a', text: inv.description + ' — ' + money(inv.amount_cents, inv.currency) }),
        inv.sent_at ? el('span', { class: 'ad-card-sub', text: 'Sent ' + H.fmtDateTime(inv.sent_at) + (inv.paid_at ? ' · paid ' + H.fmtDateTime(inv.paid_at) + ' (marked by ' + inv.marked_paid_by + ')' : '') }) : null,
      ]);
      var actions = el('div', { class: 'ad-translate-row' });
      actions.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Preview PDF', onclick: function () { previewPdf(c.id, inv.id); } }));
      if (inv.status === 'draft') {
        actions.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Change amount', onclick: function () { editAmount(c, inv); } }));
        var canSend = c.status === 'checked' && d.paymentDetailsSet;
        actions.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Send invoice (R7)', disabled: !canSend, title: canSend ? null : 'Check both documents (and set INVOICE_PAYMENT_DETAILS) first', onclick: function () {
          modal('Send invoice to ' + c.full_name.split(' ')[0] + '?', 'It gets the next invoice number and is emailed with the PDF attached: ' + inv.description + ', ' + money(inv.amount_cents, inv.currency) + '.', 'Send invoice', function () { invoiceOp(c.id, 'send', inv.id, 'Invoice sent.'); });
        } }));
      }
      if (inv.status === 'sent') {
        actions.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Mark payment received', onclick: function () {
          modal('Mark ' + inv.number + ' as paid?', 'Only when the money is in the account. His 12-month engagement starts today and he receives R8, the welcome email with his link to begin his profile.', 'Payment received', function () { invoiceOp(c.id, 'paid', inv.id, 'Marked paid. Welcome email sent.'); });
        } }));
      }
      if (inv.status === 'draft' || inv.status === 'sent') {
        actions.appendChild(el('button', { type: 'button', class: 'ad-link', text: 'Void', onclick: function () {
          modal('Void this invoice?', inv.status === 'sent' ? 'He has already received it. Let him know it is cancelled.' : 'The draft is cancelled.', 'Void invoice', function () { invoiceOp(c.id, 'void', inv.id, 'Invoice voided.'); }, true);
        } }));
      }
      row.appendChild(actions);
      sec.appendChild(row);
    });
    var open = d.invoices.some(function (i) { return i.kind === 'initiation' && (i.status === 'draft' || i.status === 'sent' || i.status === 'paid'); });
    if (!open && ['submitted', 'checked'].indexOf(c.status) !== -1) {
      var fee = d.fees.initiation;
      var amount = el('input', { class: 'form-input', type: 'number', min: 1, step: '0.01', id: 'cl-inv-amount', value: (fee.amountCents / 100).toFixed(2), 'aria-label': 'Amount in USD' });
      var desc = el('input', { class: 'form-input', type: 'text', id: 'cl-inv-desc', maxlength: 200, value: fee.label, 'aria-label': 'Description' });
      sec.appendChild(el('div', { class: 'ad-translate' }, [
        el('label', { for: 'cl-inv-desc', text: 'New invoice: description' }), desc,
        el('label', { for: 'cl-inv-amount', text: 'Amount (USD). Change it for the founding-member discount.' }), amount,
        el('div', { class: 'ad-translate-row' }, [el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Create draft invoice', onclick: function () {
          H.api('admin-client-invoice', { id: c.id, op: 'create', kind: 'initiation', amountCents: Math.round(Number(amount.value) * 100), description: desc.value }).then(function () { H.flash('Draft created. Preview it, then send once both documents are checked.'); loadDetail(c.id); }, function (err) { H.flash(err.message, true); });
        } })]),
      ]));
    }
    return sec;
  }

  function editAmount(c, inv) {
    var input = el('input', { class: 'form-input', type: 'number', min: 1, step: '0.01', value: (inv.amount_cents / 100).toFixed(2), id: 'cl-edit-amount' });
    var desc = el('input', { class: 'form-input', type: 'text', maxlength: 200, value: inv.description, id: 'cl-edit-desc' });
    modal('Change draft invoice', [el('label', { class: 'form-label', for: 'cl-edit-desc', text: 'Description' }), desc, el('label', { class: 'form-label', for: 'cl-edit-amount', text: 'Amount (USD)' }), input], 'Save', function () {
      H.api('admin-client-invoice', { id: c.id, op: 'update', invoiceId: inv.id, amountCents: Math.round(Number(input.value) * 100), description: desc.value }).then(function () { H.flash('Draft updated.'); loadDetail(c.id); }, function (err) { H.flash(err.message, true); });
    });
  }

  function invoiceOp(id, op, invoiceId, done) {
    H.api('admin-client-invoice', { id: id, op: op, invoiceId: invoiceId }).then(function (r) { H.flash(r.warning || done, !!r.warning); loadDetail(id); }, function (err) { H.flash(err.message, true); });
  }

  function previewPdf(id, invoiceId) {
    var w = window.open('', '_blank');
    H.api('admin-client-invoice', { id: id, op: 'pdf', invoiceId: invoiceId }).then(function (r) {
      var bin = atob(r.pdf); var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
      if (w) w.location = url; else location.href = url;
    }, function (err) { if (w) w.close(); H.flash(err.message, true); });
  }

  function timelineSection(events) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Timeline' })]);
    var ol = el('ol', { class: 'cl-tl' });
    events.forEach(function (e) {
      ol.appendChild(el('li', null, [
        el('span', { class: 'ad-card-sub', text: H.fmtDateTime(e.created_at) }),
        el('span', { text: (EVENT_LABEL[e.kind] || e.kind) + (e.detail ? ' · ' + e.detail : '') }),
        el('span', { class: 'ad-card-sub', text: e.actor === 'client' ? 'by him' : e.actor === 'system' ? 'automatic' : 'by ' + e.actor }),
      ]));
    });
    if (!events.length) ol.appendChild(el('li', { class: 'ad-empty', text: 'Nothing yet.' }));
    sec.appendChild(ol);
    return sec;
  }

  // ------------------------------------------------------------------ phase 2: his profile
  function pqAnswer(q, v) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return null;
    var lab = function (opts, x) { var o = opts.filter(function (y) { return y.value === x; })[0]; return o ? o.label : x; };
    if (q.type === 'single') return lab(q.options, v);
    if (q.type === 'multi') return v.map(function (x) { return lab(q.options, x); }).join(', ');
    if (q.type === 'range') return v[0] + '–' + v[1];
    if (q.type === 'languages' || q.type === 'langreq') return v.map(function (x) { return (x.language === 'other' ? x.other : lab(q.options, x.language)) + (q.type === 'langreq' ? ' (at least ' : ' (') + lab(q.levels, x.level).toLowerCase() + ')'; }).join(', ');
    return String(v);
  }
  function pqValue(q, p) { return q.storage === 'column' ? p.display_name : q.storage === 'message' ? p.message_to_women : (p.answers || {})[q.id]; }

  function profileSection(c, d) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'His profile (F4)' })]);
    var p = d.profile;
    if (!p) { sec.appendChild(el('p', { class: 'ad-empty', text: 'Not started yet.' })); return sec; }
    sec.appendChild(el('p', { class: 'form-note', text: p.submitted_at ? 'Sent ' + H.fmtDateTime(p.submitted_at) + '. Shown as he wrote it; the team can\'t edit his answers.' : 'He is still writing it (not sent yet).' }));
    if (d.profilePhotos.length) sec.appendChild(el('div', { class: 'ad-photos' }, d.profilePhotos.map(function (x, i) { return el('img', { src: x.url || '', alt: 'His photo ' + (i + 1) }); })));
    d.profileQuestions.steps.forEach(function (st) {
      var qs = d.profileQuestions.questions.filter(function (q) { return q.step === st.step; });
      if (!qs.length) return;
      sec.appendChild(el('h3', { text: st.title }));
      qs.forEach(function (q) {
        var t = pqAnswer(q, pqValue(q, p));
        if (t === null && !q.required) return;
        sec.appendChild(el('div', { class: 'ad-answer' }, [el('span', { class: 'ad-q', text: q.label }), el('span', { class: 'ad-a' + (t ? '' : ' ad-empty'), text: t || 'No answer' })]));
      });
    });
    return sec;
  }

  // Starter paragraph from his answers, for James to edit.
  function keyFacts(c, d) {
    var p = d.profile, a = p.answers || {}, Q = {};
    d.profileQuestions.questions.forEach(function (q) { Q[q.id] = q; });
    var age = c.application && c.application.date_of_birth ? Math.floor((Date.now() - Date.parse(c.application.date_of_birth)) / 31557600000) : null;
    var name = p.display_name || c.full_name.split(' ')[0];
    var parts = [];
    parts.push(name + ' is ' + (age ? 'a ' + age + '-year-old ' : 'a ') + (a.occupation ? a.occupation.toLowerCase() : 'professional') + (a.city || a.country ? ' living in ' + [a.city, a.country].filter(Boolean).join(', ') : '') + '.');
    if (a.languages) parts.push('He speaks ' + pqAnswer(Q.languages, a.languages) + '.');
    var fam = [];
    if (a.marital_history) fam.push('He is ' + pqAnswer(Q.marital_history, a.marital_history).toLowerCase());
    if (typeof a.children === 'number') fam.push(a.children === 0 ? 'has no children' : 'has ' + a.children + (a.children === 1 ? ' child' : ' children'));
    if (fam.length) parts.push(fam.join(' and ') + '.');
    if (a.values) parts.push('What matters most to him: ' + pqAnswer(Q.values, a.values).toLowerCase() + '.');
    if (a.where_live) parts.push('Where he hopes to live: ' + pqAnswer(Q.where_live, a.where_live).toLowerCase() + '.');
    return '<p>' + parts.join(' ') + '</p><p>' + (a.partner_matters ? 'In his own words: “' + a.partner_matters.replace(/</g, '&lt;') + '”' : '') + '</p>';
  }

  function words(html) { return (html.replace(/<[^>]+>/g, ' ').match(/\S+/g) || []).length; }

  function summarySection(c, d) {
    var p = d.profile;
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Profile summary (English)' })]);
    var state = p.summary_approved_at ? '✓ Approved by him ' + H.fmtDateTime(p.summary_approved_at)
      : p.summary_sent_at ? 'Sent to him for approval ' + H.fmtDateTime(p.summary_sent_at)
      : p.changes_requested_at ? 'He asked for changes ' + H.fmtDateTime(p.changes_requested_at) : 'Not sent yet';
    sec.appendChild(el('p', { class: p.changes_requested_at && !p.summary_sent_at && !p.summary_approved_at ? 'ad-preview-banner' : 'form-note', text: state + (p.summary_by ? ' · last saved by ' + p.summary_by + ', ' + H.fmtDateTime(p.summary_at) : '') }));
    if (p.changes_requested_at && !p.summary_approved_at) sec.appendChild(el('blockquote', { class: 'cl-quote', text: p.changes_comment || '' }));
    var editor = el('div', { class: 'cl-editor', contenteditable: p.summary_approved_at ? 'false' : 'true', role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Profile summary', id: 'cl-summary-editor' });
    editor.innerHTML = p.summary_html || '';
    var count = el('span', { class: 'ad-card-sub' });
    var upd = function () { count.textContent = words(editor.innerHTML) + ' words (aim for about 300)'; };
    editor.addEventListener('input', upd); upd();
    if (!p.summary_approved_at) {
      var tb = el('div', { class: 'cl-toolbar', role: 'toolbar', 'aria-label': 'Formatting' }, [
        el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Bold', onclick: function () { document.execCommand('bold'); editor.focus(); } }),
        el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Italic', onclick: function () { document.execCommand('italic'); editor.focus(); } }),
        el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'List', onclick: function () { document.execCommand('insertUnorderedList'); editor.focus(); } }),
        el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Insert key facts', onclick: function () { editor.innerHTML = keyFacts(c, d) + editor.innerHTML; upd(); } }),
      ]);
      sec.appendChild(tb);
    }
    sec.appendChild(editor);
    var row = el('div', { class: 'ad-translate-row' }, [count]);
    if (!p.summary_approved_at) {
      row.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Save draft', onclick: function () {
        H.api('admin-client-profile', { id: c.id, op: 'summary_save', html: editor.innerHTML }).then(function () { H.flash('Summary saved.'); loadDetail(c.id); }, function (e) { H.flash(e.message, true); });
      } }));
      row.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Save and send for approval (R9)', onclick: function () {
        modal('Send the summary to him for approval?', 'He receives R9 with a new private link. He can approve it or ask for changes.', 'Send', function () {
          H.api('admin-client-profile', { id: c.id, op: 'summary_save', html: editor.innerHTML }).then(function () { return H.api('admin-client-profile', { id: c.id, op: 'summary_send' }); })
            .then(function () { H.flash('Sent for approval.'); loadDetail(c.id); }, function (e) { H.flash(e.message, true); });
        });
      } }));
    }
    sec.appendChild(row);
    return sec;
  }

  function translationSection(c, d) {
    var p = d.profile;
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Vietnamese translations' }),
      el('p', { class: 'form-note', text: 'For Huyen: the summary, his declaration and his message, side by side. Women read these in Vietnamese before deciding. ' + (p.translated_by ? 'Last saved by ' + p.translated_by + ', ' + H.fmtDateTime(p.translated_at) + '.' : 'Not translated yet.') })]);
    function pair(label, en, viEl) {
      var enBox = el('div', { class: 'cl-pair-en' });
      enBox.innerHTML = en; // sanitised summary HTML, or escaped text
      return el('div', { class: 'cl-pair' }, [el('div', null, [el('span', { class: 'ad-q', text: label + ' — English' }), enBox]), el('div', null, [el('span', { class: 'ad-q', text: 'Tiếng Việt' }), viEl])]);
    }
    var esc = function (t) { return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>'); };
    var sumVi = el('textarea', { class: 'form-textarea', lang: 'vi', rows: 10, 'aria-label': 'Summary in Vietnamese' });
    sumVi.value = (p.summary_vi_html || '').replace(/<br>/g, '\n').replace(/<\/p>\s*<p>/g, '\n\n').replace(/<\/?p>/g, '');
    sec.appendChild(pair('Summary', p.summary_html || '<em>No summary yet</em>', sumVi));
    var decl = {};
    sec.appendChild(el('h3', { text: 'Background declaration' }));
    d.form.fields.filter(function (f) { return f.section === 'declaration' && f.type !== 'document'; }).forEach(function (f) {
      var v = (c.declaration || {})[f.id];
      if (v === undefined || v === null || v === '') return;
      var shown = f.type === 'single' ? (f.options.filter(function (o) { return o.value === v; })[0] || {}).label : String(v);
      var t = el('textarea', { class: 'form-textarea', lang: 'vi', rows: f.type === 'textarea' ? 4 : 2, 'aria-label': f.label + ' (Vietnamese)' });
      t.value = (p.declaration_vi || {})[f.id] || '';
      decl[f.id] = t;
      sec.appendChild(pair(f.label, esc(f.label + ': ' + shown), t));
    });
    var msgVi = el('textarea', { class: 'form-textarea', lang: 'vi', rows: 4, 'aria-label': 'Message in Vietnamese' });
    msgVi.value = p.message_vi || '';
    sec.appendChild(el('h3', { text: 'His message to each woman' }));
    sec.appendChild(pair('Message', esc(p.message_to_women || ''), msgVi));
    sec.appendChild(el('div', { class: 'ad-translate-row' }, [el('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Save translations', onclick: function () {
      var dv = {}; Object.keys(decl).forEach(function (k) { dv[k] = decl[k].value; });
      var html = sumVi.value.trim() ? '<p>' + esc(sumVi.value.trim()).replace(/(<br>){2,}/g, '</p><p>') + '</p>' : '';
      H.api('admin-client-profile', { id: c.id, op: 'translate', summaryVi: html, declarationVi: dv, messageVi: msgVi.value }).then(function () { H.flash('Translations saved.'); loadDetail(c.id); }, function (e) { H.flash(e.message, true); });
    } })]));
    return sec;
  }

  function matchingSection(c, d) {
    var p = d.profile;
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Matching and choices' })]);
    var ready = p && p.summary_approved_at;
    sec.appendChild(el('p', { class: 'form-note', text: !p || !p.submitted_at ? 'Matching opens once he has sent his profile.' : ready ? 'His summary is approved.' : 'You can look at matches now; the shortlist can be sent once he approves his summary.' }));
    if (p && p.submitted_at) sec.appendChild(el('a', { class: 'btn btn--primary btn--md', href: '#client-' + c.id + '/matching', text: 'Open the matching screen' }));
    if (d.shortlist.length) sec.appendChild(el('div', { class: 'ad-answer' }, [el('span', { class: 'ad-q', text: 'Shortlist sent ' + H.fmtDateTime(c.shortlist_sent_at) + ' (' + d.shortlist.length + ')' }), el('span', { class: 'ad-a', lang: 'vi', text: d.shortlist.map(function (x) { return x.name; }).join(', ') })]));
    if (d.choices.length) sec.appendChild(el('div', { class: 'ad-answer' }, [el('span', { class: 'ad-q', text: 'His choices, ' + H.fmtDateTime(c.choices_submitted_at) }), el('ol', { class: 'cl-ranked' }, d.choices.map(function (x) { return el('li', { lang: 'vi' }, [el('a', { href: '#' + x.id, text: x.name })]); }))]));
    return sec;
  }

  // ------------------------------------------------------------------ phase 3: introductions
  var INTRO_LABEL = { queued: 'Queued (she has another request open)', ready: 'Ready to send', sent: 'Sent to her', opened: 'She opened it', accepted: 'She said yes', introduced: 'Introduced',
    declined: 'She said no', expired: 'Expired (no answer in 30 days)', cancelled: 'Cancelled' };
  var METHOD = { messages: 'messages', voice: 'voice call', video: 'video call' };

  function copyBox(text, note) {
    var ta = el('textarea', { class: 'form-textarea ad-copybox', readonly: true, lang: 'vi', 'aria-label': 'Message to copy into Zalo' });
    ta.value = text;
    var p = el('p', { class: 'form-note', role: 'status', text: note });
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { p.textContent = note + ' Copied: paste it into Zalo.'; }, function () { ta.select(); });
    else ta.select();
    return el('div', { class: 'cl-copy' }, [p, ta]);
  }

  function introductionsSection(c, d) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Introductions' }),
      el('p', { class: 'form-note', text: 'His choices in his order. Only one request per woman can be open at a time; the others wait. ' + d.introductions.filter(function (x) { return ['declined', 'expired', 'cancelled'].indexOf(x.status) === -1; }).length + ' of ' + d.maxIntroductions + ' in use.' })]);
    var out = el('div', { id: 'cl-intro-out' });
    d.introductions.forEach(function (x) {
      var row = el('div', { class: 'ad-answer cl-introrow is-' + x.status }, [
        el('div', { class: 'ad-card-top' }, [el('a', { class: 'ad-card-name', href: '#' + x.candidateId, lang: 'vi', text: x.rank + '. ' + x.name }), el('span', { class: 'ad-badge ad-badge--status', text: INTRO_LABEL[x.status] })]),
        el('span', { class: 'ad-card-sub', text: [x.replacement ? 'Replacement' : null, 'her language: ' + (x.lang === 'en' ? 'English' : 'Vietnamese'), x.hasEmail ? 'has email' : 'Zalo only',
          x.sentAt ? 'sent ' + H.fmtDate(x.sentAt) + ' by ' + x.sentBy : null, x.openedAt ? 'opened ' + H.fmtDate(x.openedAt) : null, x.decidedAt ? 'answered ' + H.fmtDate(x.decidedAt) : null,
          x.introducedAt ? 'introduced ' + H.fmtDate(x.introducedAt) + ' by ' + x.introducedBy : null, x.cancelReason ? 'cancelled: ' + x.cancelReason : null].filter(Boolean).join(' · ') }),
      ]);
      if (x.consent && (x.status === 'accepted' || x.status === 'introduced')) {
        row.appendChild(el('div', { class: 'cl-consent-record' }, [
          el('strong', { text: 'Her written consent' }),
          el('span', { text: 'Shares: ' + ['zalo', 'phone', 'email'].filter(function (k) { return x.consent[k]; }).map(function (k) { return k + ' ' + x.consent[k]; }).join(' · ') }),
          el('span', { text: 'First contact: ' + (x.consent.contact || []).map(function (m) { return METHOD[m] || m; }).join(', ') }),
          el('span', { class: 'ad-card-sub', text: 'Typed name "' + x.consentTypedName + '" · ' + H.fmtDateTime(x.decidedAt) + ' · wording ' + x.consentVersion }),
        ]));
      }
      if (x.declineReason) row.appendChild(el('p', { class: 'cl-quote', text: 'Her private reason (never shown to him): ' + x.declineReason }));
      x.questions.forEach(function (q) {
        row.appendChild(el('div', { class: 'cl-question' }, [el('span', { class: 'ad-card-sub', text: 'Her question, ' + H.fmtDateTime(q.at) + (q.answeredAt ? ' · answered by ' + q.answeredBy : '') }), el('p', { lang: 'vi', text: q.message })]));
      });
      var acts = el('div', { class: 'ad-translate-row' });
      function op(name, done, confirmText) {
        var go = function () {
          H.api('admin-intro', { id: c.id, op: name, introId: x.id }).then(function (r) {
            H.flash(done);
            loadDetail(c.id, r.zalo ? function () {
              var o = $('cl-intro-out');
              if (o) { o.innerHTML = ''; o.appendChild(copyBox(r.zalo, (r.emailed ? 'Also emailed to her. ' : '') + 'Message for ' + x.name + ' (' + (r.lang === 'en' ? 'English' : 'Vietnamese') + ').')); o.scrollIntoView({ block: 'center' }); }
            } : null);
          }, function (e) { H.flash(e.message, true); });
        };
        return confirmText ? function () { modal(confirmText[0], confirmText[1], confirmText[2], go); } : go;
      }
      if (x.status === 'ready') {
        var why = c.status !== 'active' ? 'His engagement isn\'t active.' : x.otherOpen ? 'She has another request open.' : x.translationGaps.length ? 'Translations missing: ' + x.translationGaps.join(', ') : '';
        acts.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Send to her (R13)', disabled: !!why, onclick: op('send', 'Request sent. Copy the message into Zalo.', ['Send this request to ' + x.name + '?', 'This makes her private decision link (valid 30 days), emails her if she has an email, and gives you the message to paste into Zalo.', 'Send to her']) }));
        if (why) acts.appendChild(el('span', { text: why }));
      }
      if (x.status === 'sent' || x.status === 'opened') acts.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'New link and message', onclick: op('resend', 'New link made; the old one no longer works.') }));
      if ((x.status === 'sent' || x.status === 'opened') && x.reminderSentAt) acts.appendChild(el('button', { type: 'button', class: (x.hasEmail ? 'btn btn--secondary' : 'btn btn--primary') + ' btn--sm', text: x.hasEmail ? 'Reminder emailed · copy for Zalo too' : 'Copy 14-day reminder for Zalo', onclick: op('reminder', 'Reminder ready to copy.') }));
      if (x.status === 'accepted') acts.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Introduce (R15 to him, R16 to her)', onclick: op('introduce', 'Introduced. Copy her message into Zalo.', ['Introduce them?', 'He receives R15 with the details she chose. She receives R16 with his email and phone, and you get the message to paste into Zalo.', 'Introduce']) }));
      if (['queued', 'ready', 'sent', 'opened'].indexOf(x.status) !== -1) acts.appendChild(el('button', { type: 'button', class: 'ad-link', text: 'Cancel request', onclick: op('cancel', 'Request cancelled.', ['Cancel this request?', 'He will see "No longer available". Her link stops working.', 'Cancel request']) }));
      if (x.questions.some(function (q) { return !q.answeredAt; })) acts.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Mark question answered', onclick: op('answered', 'Marked answered.') }));
      if (acts.firstChild) row.appendChild(acts);
      sec.appendChild(row);
    });
    sec.appendChild(out);
    return sec;
  }

  // ------------------------------------------------------------------ phase 4: engagement, closing, feedback
  function engagementSection(c, d) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Engagement' })]);
    var KIND = { success: 'Relationship success (R19 and honour invoice)', completed: '12 months complete (R20)', closed: 'Closed' };
    sec.appendChild(dl([
      ['Started', H.fmtDate(c.engagement_starts_at)],
      ['12 months', H.fmtDate(c.engagement_ends_at) + (c.engagement_flagged_at ? ' · reached' : '')],
      c.status === 'paused' ? ['Paused', H.fmtDateTime(c.paused_at) + ' (new requests blocked)'] : null,
      c.status === 'closed' ? ['Closed', H.fmtDateTime(c.closed_at) + ' by ' + c.closed_by + ' · ' + (KIND[c.closed_kind] || '')] : null,
      c.status === 'closed' ? ['Documents', c.documents_deleted_at ? 'Deleted ' + H.fmtDate(c.documents_deleted_at) : 'Will be deleted on ' + H.fmtDate(c.documents_delete_after)] : null,
      c.checkin_sent_at ? ['3-month check-in (R18)', H.fmtDate(c.checkin_sent_at)] : null,
    ]));
    if (c.engagement_flagged_at && c.status !== 'closed') sec.appendChild(el('p', { class: 'ad-preview-no', text: 'His 12 months are up. Choose how to close: 12 months complete, relationship success, or close.' }));
    var acts = el('div', { class: 'ad-actions' });
    var first = c.full_name.split(' ')[0];
    if (c.status === 'active') acts.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Pause (after a concern)', onclick: function () {
      modal('Pause ' + first + '\'s engagement?', 'No new requests can be sent for him and his page shows "paused". Requests already with a woman stay open, but "Introduce" waits until you unpause.', 'Pause', function () { act(c.id, 'pause', 'Paused.'); }, true);
    } }));
    if (c.status === 'paused') acts.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md', text: 'Unpause', onclick: function () { act(c.id, 'unpause', 'Unpaused.'); } }));
    if (['active', 'paused'].indexOf(c.status) !== -1) {
      var amount = el('input', { class: 'form-input', type: 'number', min: 1, step: '0.01', value: (d.honourFeeCents / 100).toFixed(2), id: 'cl-honour', 'aria-label': 'Honour payment amount (USD)' });
      acts.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md', text: 'Relationship success…', onclick: function () {
        modal('Relationship success?', [el('p', { text: 'Only if they have told you so. He receives R19, congratulations, with the honour-payment invoice attached. His engagement closes, any pending requests are cancelled, he is asked for feedback (R21), and his documents are deleted in ' + d.retentionMonths + ' months.' }),
          el('label', { class: 'form-label', for: 'cl-honour', text: 'Honour payment (USD)' }), amount], 'Send congratulations', function () { close(c, 'success', Math.round(Number(amount.value) * 100)); });
      } }));
      acts.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: '12 months complete…', onclick: function () {
        modal('Close as "12 months complete"?', 'He receives R20, confirming nothing more is owed. His engagement closes, pending requests are cancelled, he is asked for feedback (R21), and his documents are deleted in ' + d.retentionMonths + ' months.', 'Close and send R20', function () { close(c, 'completed'); });
      } }));
      acts.appendChild(el('button', { type: 'button', class: 'btn btn--danger btn--md', text: 'Close…', onclick: function () {
        modal('Close ' + first + '\'s engagement?', 'No closing email apart from the feedback request (R21). Pending requests are cancelled and his documents are deleted in ' + d.retentionMonths + ' months.', 'Close', function () { close(c, 'closed'); }, true);
      } }));
    }
    if (acts.firstChild) sec.appendChild(acts);
    d.feedback.forEach(function (f) {
      var PERM = { none: 'Do NOT publish', first_name: 'May publish with first name only', first_name_country: 'May publish with first name and country', anonymous: 'May publish anonymously' };
      sec.appendChild(el('div', { class: 'ad-answer' }, [
        el('span', { class: 'ad-q', text: 'Feedback, ' + H.fmtDate(f.created_at) + ' · ' + f.rating + ' of 5' }),
        f.comments ? el('span', { class: 'ad-a', text: f.comments }) : null,
        el('span', { class: 'ad-badge' + (f.publish_permission === 'none' ? ' ad-badge--danger' : ' ad-badge--ok'), text: PERM[f.publish_permission] + ' (' + f.permission_text_version + ')' }),
      ]));
    });
    d.concerns.forEach(function (x) {
      sec.appendChild(el('div', { class: 'ad-answer' }, [el('span', { class: 'ad-q', text: 'Concern linked to him, ' + H.fmtDate(x.created_at) + (x.handled_at ? ' · handled' : ' · OPEN') }), el('span', { class: 'ad-a', text: x.message })]));
    });
    return sec;
  }

  function close(c, kind, amountCents) {
    H.api('admin-client-close', { id: c.id, kind: kind, amountCents: amountCents }).then(function (r) {
      H.flash(r.emailed === false || r.feedbackEmailed === false ? 'Closed, but an email failed. Please check his email address.' : 'Closed.', r.emailed === false || r.feedbackEmailed === false);
      loadDetail(c.id);
    }, function (e) { H.flash(e.message, true); });
  }

  // ------------------------------------------------------------------ concerns
  function loadConcerns() {
    H.show('ad-client-detail');
    var box = $('ad-client-detail');
    box.innerHTML = '';
    box.appendChild(el('p', { text: 'Loading…' }));
    H.api('admin-concerns', { op: 'list' }).then(function (d) {
      box.innerHTML = '';
      box.appendChild(el('div', { class: 'ad-detail-head' }, [el('a', { class: 'ad-link', href: '#clients', text: '← All clients' })]));
      box.appendChild(el('h1', { text: 'Concerns' }));
      box.appendChild(el('p', { class: 'form-note', text: 'From the "Report a concern" form. Read each the same day. If it is about a client, link it to him and consider pausing his engagement from his page.' }));
      var ABOUT = { client: 'About a client', woman: 'About a candidate', heritage_union: 'About Heritage Union', other: 'Other' };
      var ROLE = { candidate: 'from a candidate', client: 'from a client', other: 'from someone else' };
      if (!d.concerns.length) box.appendChild(el('p', { class: 'ad-empty', text: 'No concerns reported.' }));
      d.concerns.forEach(function (x) {
        var sel = el('select', { class: 'form-input', 'aria-label': 'Link to a client' }, [el('option', { value: '', text: 'Link to a client…' })].concat(d.clients.map(function (cl) { var o = el('option', { value: cl.id, text: cl.name + ' (' + cl.status + ')' }); if (x.client_id === cl.id) o.selected = true; return o; })));
        sel.addEventListener('change', function () { H.api('admin-concerns', { op: 'link', concernId: x.id, clientId: sel.value || null }).then(function () { H.flash('Linked.'); }, function (e) { H.flash(e.message, true); }); });
        box.appendChild(el('section', { class: 'ad-section cl-concern' + (x.handled_at ? '' : ' is-open') }, [
          el('div', { class: 'ad-card-top' }, [el('strong', { text: ABOUT[x.about] + ', ' + ROLE[x.reporter_role] }), el('span', { class: 'ad-badge ' + (x.handled_at ? 'ad-badge--ok' : 'ad-badge--danger'), text: x.handled_at ? 'Handled by ' + x.handled_by : 'Open' })]),
          el('span', { class: 'ad-card-sub', text: 'R-' + x.id.slice(0, 8).toUpperCase() + ' · ' + H.fmtDateTime(x.created_at) + ' · ' + (x.lang === 'vi' ? 'Vietnamese' : 'English') }),
          x.subject_hint ? el('span', { class: 'ad-a', text: 'About: ' + x.subject_hint }) : null,
          el('p', { class: 'ad-a', lang: x.lang, text: x.message }),
          el('span', { class: 'ad-card-sub', text: 'Reporter: ' + ([x.reporter_name, x.reporter_contact].filter(Boolean).join(' · ') || 'no contact details given') }),
          el('div', { class: 'ad-translate-row' }, [sel, x.handled_at ? null : el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Mark handled', onclick: function () { H.api('admin-concerns', { op: 'handled', concernId: x.id }).then(function () { loadConcerns(); }, function (e) { H.flash(e.message, true); }); } })]),
        ]));
      });
    }, function (e) { box.innerHTML = ''; box.appendChild(el('p', { class: 'ad-flash is-error', text: e.message })); });
  }

  // ------------------------------------------------------------------ matching screen
  var M = null;
  var picked = [];
  var onlyAll = false;
  var sortBy = 'date';
  var LABELS = { age: 'Ages', abroad: 'Living abroad', children: 'Children', education: 'Education', language: 'Shared language' };

  function loadMatching(id) {
    H.show('ad-client-detail');
    var box = $('ad-client-detail');
    box.innerHTML = '';
    box.appendChild(el('p', { text: 'Loading…' }));
    H.api('admin-matching', { id: id }).then(function (d) {
      M = d; M.id = id;
      picked = d.women.filter(function (w) { return w.shortlisted; }).map(function (w) { return w.id; });
      drawMatching();
    }, function (e) { box.innerHTML = ''; box.appendChild(el('p', { class: 'ad-flash is-error', text: e.message })); });
  }

  function drawMatching() {
    var box = $('ad-client-detail');
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'ad-detail-head' }, [el('a', { class: 'ad-link', href: '#client-' + M.id, text: '← Back to his page' })]));
    box.appendChild(el('h1', { text: 'Matching' }));
    var a = M.mustHaves;
    box.appendChild(el('p', { class: 'form-note', text: 'Only women whose profiles are complete, who consented to clients seeing their profile, and who haven\'t withdrawn. Ticks come from her own answers only. There are no scores.' }));
    var WL = { my_country: 'in his country', open_vietnam: 'open to Vietnam', open_elsewhere: 'open to elsewhere' };
    var CA = { none: 'none', one: 'up to one', any: 'any number' };
    var cap = function (x) { return String(x || '').charAt(0).toUpperCase() + String(x || '').slice(1); };
    box.appendChild(el('dl', { class: 'ad-dl cl-musts' }, [
      el('dt', { text: 'Her age' }), el('dd', { text: (a.her_age_range ? a.her_age_range.join('–') : '?') + ' (he is ' + (M.hisAge || '?') + ')' }),
      el('dt', { text: 'Where to live' }), el('dd', { text: WL[a.where_live] || '?' }),
      el('dt', { text: 'Children accepted' }), el('dd', { text: CA[a.children_accepted] || '?' }),
      el('dt', { text: 'Minimum education' }), el('dd', { text: cap(a.min_education || '?') }),
      el('dt', { text: 'Shared language' }), el('dd', { text: (a.must_languages || []).map(function (x) { return cap(x.language) + ' (at least ' + x.level + ')'; }).join(' or ') || 'No requirement' }),
    ]));
    if (!M.summaryApproved) box.appendChild(el('p', { class: 'ad-preview-banner', text: 'He hasn\'t approved his summary yet, so the shortlist can\'t be sent.' }));
    if (M.choicesSubmittedAt) box.appendChild(el('p', { class: 'ad-preview-banner', text: 'He has already sent his choices; the shortlist can\'t change.' }));
    var allBtn = el('button', { type: 'button', class: 'ad-filter', 'aria-pressed': onlyAll ? 'true' : 'false', text: 'Matches all', onclick: function () { onlyAll = !onlyAll; drawMatching(); } });
    var sortSel = el('select', { class: 'form-input', 'aria-label': 'Sort', style: 'max-width:260px' }, [el('option', { value: 'date', text: 'Sort: registration date' }), el('option', { value: 'ticks', text: 'Sort: number of ticks' })]);
    sortSel.value = sortBy;
    sortSel.addEventListener('change', function () { sortBy = sortSel.value; drawMatching(); });
    box.appendChild(el('div', { class: 'ad-toolbar' }, [el('div', { class: 'ad-filters' }, [allBtn]), sortSel]));
    var list = M.women.filter(function (w) { return !onlyAll || w.matchesAll; }).slice();
    if (sortBy === 'ticks') list.sort(function (x, y) { return y.ticks - x.ticks || (x.registeredAt < y.registeredAt ? -1 : 1); });
    box.appendChild(el('p', { class: 'form-note', text: list.length + ' of ' + M.women.length + ' women · ' + picked.length + ' of ' + M.max + ' selected' }));
    var grid = el('div', { class: 'ad-cards' });
    list.forEach(function (w) {
      var on = picked.indexOf(w.id) !== -1;
      var cb = el('input', { type: 'checkbox', id: 'pick-' + w.id, disabled: (!on && picked.length >= M.max) || !!M.choicesSubmittedAt });
      cb.checked = on;
      cb.addEventListener('change', function () { var k = picked.indexOf(w.id); if (k !== -1) picked.splice(k, 1); else if (picked.length < M.max) picked.push(w.id); drawMatching(); });
      var checks = el('ul', { class: 'cl-ticks' });
      Object.keys(LABELS).forEach(function (k) { var t = w.checks[k]; checks.appendChild(el('li', { class: t.ok ? 'is-ok' : 'is-no', title: t.detail }, [el('span', { 'aria-hidden': 'true', text: t.ok ? '✓' : '✗' }), ' ' + LABELS[k], el('span', { class: 'cl-tick-detail', text: ' — ' + t.detail })])); });
      grid.appendChild(el('div', { class: 'ad-card cl-match' + (on ? ' is-picked' : '') }, [
        el('label', { class: 'cl-match-top', for: 'pick-' + w.id }, [cb, el('span', { class: 'ad-card-name', lang: 'vi', text: w.displayName + ', ' + w.age }), el('span', { class: 'ad-card-sub', lang: 'vi', text: w.province || '' })]),
        el('span', { class: 'ad-card-sub', text: 'Registered ' + H.fmtDate(w.registeredAt) + ' · ' + w.ticks + ' of 5 ticks' + (w.matchesAll ? ' · matches all' : '') }),
        checks,
        el('div', { class: 'ad-badges' }, [
          el('span', { class: 'ad-badge' + (w.photoConsent ? ' ad-badge--ok' : ''), text: w.photoConsent ? w.photoCount + ' photo(s) shared' : 'No photos shared' }),
          w.needsTranslation.length ? el('a', { class: 'ad-badge ad-badge--warn', href: '#' + w.id, text: 'Needs English translation (' + w.needsTranslation.length + ')' }) : el('span', { class: 'ad-badge ad-badge--ok', text: 'Translated' }),
        ]),
      ]));
    });
    if (!list.length) grid.appendChild(el('p', { class: 'form-note', text: 'Nobody here.' }));
    box.appendChild(grid);
    var blocked = picked.some(function (id) { var w = M.women.filter(function (x) { return x.id === id; })[0]; return w && w.needsTranslation.length; });
    var send = el('button', { type: 'button', class: 'btn btn--primary btn--md', text: 'Send to client (' + picked.length + ')', disabled: !picked.length || !M.summaryApproved || !!M.choicesSubmittedAt || blocked });
    send.addEventListener('click', function () {
      modal('Send ' + picked.length + ' profiles to him?', 'He receives R11 with a private link (valid 30 days) to read them and choose up to 5. Any earlier list he hasn\'t chosen from is replaced.', 'Send to client', function () {
        H.api('admin-shortlist-send', { id: M.id, candidateIds: picked }).then(function (r) { H.flash(r.warning || 'Sent.', !!r.warning); location.hash = 'client-' + M.id; }, function (e) { H.flash(e.message, true); });
      });
    });
    box.appendChild(el('div', { class: 'cl-sendbar' }, [el('span', { text: blocked ? 'A selected woman needs her answers translated first.' : picked.length + ' selected' }), send]));
  }

  // ------------------------------------------------------------------ routing
  window.HUClients = {
    route: function (hash) {
      H = window.HUAdmin;
      if (hash === '#clients/concerns') { loadConcerns(); return; }
      var mm = /^#client-([0-9a-f-]{36})\/matching$/i.exec(hash);
      if (mm) { loadMatching(mm[1]); return; }
      var m = /^#client-([0-9a-f-]{36})$/i.exec(hash);
      if (m) loadDetail(m[1]); else loadList();
    },
  };
})();
