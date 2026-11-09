/* Heritage Union: the client's private page (/client#t=<token>).
 *
 * One page that shows whichever step he is on. The token is read from the
 * URL fragment, kept in sessionStorage and removed from the address bar.
 * Phase 1: application (F2), background declaration (F3), agreement, send,
 * then "received", invoice and welcome states.
 * Vanilla JS, no libraries.
 */
(function () {
  'use strict';

  var API = '/.netlify/functions/';
  var TOKEN_KEY = 'hu_client_token';
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ token
  function readToken() {
    var m = /(?:^#|&)t=([A-Za-z0-9_-]{43})(?:&|$)/.exec(window.location.hash || '');
    if (m) {
      try { sessionStorage.setItem(TOKEN_KEY, m[1]); } catch (e) {}
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
      return m[1];
    }
    try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  var token = readToken();
  // A new link opened in a tab already on /client only changes the
  // fragment; reload so the page picks up the new token.
  window.addEventListener('hashchange', function () {
    if (/(?:^#|&)t=[A-Za-z0-9_-]{43}/.test(window.location.hash)) window.location.reload();
  });

  // ------------------------------------------------------------------ state
  var FORM = null;
  var S = null;                  // server state
  var values = { application: {}, declaration: {} };
  var dirty = { application: {}, declaration: {} };
  var step = 1;
  var saving = null;
  var autosaveTimer = null;

  // ------------------------------------------------------------------ helpers
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'class') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function isEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0); }
  function fieldsFor(section) { return FORM.fields.filter(function (f) { return f.section === section; }); }
  function isShown(f, vals) {
    if (!f.showIf) return true;
    var v = vals[f.showIf.id];
    if (f.showIf.equals !== undefined) return v === f.showIf.equals;
    return typeof v === 'number' && v >= f.showIf.min;
  }
  function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''; }
  function money(cents, cur) { return (cur || 'USD') + ' ' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function api(name, body, raw) {
    return fetch(API + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ token: token }, body || {})),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    }).then(function (res) {
      if (raw && res.ok) return res;
      return res.json().catch(function () { return {}; }).then(function (d) {
        if (res.status === 401 || (res.status === 403 && d.code === 'notOpen')) {
          showMessage(d.code === 'notOpen' ? 'Not available yet' : 'This link no longer works', d.error);
          var e1 = new Error(d.error || ''); e1.fatal = true; throw e1;
        }
        if (!res.ok) { var e2 = new Error(d.error || 'Something went wrong. Please try again.'); e2.data = d; throw e2; }
        return d;
      });
    }, function () { throw new Error('We couldn\'t connect. Please check your connection and try again.'); });
  }

  function showMessage(title, text) {
    $('cl-loading').hidden = true;
    $('cl-app').hidden = true;
    $('cl-message').hidden = false;
    $('cl-message-title').textContent = title;
    $('cl-message-text').textContent = text || '';
  }

  function setSave(kind) {
    var s = document.querySelector('.cl-save');
    if (!s) return;
    s.className = 'cl-save' + (kind === 'saved' ? ' is-saved' : '');
    s.textContent = kind === 'saving' ? 'Saving…' : kind === 'saved' ? 'Saved' : kind === 'failed' ? 'Not saved yet' : '';
  }

  // ------------------------------------------------------------------ saving
  function save(section) {
    if (autosaveTimer) { clearTimeout(autosaveTimer); autosaveTimer = null; }
    var ids = Object.keys(dirty[section]);
    if (!ids.length) return Promise.resolve(true);
    if (saving) return saving.then(function () { return save(section); });
    var body = {};
    ids.forEach(function (id) { body[id] = isEmpty(values[section][id]) ? null : values[section][id]; });
    var sent = JSON.stringify(body);
    setSave('saving');
    saving = api('client-save', { section: section, answers: body }).then(function (d) {
      ids.forEach(function (id) { if (JSON.stringify(isEmpty(values[section][id]) ? null : values[section][id]) === JSON.stringify(body[id])) delete dirty[section][id]; });
      S = d;
      setSave('saved');
      return true;
    }, function (err) {
      if (err.fatal) return false;
      setSave('failed');
      if (err.data && err.data.field) fieldError(err.data.field, err.message);
      else formError(err.message + ' Your answers are still here.');
      return false;
    }).then(function (ok) { saving = null; void sent; return ok; });
    return saving;
  }

  function scheduleAutosave(section) {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () { save(section); }, 3000);
  }

  function setValue(section, id, v) {
    values[section][id] = v;
    dirty[section][id] = true;
    setSave('');
    fieldError(id, '');
  }

  // ------------------------------------------------------------------ validation
  function validateField(f, vals) {
    if (!isShown(f, vals)) return '';
    if (f.type === 'document') {
      var doc = S.documents[f.kind];
      return f.required && !doc ? 'Please upload this document.' : '';
    }
    var v = vals[f.id];
    if (isEmpty(v) || (typeof v === 'string' && !v.trim())) return f.required ? 'Please answer this question.' : '';
    if ((f.type === 'text' || f.type === 'textarea') && v.length > f.max) return 'This answer is too long.';
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please check this email address.';
    if (f.type === 'number' && !(Number.isInteger(v) && v >= f.min && v <= f.max)) return 'Please enter a number from ' + f.min + ' to ' + f.max + '.';
    if (f.id === 'date_of_birth') {
      var dob = new Date(v + 'T00:00:00Z'); var cut = new Date(); cut.setUTCFullYear(cut.getUTCFullYear() - 18);
      if (!(dob <= cut)) return 'You must be 18 or over to apply.';
    }
    if (f.id === 'certificate_issued_on') {
      var d = new Date(v + 'T00:00:00Z'); var lim = new Date(); lim.setUTCMonth(lim.getUTCMonth() - 6); lim.setUTCDate(lim.getUTCDate() - 1);
      if (d > new Date() || d < lim) return 'The certificate must have been issued within the last 6 months.';
    }
    if (f.type === 'languages' && !v.some(function (x) { return x.language && x.level; })) return 'Please add at least one language.';
    return '';
  }

  function fieldError(id, msg) {
    var box = document.querySelector('[data-f="' + id + '"]');
    if (!box) return;
    box.classList.toggle('has-error', !!msg);
    var e = box.querySelector('.cl-error');
    if (e) e.textContent = msg || '';
  }

  function validateSection(section) {
    var first = null;
    fieldsFor(section).forEach(function (f) {
      var m = validateField(f, values[section]);
      fieldError(f.id, m);
      if (m && !first) first = f.id;
    });
    if (first) {
      var box = document.querySelector('[data-f="' + first + '"]');
      if (box) {
        box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        var inp = box.querySelector('input, textarea, select, button');
        if (inp) inp.focus({ preventScroll: true });
      }
    }
    return !first;
  }

  function formError(msg) {
    var e = document.querySelector('.cl-form-error');
    if (e) e.textContent = msg || '';
  }

  // ------------------------------------------------------------------ field rendering
  function fieldBox(f, section, control) {
    var lid = 'f-' + f.id + '-label';
    var labelTag = (f.type === 'single' || f.type === 'languages' || f.type === 'document') ? 'span' : 'label';
    return el('div', { class: 'cl-field', 'data-f': f.id, hidden: !isShown(f, values[section]) }, [
      el(labelTag, { class: 'cl-label', id: lid, for: labelTag === 'label' ? 'f-' + f.id : null }, [
        f.label, f.required ? el('span', { class: 'cl-req', 'aria-hidden': 'true', text: '*' }) : el('span', { class: 'cl-opt', text: '(optional)' }),
      ]),
      f.help ? el('p', { class: 'cl-help', id: 'f-' + f.id + '-help', text: f.help }) : null,
      control,
      el('p', { class: 'cl-error', 'aria-live': 'polite' }),
    ]);
  }

  function refreshShown(section) {
    fieldsFor(section).forEach(function (f) {
      var box = document.querySelector('[data-f="' + f.id + '"]');
      if (box) box.hidden = !isShown(f, values[section]);
      if (!isShown(f, values[section]) && !isEmpty(values[section][f.id])) setValue(section, f.id, null);
    });
  }

  function renderControl(f, section) {
    var v = values[section][f.id];
    var common = { id: 'f-' + f.id, 'aria-describedby': f.help ? 'f-' + f.id + '-help' : null, 'aria-required': f.required ? 'true' : null };
    if (f.type === 'text' || f.type === 'tel' || f.type === 'email' || f.type === 'date') {
      var input = el('input', Object.assign({ class: 'form-input', type: f.type, maxlength: f.max, autocomplete: f.autocomplete || 'off' }, common));
      input.value = v || '';
      if (f.type === 'date') input.max = new Date().toISOString().slice(0, 10);
      input.addEventListener(f.type === 'date' ? 'change' : 'input', function () { setValue(section, f.id, input.value); scheduleAutosave(section); });
      return input;
    }
    if (f.type === 'textarea') {
      var ta = el('textarea', Object.assign({ class: 'form-textarea', maxlength: f.max, rows: 4, autocomplete: f.autocomplete || 'off' }, common));
      ta.value = v || '';
      var counter = el('p', { class: 'cl-counter' });
      var count = function () { counter.textContent = ta.value.length + '/' + f.max; };
      ta.addEventListener('input', function () { setValue(section, f.id, ta.value); count(); scheduleAutosave(section); });
      count();
      return el('div', null, [ta, counter]);
    }
    if (f.type === 'number') {
      var num = el('input', Object.assign({ class: 'form-input cl-num', type: 'number', inputmode: 'numeric', min: f.min, max: f.max, step: 1 }, common));
      if (typeof v === 'number') num.value = v;
      num.addEventListener('input', function () {
        setValue(section, f.id, num.value === '' ? null : Number(num.value));
        refreshShown(section);
        scheduleAutosave(section);
      });
      return num;
    }
    if (f.type === 'single') {
      var group = el('div', { class: 'cl-chips', role: 'radiogroup', 'aria-labelledby': 'f-' + f.id + '-label' });
      var buttons = f.options.map(function (o) {
        var b = el('button', { type: 'button', class: 'cl-chip', role: 'radio', 'aria-checked': v === o.value ? 'true' : 'false', 'data-value': o.value, text: o.label });
        b.addEventListener('click', function () {
          setValue(section, f.id, o.value);
          buttons.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
          refreshShown(section);
          save(section);
        });
        return b;
      });
      buttons.forEach(function (b) { group.appendChild(b); });
      return group;
    }
    if (f.type === 'languages') return renderLanguages(f, section);
    if (f.type === 'document') return renderDocument(f);
    return null;
  }

  function renderLanguages(f, section) {
    var wrap = el('div', { class: 'cl-langs', role: 'group', 'aria-labelledby': 'f-' + f.id + '-label' });
    var list = (values[section][f.id] || []).slice();
    if (!list.length) list.push({ language: '', level: '' });
    function commit() {
      setValue(section, f.id, list.filter(function (x) { return x.language.trim() || x.level; }).map(function (x) { return { language: x.language.trim(), level: x.level }; }));
      scheduleAutosave(section);
    }
    function draw() {
      wrap.innerHTML = '';
      list.forEach(function (item, i) {
        var name = el('input', { class: 'form-input', type: 'text', maxlength: 40, placeholder: 'Language', 'aria-label': 'Language ' + (i + 1), id: i === 0 ? 'f-' + f.id : null });
        name.value = item.language;
        name.addEventListener('input', function () { item.language = name.value; commit(); });
        var level = el('select', { class: 'form-input', 'aria-label': 'Level for language ' + (i + 1) });
        level.appendChild(el('option', { value: '', text: 'Level…' }));
        f.levels.forEach(function (l) { var o = el('option', { value: l.value, text: l.label }); if (item.level === l.value) o.selected = true; level.appendChild(o); });
        level.addEventListener('change', function () { item.level = level.value; commit(); });
        var rm = el('button', { type: 'button', class: 'cl-icon-btn', 'aria-label': 'Remove language ' + (i + 1), text: '×', disabled: list.length === 1 });
        rm.addEventListener('click', function () { list.splice(i, 1); commit(); draw(); });
        wrap.appendChild(el('div', { class: 'cl-lang-row' }, [name, level, rm]));
      });
      if (list.length < f.max) wrap.appendChild(el('button', { type: 'button', class: 'cl-link-btn', text: '+ Add another language', onclick: function () { list.push({ language: '', level: '' }); draw(); } }));
    }
    draw();
    return wrap;
  }

  function renderDocument(f) {
    var doc = S.documents[f.kind];
    var status = el('p', { class: 'cl-doc-status', role: 'status', 'aria-live': 'polite',
      text: doc ? '✓ Uploaded (' + doc.name + ')' + (doc.checked ? ', checked by Heritage Union' : '') + '.' : 'No file uploaded yet.' });
    var input = el('input', { type: 'file', accept: '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png', 'aria-label': 'Upload ' + f.label.toLowerCase(), id: 'doc-' + f.kind });
    var label = el('span', { class: 'btn btn--secondary btn--md', 'aria-hidden': 'true', text: doc ? 'Replace file' : 'Choose file' });
    var box = el('div', { class: 'cl-doc' + (doc ? ' is-uploaded' : '') }, [status, el('div', { class: 'cl-file' }, [label, input])]);
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';
      if (file) uploadDocument(f, file, status, box);
    });
    return box;
  }

  function fileType(file) {
    if (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png') return file.type;
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    return { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }[ext] || '';
  }

  function uploadDocument(f, file, status, box) {
    var type = fileType(file);
    if (!type) { status.textContent = 'Please choose a PDF, JPEG or PNG file.'; return; }
    if (file.size > 10 * 1024 * 1024) { status.textContent = 'That file is larger than 10 MB. Please choose a smaller file or a lower-resolution scan.'; return; }
    status.textContent = 'Uploading… 0%';
    var path;
    api('client-doc-upload-url', { kind: f.kind, type: type }).then(function (r) {
      path = r.path;
      return new Promise(function (resolve, reject) {
        var x = new XMLHttpRequest();
        x.open('PUT', r.signedUrl);
        x.setRequestHeader('Content-Type', type);
        x.setRequestHeader('x-upsert', 'false');
        x.upload.onprogress = function (e) { if (e.lengthComputable) status.textContent = 'Uploading… ' + Math.round((e.loaded / e.total) * 100) + '%'; };
        x.onload = function () { x.status >= 200 && x.status < 300 ? resolve() : reject(new Error('The upload didn\'t complete. Please try again.')); };
        x.onerror = function () { reject(new Error('The upload didn\'t complete. Please check your connection and try again.')); };
        x.send(file);
      });
    }).then(function () {
      status.textContent = 'Checking the file…';
      return api('client-doc-confirm', { kind: f.kind, path: path });
    }).then(function (d) {
      S = d;
      box.classList.add('is-uploaded');
      status.textContent = '✓ Uploaded (' + d.documents[f.kind].name + ').';
      box.querySelector('.btn').textContent = 'Replace file';
      fieldError(f.id, '');
    }, function (err) {
      if (!err.fatal) status.textContent = err.message;
    });
  }

  // ------------------------------------------------------------------ steps
  var STEP_SECTIONS = { 1: 'application', 2: 'declaration' };

  function stepRail() {
    var ol = el('ol', { class: 'cl-steps', 'aria-label': 'Application steps' });
    FORM.sections.forEach(function (s) {
      var done = stepDone(s.step);
      var li = el('li', { class: (s.step === step ? 'is-current' : '') + (done && s.step !== step ? ' is-done' : '') }, [
        el('button', { type: 'button', 'aria-current': s.step === step ? 'step' : null, text: s.title, onclick: function () { leaveTo(s.step); } }),
      ]);
      ol.appendChild(li);
    });
    return ol;
  }

  function stepDone(n) {
    if (n === 1) return fieldsFor('application').every(function (f) { return !validateField(f, values.application); });
    if (n === 2) return fieldsFor('declaration').every(function (f) { return !validateField(f, values.declaration); }) && S.declarationSigned;
    if (n === 3) return !!S.agreement.acceptedVersion && S.agreement.acceptedVersion === S.agreement.version;
    return false;
  }

  function firstOpenStep() {
    for (var n = 1; n <= 3; n++) if (!stepDone(n)) return n;
    return 4;
  }

  function leaveTo(n) {
    var sec = STEP_SECTIONS[step];
    (sec ? save(sec) : Promise.resolve()).then(function () { goTo(n); });
  }

  function goTo(n) {
    step = n;
    var view = $('cl-view');
    view.innerHTML = '';
    var section = FORM.sections[n - 1];
    var card = el('section', { class: 'cl-card cl-card--accent', 'aria-labelledby': 'cl-step-title' }, [
      el('div', { class: 'cl-stepline' }, [el('span', { text: 'Step ' + n + ' of 4' }), el('span', { class: 'cl-save', role: 'status', 'aria-live': 'polite' })]),
      stepRail(),
      el('h2', { id: 'cl-step-title', tabindex: '-1', text: section.title }),
      el('p', { class: 'cl-intro', text: section.intro }),
    ]);
    if (n === 1 || n === 2) {
      var sec = STEP_SECTIONS[n];
      fieldsFor(sec).forEach(function (f) { card.appendChild(fieldBox(f, sec, renderControl(f, sec))); });
      if (n === 2) card.appendChild(signatureBlock());
    } else if (n === 3) {
      agreementStep(card);
    } else {
      reviewStep(card);
    }
    card.appendChild(el('p', { class: 'cl-form-error', role: 'alert' }));
    card.appendChild(navButtons(n));
    view.appendChild(card);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    var t = $('cl-step-title');
    if (t) t.focus({ preventScroll: true });
  }

  function navButtons(n) {
    var nav = el('div', { class: 'cl-nav' });
    if (n > 1) nav.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Back', onclick: function () { leaveTo(n - 1); } }));
    if (n < 4) {
      nav.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md', id: 'cl-next', text: 'Save and continue', onclick: function () { next(n); } }));
    } else {
      nav.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md', id: 'cl-send', text: 'Send my application', onclick: submit }));
    }
    return nav;
  }

  function next(n) {
    formError('');
    var sec = STEP_SECTIONS[n];
    if (sec && !validateSection(sec)) { formError('Please check the questions marked above.'); return; }
    if (n === 2 && !S.declarationSigned) { formError('Please sign the declaration at the bottom of this page.'); return; }
    if (n === 3 && !stepDone(3) && !S.agreement.draft) { formError('Please read and accept the agreement.'); return; }
    var btn = $('cl-next');
    btn.disabled = true;
    (sec ? save(sec) : Promise.resolve(true)).then(function (ok) {
      btn.disabled = false;
      if (ok !== false) goTo(n + 1);
    });
  }

  // ---- declaration signature
  function signatureBlock() {
    var box = el('div', { class: 'cl-sign', 'data-f': 'declaration_signature' });
    function draw() {
      box.innerHTML = '';
      box.appendChild(el('h3', { text: 'Your declaration' }));
      box.appendChild(el('p', { class: 'cl-sign-text', text: '“' + FORM.declarationText + '”' }));
      if (S.declarationSigned) {
        box.appendChild(el('p', { class: 'cl-signed', text: '✓ Signed by ' + S.declarationTypedName + '. If you change an answer above, you will be asked to sign again.' }));
        return;
      }
      var cb = el('input', { type: 'checkbox', id: 'decl-agree' });
      var name = el('input', { class: 'form-input cl-typed', type: 'text', id: 'decl-name', autocomplete: 'name', maxlength: 120, placeholder: 'Type your full legal name' });
      var err = el('p', { class: 'cl-error', role: 'alert' });
      var btn = el('button', { type: 'button', class: 'btn btn--primary btn--md cl-action', text: 'Sign my declaration' });
      btn.addEventListener('click', function () {
        err.textContent = '';
        if (!validateSection('declaration')) { err.textContent = 'Please answer every question above first.'; return; }
        if (!cb.checked) { err.textContent = 'Please tick the box to confirm.'; return; }
        btn.disabled = true;
        save('declaration').then(function (ok) {
          if (!ok) throw new Error('Your answers couldn\'t be saved. Please try again.');
          return api('client-sign', { what: 'declaration', agreed: true, typedName: name.value });
        }).then(function (d) { S = d; draw(); }, function (e) { if (!e.fatal) err.textContent = e.message; }).then(function () { btn.disabled = false; });
      });
      box.appendChild(el('label', { class: 'cl-check', for: 'decl-agree' }, [cb, el('span', { text: 'I confirm the declaration above.' })]));
      box.appendChild(el('label', { class: 'cl-label', for: 'decl-name', text: 'Type your full legal name to sign' }));
      box.appendChild(name);
      box.appendChild(err);
      box.appendChild(btn);
    }
    draw();
    // Editing an answer after signing clears the signature on the server;
    // reflect that here once the save comes back.
    return box;
  }

  // ---- agreement
  function agreementStep(card) {
    var holder = el('div', { class: 'cl-agreement-box', tabindex: '0', 'aria-label': 'Client agreement' }, [el('p', { text: 'Loading the agreement…' })]);
    card.appendChild(holder);
    var controls = el('div', { class: 'cl-sign' });
    card.appendChild(controls);
    fetch('/assets/data/client-agreement.html', { credentials: 'omit' }).then(function (r) { return r.text(); }).then(function (html) {
      holder.innerHTML = html;
    }, function () { holder.textContent = 'The agreement could not be loaded. Please reload the page.'; });

    if (S.agreement.draft) {
      controls.className = 'cl-soon';
      controls.appendChild(el('p', { html: '<strong>Coming soon.</strong> Our client agreement is being finalised by our legal adviser. You can complete everything else now; we will let you know as soon as the agreement is ready to accept.' }));
      return;
    }
    if (S.agreement.acceptedVersion === S.agreement.version) {
      controls.appendChild(el('p', { class: 'cl-signed', text: '✓ Accepted on ' + fmtDate(S.agreement.acceptedAt) + '.' }));
      return;
    }
    var cb = el('input', { type: 'checkbox', id: 'agr-agree' });
    var name = el('input', { class: 'form-input cl-typed', type: 'text', id: 'agr-name', autocomplete: 'name', maxlength: 120, placeholder: 'Type your full legal name' });
    var err = el('p', { class: 'cl-error', role: 'alert' });
    var btn = el('button', { type: 'button', class: 'btn btn--primary btn--md cl-action', text: 'Accept the agreement' });
    btn.addEventListener('click', function () {
      err.textContent = '';
      if (!cb.checked) { err.textContent = 'Please tick the box to confirm.'; return; }
      btn.disabled = true;
      api('client-sign', { what: 'agreement', agreed: true, typedName: name.value, version: S.agreement.version }).then(function (d) { S = d; goTo(3); }, function (e) { if (!e.fatal) err.textContent = e.message; btn.disabled = false; });
    });
    controls.appendChild(el('label', { class: 'cl-check', for: 'agr-agree' }, [cb, el('span', { text: 'I have read and agree to the client agreement (version ' + S.agreement.version + ').' })]));
    controls.appendChild(el('label', { class: 'cl-label', for: 'agr-name', text: 'Type your full legal name' }));
    controls.appendChild(name);
    controls.appendChild(err);
    controls.appendChild(btn);
  }

  // ---- review
  function answerText(f, v) {
    if (isEmpty(v)) return null;
    if (f.type === 'single') { var o = f.options.filter(function (x) { return x.value === v; })[0]; return o ? o.label : v; }
    if (f.type === 'languages') return v.map(function (x) { var l = f.levels.filter(function (y) { return y.value === x.level; })[0]; return x.language + ' (' + (l ? l.label.toLowerCase() : x.level) + ')'; }).join(', ');
    if (f.type === 'date') return fmtDate(v + 'T00:00:00Z');
    return String(v);
  }

  function reviewStep(card) {
    [['application', 1], ['declaration', 2]].forEach(function (pair) {
      var sec = pair[0];
      var dl = el('dl');
      fieldsFor(sec).forEach(function (f) {
        if (!isShown(f, values[sec])) return;
        var txt = f.type === 'document' ? (S.documents[f.kind] ? '✓ Uploaded' : null) : answerText(f, values[sec][f.id]);
        dl.appendChild(el('dt', { text: f.label }));
        dl.appendChild(el('dd', { class: txt ? '' : 'cl-cross', text: txt || (f.required ? 'Missing' : '—') }));
      });
      card.appendChild(el('div', { class: 'cl-review' }, [
        el('div', { class: 'cl-review-head' }, [el('h3', { text: FORM.sections[pair[1] - 1].title }), el('button', { type: 'button', class: 'cl-link-btn', text: 'Edit', 'aria-label': 'Edit ' + FORM.sections[pair[1] - 1].title, onclick: function () { goTo(pair[1]); } })]),
        dl,
      ]));
    });
    var checks = el('ul', { class: 'cl-timeline' }, [
      el('li', { class: S.declarationSigned ? 'is-done' : '' }, [el('div', null, [el('strong', { text: 'Background declaration' }), el('span', { text: S.declarationSigned ? 'Signed' : 'Not signed yet' })])]),
      el('li', { class: stepDone(3) ? 'is-done' : '' }, [el('div', null, [el('strong', { text: 'Client agreement' }), el('span', { text: S.agreement.draft ? 'Coming soon: the agreement is being finalised' : stepDone(3) ? 'Accepted' : 'Not accepted yet' })])]),
    ]);
    card.appendChild(checks);
    if (S.agreement.draft) card.appendChild(el('p', { class: 'cl-soon', text: 'You will be able to send your application as soon as the client agreement is ready. Everything you have entered is saved.' }));
  }

  function submit() {
    formError('');
    var open = firstOpenStep();
    if (S.agreement.draft) { formError('The client agreement isn\'t ready yet, so applications can\'t be sent today. Everything you have entered is saved.'); return; }
    if (open < 4) { goTo(open); formError('Please complete this step first.'); return; }
    var btn = $('cl-send');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    api('client-submit').then(function (d) { S = d; render(); }, function (err) {
      if (err.fatal) return;
      if (err.data && err.data.step) { goTo(err.data.step); if (err.data.field) fieldError(err.data.field, err.message); }
      formError(err.message);
      btn.disabled = false;
      btn.textContent = 'Send my application';
    });
  }

  // ------------------------------------------------------------------ after sending
  function statusView() {
    var view = $('cl-view');
    view.innerHTML = '';
    var st = S.status;
    var steps = [
      { t: 'Application received', d: S.submittedAt ? fmtDate(S.submittedAt) : '', done: true },
      { t: 'Documents checked', d: (S.documents.id && S.documents.id.checked && S.documents.certificate && S.documents.certificate.checked) ? 'Your photo ID and certificate are in order' : 'We check them within 3 working days', done: ['checked', 'invoiced', 'active', 'paused'].indexOf(st) !== -1 },
      { t: 'Invoice', d: st === 'invoiced' ? 'Sent to your email' : st === 'active' || st === 'paused' ? 'Paid, thank you' : 'Sent once your documents are checked', done: ['active', 'paused'].indexOf(st) !== -1, now: st === 'invoiced' },
      { t: 'Your profile', d: st === 'active' ? 'Coming next' : 'After payment', now: st === 'active' },
    ];
    var tl = el('ol', { class: 'cl-timeline', 'aria-label': 'Progress' });
    steps.forEach(function (s, i) {
      var now = s.now || (!s.done && (i === 0 || steps[i - 1].done) && !steps.some(function (x) { return x.now; }));
      tl.appendChild(el('li', { class: s.done ? 'is-done' : now ? 'is-now' : '' }, [el('div', null, [el('strong', { text: s.t }), el('span', { text: s.d })])]));
    });
    var card = el('section', { class: 'cl-card cl-card--accent' }, [el('h2', { text: 'Where things stand' }), tl]);
    view.appendChild(card);

    var invs = (S.invoices || []).filter(function (i) { return i.status === 'sent' || i.status === 'paid'; });
    if (invs.length) {
      var ic = el('section', { class: 'cl-card' }, [el('h2', { text: invs.length > 1 ? 'Your invoices' : 'Your invoice' })]);
      invs.forEach(function (i) {
        var b = el('button', { type: 'button', class: 'btn btn--secondary btn--md cl-action', text: 'Download PDF' });
        b.addEventListener('click', function () { downloadInvoice(i, b); });
        ic.appendChild(el('div', { class: 'cl-invoice' }, [
          el('strong', { text: 'Invoice ' + i.number }),
          el('span', { text: i.description }),
          el('span', { class: 'cl-invoice-amount', text: money(i.amountCents, i.currency) }),
          el('span', { text: i.status === 'paid' ? '✓ Paid ' + fmtDate(i.paidAt) : 'Payable by bank transfer. The payment details are in your invoice email and on the PDF.' }),
          b,
        ]));
      });
      ic.appendChild(el('p', { class: 'form-note', text: 'Heritage Union will only ever ask you to pay by bank transfer to the account on your invoice. If you receive any other request for payment, please do not pay and tell us at once.' }));
      view.appendChild(ic);
    }
  }

  function downloadInvoice(inv, btn) {
    btn.disabled = true;
    api('client-invoice-pdf', { invoiceId: inv.id }, true).then(function (res) { return res.blob(); }).then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = inv.number + '.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, function () {}).then(function () { btn.disabled = false; });
  }

  // ------------------------------------------------------------------ start
  var LEADS = {
    invited: 'Thank you for applying to Heritage Union. There are four short steps. Everything saves as you go, so you can stop and come back with the same link.',
    applying: 'Welcome back. Everything you have entered so far is saved.',
    submitted: 'Thank you. Your application has reached us, and we will be in touch within 3 working days.',
    checked: 'Your documents are in order. Your invoice will follow shortly by email.',
    invoiced: 'Your invoice has been sent to your email. Once payment arrives, you will begin your profile.',
    active: 'Welcome to Heritage Union.',
    paused: 'Your engagement is paused for the moment. James will be in touch with you directly.',
  };

  function render() {
    $('cl-loading').hidden = true;
    $('cl-app').hidden = false;
    $('cl-hello').textContent = (S.status === 'invited' ? 'Welcome, ' : S.status === 'applying' ? 'Welcome back, ' : 'Hello, ') + S.firstName;
    $('cl-lead').textContent = LEADS[S.status] || '';
    $('cl-eyebrow').textContent = ['active', 'paused'].indexOf(S.status) !== -1 ? 'Your engagement' : 'Your application';
    if (S.status === 'invited' || S.status === 'applying') {
      values.application = Object.assign({}, S.application);
      values.declaration = Object.assign({}, S.declaration);
      goTo(firstOpenStep());
    } else if ((S.status === 'active' || S.status === 'paused') && S.engagement && window.HUEngagement) {
      $('cl-view').innerHTML = '';
      window.HUEngagement.render(S);
    } else {
      statusView();
    }
  }

  // Shared with the engagement stages (assets/js/client-engagement.js).
  window.HUClient = {
    api: api, el: el, fmtDate: fmtDate, money: money, showMessage: showMessage,
    setState: function (d) { S = d; render(); },
    view: function () { return $('cl-view'); },
    lead: function (t) { $('cl-lead').textContent = t; },
    token: function () { return token; },
    reduceMotion: reduceMotion,
  };

  function start() {
    if (!token) { showMessage('This page isn\'t available', 'This page opens only with the private link Heritage Union emailed to you. If you need a new one, simply reply to any email from us, or write to team@heritage-union.com.'); return; }
    Promise.all([
      fetch('/assets/data/client-application.json', { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(); return r.json(); }),
      api('client-get'),
    ]).then(function (r) {
      FORM = r[0];
      S = r[1];
      render();
    }, function (err) {
      if (err && err.fatal) return;
      showMessage('We couldn\'t open your page', 'Please check your connection and reload the page.');
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'hidden' || !token || !navigator.sendBeacon) return;
    ['application', 'declaration'].forEach(function (sec) {
      var ids = Object.keys(dirty[sec]);
      if (!ids.length) return;
      var body = {};
      ids.forEach(function (id) { body[id] = isEmpty(values[sec][id]) ? null : values[sec][id]; });
      try { navigator.sendBeacon(API + 'client-save', new Blob([JSON.stringify({ token: token, section: sec, answers: body })], { type: 'application/json' })); } catch (e) {}
    });
  });

  start();
})();
