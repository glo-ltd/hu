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
    enquiry: 'Enquiry received', enquiry_again: 'Wrote again through the enquiry form', fee_document_sent: 'Fee document sent (R2)',
    call_booked: 'Call booked', call_held: 'Call held', thinking: 'Thinking it over', invite: 'Invited to apply (R3)', not_a_fit: 'Not the right fit (R4)',
    resend_link: 'New private link sent (R5)', application_started: 'Started his application', id_uploaded: 'Uploaded photo ID',
    certificate_uploaded: 'Uploaded criminal record certificate', declaration_signed: 'Signed background declaration', agreement_accepted: 'Accepted client agreement',
    application_submitted: 'Sent his application (R6)', check_id: 'Photo ID checked', check_certificate: 'Certificate checked',
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
    box.appendChild(el('div', { class: 'ad-toolbar' }, [filters, search]));
    box.appendChild(el('p', { id: 'cl-count', class: 'form-note' }));
    box.appendChild(el('div', { id: 'cl-cards', class: 'ad-cards' }));
    box.appendChild(el('details', { class: 'ad-section cl-general', id: 'cl-general' }));
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
    if (c.status === 'active' && c.engagement_ends_at) badges.push(el('span', { class: 'ad-badge ad-badge--ok', text: 'Until ' + H.fmtDate(c.engagement_ends_at) }));
    return el('button', { type: 'button', class: 'ad-card', onclick: function () { location.hash = 'client-' + c.id; } }, [
      el('div', { class: 'ad-card-top' }, [el('span', { class: 'ad-card-name', text: c.full_name }), el('span', { class: 'ad-card-sub', text: 'Enquired ' + H.fmtDate(c.created_at) })]),
      el('span', { class: 'ad-card-sub', text: [c.country, c.age ? 'age ' + c.age : null].filter(Boolean).join(' · ') }),
      el('span', { class: 'ad-card-sub', text: (STATUS[c.status] || c.status) + ' for ' + days + ' day' + (days === 1 ? '' : 's') }),
      el('div', { class: 'ad-badges' }, badges),
    ]);
  }

  // ------------------------------------------------------------------ detail
  function loadDetail(id) {
    H.show('ad-client-detail');
    var box = $('ad-client-detail');
    box.innerHTML = '';
    box.appendChild(el('p', { text: 'Loading…' }));
    H.api('admin-client-get', { id: id }).then(function (d) { drawDetail(d); }, function (err) {
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

  // ------------------------------------------------------------------ routing
  window.HUClients = {
    route: function (hash) {
      H = window.HUAdmin;
      var m = /^#client-([0-9a-f-]{36})$/i.exec(hash);
      if (m) loadDetail(m[1]); else loadList();
    },
  };
})();
