/* Heritage Union: his private page after payment (phase 2).
 *   F4 his profile (6 steps, autosaving)  ->  waiting for James's summary
 *   -> approve the summary (or ask for changes)  ->  "profiles within 2-4 weeks"
 *   -> F5 review up to 20 profiles, choose up to 5 in order  ->  choices sent.
 * Uses the helpers client.js exposes on window.HUClient.
 */
(function () {
  'use strict';

  var H = null;
  var S = null;           // whole page state from client-get
  var E = null;           // S.engagement
  var PQ = null;          // client-profile-questions.json
  var answers = {};
  var dirty = {};
  var photos = [];
  var step = 1;
  var saving = null;
  var timer = null;

  function el() { return H.el.apply(null, arguments); }
  function isEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0); }
  function card(cls, children) { return el('section', { class: 'cl-card' + (cls ? ' ' + cls : '') }, children); }
  function view() { return H.view(); }
  function scrollTop() { window.scrollTo({ top: 0, behavior: H.reduceMotion ? 'auto' : 'smooth' }); }

  // ------------------------------------------------------------------ entry
  function render(state) {
    H = window.HUClient;
    S = state;
    E = state.engagement;
    var v = view();
    v.innerHTML = '';
    if (E.paused) {
      H.lead('Your engagement is paused for the moment. James will be in touch with you directly.');
      v.appendChild(card('cl-card--accent', [el('h2', { text: 'Paused' }), el('p', { text: 'Nothing is needed from you right now. If you have any questions, simply reply to any email from James.' })]));
      return;
    }
    if (!E.profile.submittedAt) return startProfile();
    if (!E.summary && !E.summaryApprovedAt) {
      H.lead(E.changesRequestedAt ? 'Thank you for your comments. James is revising your summary.' : 'Thank you for your profile.');
      v.appendChild(progressCard(2));
      v.appendChild(card('', [el('h2', { text: E.changesRequestedAt ? 'Your summary is being revised' : 'James is writing your summary' }),
        el('p', { text: 'From your answers, James writes a short summary for the women you choose to read first. You will receive an email when it is ready for you to approve, usually within a few days.' })]));
      return;
    }
    if (E.summary && !E.summary.approvedAt) return summaryReview();
    if (!E.shortlistSentAt) {
      H.lead('Your profile is approved. Thank you.');
      v.appendChild(progressCard(3));
      v.appendChild(card('', [el('h2', { text: 'Your profiles are being prepared' }),
        el('p', { text: 'James is looking for women whose own answers meet your must-haves, and who have chosen to let clients see their profiles. Your profiles will be ready within 2–4 weeks; you will receive an email as soon as they are.' })]));
      return;
    }
    return review();
  }

  function progressCard(n) {
    var steps = ['Your profile', 'Your summary', 'Approved', 'Your profiles', 'Your choices'];
    var ol = el('ol', { class: 'cl-timeline', 'aria-label': 'Progress' });
    steps.forEach(function (s, i) { ol.appendChild(el('li', { class: i < n ? 'is-done' : i === n ? 'is-now' : '' }, [el('div', null, [el('strong', { text: s })])])); });
    return card('cl-card--accent', [el('h2', { text: 'Where things stand' }), ol]);
  }

  // ------------------------------------------------------------------ F4
  function startProfile() {
    H.lead(E.profile.submittedAt ? '' : 'Your next step is your profile. It takes about 20 minutes and saves as you go.');
    fetch('/assets/data/client-profile-questions.json', { credentials: 'omit' }).then(function (r) { return r.json(); }).then(function (q) {
      PQ = q;
      answers = Object.assign({}, E.profile.answers || {});
      if (E.profile.displayName) answers.display_name = E.profile.displayName;
      if (E.profile.message) answers.message = E.profile.message;
      photos = E.profile.photos || [];
      // Prefill from his application (saved when he first continues).
      var pre = E.profile.prefill || {};
      Object.keys(pre).forEach(function (k) { if (isEmpty(answers[k]) && !isEmpty(pre[k])) { answers[k] = pre[k]; dirty[k] = true; } });
      step = firstOpenStep();
      draw();
    });
  }

  function qs(n) { return PQ.questions.filter(function (q) { return q.step === n; }); }
  function shown(q) {
    if (!q.showIf) return true;
    var v = answers[q.showIf.id];
    return typeof v === 'number' && v >= q.showIf.min;
  }
  function validate(q) {
    if (!shown(q)) return '';
    var v = answers[q.id];
    if (isEmpty(v) || (typeof v === 'string' && !v.trim())) return q.required ? (q.type === 'multi' ? 'Please choose at least one.' : 'Please answer this question.') : '';
    if ((q.type === 'text' || q.type === 'textarea') && v.length > q.max) return 'This answer is too long.';
    if (q.type === 'number' && !(Number.isInteger(v) && v >= q.min && v <= q.max)) return 'Please enter a number from ' + q.min + ' to ' + q.max + '.';
    if (q.type === 'range' && !(Array.isArray(v) && v[0] >= q.min && v[1] <= q.max && v[0] <= v[1])) return 'Please give an age range from ' + q.min + ' to ' + q.max + ', the first number no larger than the second.';
    if ((q.type === 'languages' || q.type === 'langreq') && v.some(function (x) { return !x.language || !x.level || (x.language === 'other' && !String(x.other || '').trim()); })) return 'Please choose a language and a level for each line, or remove the line.';
    return '';
  }
  function stepDone(n) {
    if (n === 5) return photos.length >= PQ.photos.min;
    return qs(n).every(function (q) { return !validate(q); });
  }
  function firstOpenStep() { for (var n = 1; n <= 5; n++) if (!stepDone(n)) return n; return 6; }

  function setAnswer(id, v) { answers[id] = v; dirty[id] = true; status(''); err(id, ''); }
  function status(kind) {
    var s = document.querySelector('.cl-save');
    if (!s) return;
    s.className = 'cl-save' + (kind === 'saved' ? ' is-saved' : '');
    s.textContent = kind === 'saving' ? 'Saving…' : kind === 'saved' ? 'Saved' : kind === 'failed' ? 'Not saved yet' : '';
  }
  function err(id, m) {
    var box = document.querySelector('[data-f="' + id + '"]');
    if (!box) return;
    box.classList.toggle('has-error', !!m);
    var e = box.querySelector('.cl-error');
    if (e) e.textContent = m || '';
  }
  function formError(m) { var e = document.querySelector('.cl-form-error'); if (e) e.textContent = m || ''; }

  function save() {
    if (timer) { clearTimeout(timer); timer = null; }
    var ids = Object.keys(dirty).filter(function (id) { var q = PQ.questions.filter(function (x) { return x.id === id; })[0]; return q && q.step <= Math.max(step, 1); });
    if (!ids.length) return Promise.resolve(true);
    if (saving) return saving.then(save);
    var body = {};
    ids.forEach(function (id) { body[id] = isEmpty(answers[id]) ? null : answers[id]; });
    status('saving');
    saving = H.api('client-profile-save', { answers: body }).then(function () {
      ids.forEach(function (id) { if (JSON.stringify(isEmpty(answers[id]) ? null : answers[id]) === JSON.stringify(body[id])) delete dirty[id]; });
      status('saved');
      return true;
    }, function (e) {
      if (e.fatal) return false;
      status('failed');
      if (e.data && e.data.field) err(e.data.field, e.message); else formError(e.message + ' Your answers are still here.');
      return false;
    }).then(function (ok) { saving = null; return ok; });
    return saving;
  }
  function later() { if (timer) clearTimeout(timer); timer = setTimeout(save, 3000); }

  function fieldBox(q, control) {
    var labelTag = ['single', 'multi', 'range', 'languages', 'langreq'].indexOf(q.type) !== -1 ? 'span' : 'label';
    return el('div', { class: 'cl-field', 'data-f': q.id, hidden: !shown(q) }, [
      el(labelTag, { class: 'cl-label', id: 'q-' + q.id + '-label', for: labelTag === 'label' ? 'q-' + q.id : null }, [q.label, q.required ? el('span', { class: 'cl-req', 'aria-hidden': 'true', text: '*' }) : el('span', { class: 'cl-opt', text: '(optional)' })]),
      q.help ? el('p', { class: 'cl-help', text: q.help }) : null,
      control,
      el('p', { class: 'cl-error', 'aria-live': 'polite' }),
    ]);
  }

  function refreshShown() {
    qs(step).forEach(function (q) {
      var b = document.querySelector('[data-f="' + q.id + '"]');
      if (b) b.hidden = !shown(q);
      if (!shown(q) && !isEmpty(answers[q.id])) setAnswer(q.id, null);
    });
  }

  function control(q) {
    var v = answers[q.id];
    if (q.type === 'text') {
      var i = el('input', { class: 'form-input', type: 'text', id: 'q-' + q.id, maxlength: q.max });
      i.value = v || '';
      i.addEventListener('input', function () { setAnswer(q.id, i.value); later(); });
      return i;
    }
    if (q.type === 'textarea') {
      var t = el('textarea', { class: 'form-textarea', id: 'q-' + q.id, maxlength: q.max, rows: 5 });
      t.value = v || '';
      var c = el('p', { class: 'cl-counter' });
      var n = function () { c.textContent = t.value.length + '/' + q.max; };
      t.addEventListener('input', function () { setAnswer(q.id, t.value); n(); later(); });
      n();
      return el('div', null, [t, c]);
    }
    if (q.type === 'number') {
      var num = el('input', { class: 'form-input cl-num', type: 'number', id: 'q-' + q.id, inputmode: 'numeric', min: q.min, max: q.max });
      if (typeof v === 'number') num.value = v;
      num.addEventListener('input', function () { setAnswer(q.id, num.value === '' ? null : Number(num.value)); refreshShown(); later(); });
      return num;
    }
    if (q.type === 'range') {
      var r = v || [];
      var lo = el('input', { class: 'form-input cl-num', type: 'number', id: 'q-' + q.id, min: q.min, max: q.max, inputmode: 'numeric', 'aria-label': 'From (age)' });
      var hi = el('input', { class: 'form-input cl-num', type: 'number', min: q.min, max: q.max, inputmode: 'numeric', 'aria-label': 'To (age)' });
      if (r.length === 2) { lo.value = r[0]; hi.value = r[1]; }
      var commit = function () { setAnswer(q.id, lo.value === '' && hi.value === '' ? null : [lo.value === '' ? null : Number(lo.value), hi.value === '' ? null : Number(hi.value)]); later(); };
      lo.addEventListener('input', commit); hi.addEventListener('input', commit);
      return el('div', { class: 'cl-range', role: 'group', 'aria-labelledby': 'q-' + q.id + '-label' }, ['From', lo, 'to', hi, 'years']);
    }
    if (q.type === 'single' || q.type === 'multi') {
      var multi = q.type === 'multi';
      var chosen = multi ? (v || []).slice() : v;
      var g = el('div', { class: 'cl-chips', role: multi ? 'group' : 'radiogroup', 'aria-labelledby': 'q-' + q.id + '-label' });
      var bs = q.options.map(function (o) {
        var on = multi ? chosen.indexOf(o.value) !== -1 : chosen === o.value;
        var b = el('button', { type: 'button', class: 'cl-chip', role: multi ? null : 'radio', 'aria-checked': multi ? null : (on ? 'true' : 'false'), 'aria-pressed': multi ? (on ? 'true' : 'false') : null, 'data-value': o.value, text: o.label });
        b.addEventListener('click', function () {
          if (multi) {
            var k = chosen.indexOf(o.value);
            if (k !== -1) chosen.splice(k, 1); else if (chosen.length < q.max) chosen.push(o.value);
            setAnswer(q.id, chosen.slice());
          } else {
            chosen = o.value;
            setAnswer(q.id, o.value);
          }
          sync();
          save();
        });
        return b;
      });
      function sync() {
        bs.forEach(function (b) {
          var on = multi ? chosen.indexOf(b.getAttribute('data-value')) !== -1 : chosen === b.getAttribute('data-value');
          b.setAttribute(multi ? 'aria-pressed' : 'aria-checked', on ? 'true' : 'false');
          if (multi) b.disabled = !on && chosen.length >= q.max;
        });
      }
      bs.forEach(function (b) { g.appendChild(b); });
      sync();
      return g;
    }
    if (q.type === 'languages' || q.type === 'langreq') return langRows(q);
    return null;
  }

  function langRows(q) {
    var list = (answers[q.id] || []).map(function (x) { return { language: x.language, level: x.level, other: x.other || '' }; });
    if (!list.length && q.type === 'languages') list.push({ language: '', level: '', other: '' });
    var wrap = el('div', { class: 'cl-langs', role: 'group', 'aria-labelledby': 'q-' + q.id + '-label' });
    function commit() {
      var clean = list.filter(function (x) { return x.language || x.level; }).map(function (x) { var o = { language: x.language, level: x.level }; if (x.language === 'other') o.other = x.other; return o; });
      setAnswer(q.id, clean.length ? clean : null);
      later();
    }
    function draw() {
      wrap.innerHTML = '';
      list.forEach(function (item, i) {
        var lang = el('select', { class: 'form-input', 'aria-label': 'Language ' + (i + 1), id: i === 0 ? 'q-' + q.id : null });
        lang.appendChild(el('option', { value: '', text: 'Language…' }));
        q.options.forEach(function (o) {
          var taken = o.value !== 'other' && o.value !== item.language && list.some(function (x) { return x.language === o.value; });
          var opt = el('option', { value: o.value, text: o.label, disabled: taken });
          if (o.value === item.language) opt.selected = true;
          lang.appendChild(opt);
        });
        var lvl = el('select', { class: 'form-input', 'aria-label': (q.type === 'langreq' ? 'Minimum level for language ' : 'Level for language ') + (i + 1) });
        lvl.appendChild(el('option', { value: '', text: q.type === 'langreq' ? 'At least…' : 'Level…' }));
        q.levels.forEach(function (l) { var o = el('option', { value: l.value, text: l.label }); if (l.value === item.level) o.selected = true; lvl.appendChild(o); });
        var rm = el('button', { type: 'button', class: 'cl-icon-btn', 'aria-label': 'Remove language ' + (i + 1), text: '×' });
        rm.addEventListener('click', function () { list.splice(i, 1); commit(); draw(); });
        var row = el('div', { class: 'cl-lang-row' }, [lang, lvl, rm]);
        if (item.language === 'other') {
          var other = el('input', { class: 'form-input', type: 'text', maxlength: 40, placeholder: 'Which language?', 'aria-label': 'Which language?' });
          other.value = item.other;
          other.style.gridColumn = '1 / -1';
          other.addEventListener('input', function () { item.other = other.value; commit(); });
          row.appendChild(other);
        }
        lang.addEventListener('change', function () { item.language = lang.value; commit(); draw(); });
        lvl.addEventListener('change', function () { item.level = lvl.value; commit(); });
        wrap.appendChild(row);
      });
      if (list.length < q.max) wrap.appendChild(el('button', { type: 'button', class: 'cl-link-btn', text: '+ Add a language', onclick: function () { list.push({ language: '', level: '', other: '' }); draw(); } }));
    }
    draw();
    return wrap;
  }

  function rail() {
    var ol = el('ol', { class: 'cl-steps cl-steps--6', 'aria-label': 'Profile steps' });
    PQ.steps.forEach(function (s) {
      var done = s.step < 6 && stepDone(s.step);
      ol.appendChild(el('li', { class: (s.step === step ? 'is-current' : '') + (done && s.step !== step ? ' is-done' : '') }, [
        el('button', { type: 'button', 'aria-current': s.step === step ? 'step' : null, text: s.title, onclick: function () { save().then(function () { step = s.step; draw(); }); } }),
      ]));
    });
    return ol;
  }

  function draw() {
    var v = view();
    v.innerHTML = '';
    var s = PQ.steps[step - 1];
    var c = card('cl-card--accent', [
      el('div', { class: 'cl-stepline' }, [el('span', { text: 'Your profile · step ' + step + ' of 6' }), el('span', { class: 'cl-save', role: 'status', 'aria-live': 'polite' })]),
      rail(),
      el('h2', { id: 'cl-step-title', tabindex: '-1', text: s.title }),
      s.intro ? el('p', { class: 'cl-intro', text: s.intro }) : null,
    ]);
    if (step <= 4) qs(step).forEach(function (q) { c.appendChild(fieldBox(q, control(q))); });
    if (step === 5) photoStep(c);
    if (step === 6) { qs(6).forEach(function (q) { c.appendChild(fieldBox(q, control(q))); }); reviewList(c); }
    c.appendChild(el('p', { class: 'cl-form-error', role: 'alert' }));
    var nav = el('div', { class: 'cl-nav' });
    if (step > 1) nav.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Back', onclick: function () { save(); step--; draw(); } }));
    nav.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md', id: 'cl-next', text: step === 6 ? 'Send my profile to James' : 'Save and continue', onclick: next }));
    c.appendChild(nav);
    v.appendChild(c);
    scrollTop();
    var t = document.getElementById('cl-step-title');
    if (t) t.focus({ preventScroll: true });
  }

  function next() {
    formError('');
    var bad = null;
    if (step !== 5) qs(step).forEach(function (q) { var m = validate(q); err(q.id, m); if (m && !bad) bad = q.id; });
    if (step === 5 && !stepDone(5)) { formError('Please add at least one photo.'); return; }
    if (bad) { formError('Please check the questions marked above.'); var b = document.querySelector('[data-f="' + bad + '"]'); if (b) b.scrollIntoView({ block: 'center' }); return; }
    var btn = document.getElementById('cl-next');
    btn.disabled = true;
    save().then(function (ok) {
      btn.disabled = false;
      if (ok === false) return;
      if (step < 6) { step++; draw(); return; }
      var open = firstOpenStep();
      if (open < 6) { step = open; draw(); formError('Please complete this step first.'); return; }
      btn.disabled = true;
      btn.textContent = 'Sending…';
      H.api('client-profile-submit').then(function (d) { H.setState(d); }, function (e) {
        if (e.fatal) return;
        btn.disabled = false; btn.textContent = 'Send my profile to James';
        if (e.data && e.data.step) { step = e.data.step; draw(); }
        formError(e.message);
      });
    });
  }

  function photoStep(c) {
    c.appendChild(el('ul', { class: 'cl-guidance' }, [
      el('li', { text: 'Recent, with your face clearly visible.' }),
      el('li', { text: 'Only you in the photo: no children, no other people.' }),
      el('li', { text: 'Before upload, each photo is resized on your device and hidden information (such as where it was taken) is removed.' }),
    ]));
    var grid = el('div', { class: 'cl-photos', id: 'cl-photos' });
    var stat = el('p', { class: 'cl-doc-status', role: 'status', 'aria-live': 'polite' });
    var input = el('input', { type: 'file', accept: 'image/*', id: 'cl-photo-input', 'aria-label': 'Add a photo' });
    var add = el('div', { class: 'cl-file' }, [el('span', { class: 'btn btn--secondary btn--md', 'aria-hidden': 'true', text: '+ Add a photo' }), input]);
    c.appendChild(grid); c.appendChild(add); c.appendChild(stat);
    function drawPhotos() {
      grid.innerHTML = '';
      photos.forEach(function (p, i) {
        grid.appendChild(el('figure', { class: 'cl-photo' }, [
          el('img', { src: p.url || '', alt: 'Your photo ' + (i + 1) + (i === 0 ? ' (main)' : '') }),
          i === 0 ? el('span', { class: 'cl-photo-main', text: 'Main photo' }) : null,
          el('div', { class: 'cl-photo-actions' }, [
            el('button', { type: 'button', text: '←', 'aria-label': 'Move photo ' + (i + 1) + ' earlier', disabled: i === 0, onclick: function () { move(i, -1); } }),
            el('button', { type: 'button', text: '→', 'aria-label': 'Move photo ' + (i + 1) + ' later', disabled: i === photos.length - 1, onclick: function () { move(i, 1); } }),
            el('button', { type: 'button', text: 'Remove', onclick: function () { op({ op: 'delete', path: p.path }, 'Photo removed.'); } }),
          ]),
        ]));
      });
      input.disabled = photos.length >= PQ.photos.max;
      add.hidden = photos.length >= PQ.photos.max;
    }
    function op(body, done) {
      stat.textContent = 'Saving…';
      return H.api('client-photo-update', body).then(function (d) { photos = d.photos; drawPhotos(); stat.textContent = done; formError(''); }, function (e) { if (!e.fatal) stat.textContent = e.message; });
    }
    function move(i, d) {
      var paths = photos.map(function (p) { return p.path; });
      var t = paths[i]; paths[i] = paths[i + d]; paths[i + d] = t;
      op({ op: 'order', paths: paths }, i + d === 0 ? 'Main photo changed.' : 'Order changed.');
    }
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.value = '';
      if (!f) return;
      if (f.type && f.type.indexOf('image/') !== 0) { stat.textContent = 'That file isn\'t a photo. Please choose a JPEG or PNG photo.'; return; }
      stat.textContent = 'Preparing your photo…';
      var path;
      window.HUPhoto.process(f).then(function (blob) {
        stat.textContent = 'Uploading…';
        return H.api('client-photo-upload-url').then(function (r) {
          path = r.path;
          return fetch(r.signedUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'false' }, body: blob, credentials: 'omit', referrerPolicy: 'no-referrer' });
        });
      }).then(function (res) {
        if (!res.ok) throw new Error('The upload didn\'t complete. Please try again.');
        return op({ op: 'confirm', path: path }, 'Photo added.');
      }).catch(function (e) { if (!e.fatal) stat.textContent = e.message; });
    });
    drawPhotos();
  }

  function answerText(q, v) {
    if (isEmpty(v)) return null;
    var lab = function (opts, x) { var o = opts.filter(function (y) { return y.value === x; })[0]; return o ? o.label : x; };
    if (q.type === 'single') return lab(q.options, v);
    if (q.type === 'multi') return v.map(function (x) { return lab(q.options, x); }).join(', ');
    if (q.type === 'range') return v[0] + ' to ' + v[1];
    if (q.type === 'languages' || q.type === 'langreq') return v.map(function (x) { return (x.language === 'other' ? x.other : lab(q.options, x.language)) + (q.type === 'langreq' ? ', at least ' : ' (') + lab(q.levels, x.level).toLowerCase() + (q.type === 'langreq' ? '' : ')'); }).join('; ');
    return String(v);
  }

  function reviewList(c) {
    PQ.steps.slice(0, 5).forEach(function (s) {
      var dl = el('dl');
      if (s.step === 5) {
        dl.appendChild(el('dt', { text: 'Photos' }));
        dl.appendChild(el('dd', { class: photos.length ? '' : 'cl-cross', text: photos.length ? photos.length + ' added' : 'Missing' }));
      } else {
        qs(s.step).forEach(function (q) {
          if (!shown(q)) return;
          var t = answerText(q, answers[q.id]);
          dl.appendChild(el('dt', { text: q.label }));
          dl.appendChild(el('dd', { class: t ? '' : (q.required ? 'cl-cross' : ''), text: t || (q.required ? 'Missing' : '—') }));
        });
      }
      c.appendChild(el('div', { class: 'cl-review' }, [
        el('div', { class: 'cl-review-head' }, [el('h3', { text: s.title }), el('button', { type: 'button', class: 'cl-link-btn', text: 'Edit', 'aria-label': 'Edit ' + s.title, onclick: function () { save(); step = s.step; draw(); } })]),
        dl,
      ]));
    });
  }

  // ------------------------------------------------------------------ summary approval
  function summaryReview() {
    H.lead('Your profile summary is ready for you to read.');
    var v = view();
    v.appendChild(progressCard(1));
    var box = el('div', { class: 'cl-summary' });
    box.innerHTML = E.summary.html; // sanitised on the server: p, br, strong, em, lists only
    var comment = el('textarea', { class: 'form-textarea', id: 'cl-changes', maxlength: 2000, rows: 4, placeholder: 'What would you like changed?' });
    var errEl = el('p', { class: 'cl-form-error', role: 'alert' });
    var changes = el('div', { class: 'cl-sign', hidden: true }, [el('label', { class: 'cl-label', for: 'cl-changes', text: 'What would you like changed?' }), comment,
      el('button', { type: 'button', class: 'btn btn--secondary btn--md cl-action', text: 'Send my comments to James', onclick: function () { respond('changes', comment.value); } })]);
    v.appendChild(card('cl-card--accent', [
      el('h2', { text: 'Your profile summary' }),
      el('p', { class: 'cl-intro', text: 'This is what the women you choose will read first, translated into their language, with your photos, your background declaration and your message.' }),
      box,
      el('div', { class: 'cl-nav' }, [
        el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Ask for changes', onclick: function () { changes.hidden = false; comment.focus(); } }),
        el('button', { type: 'button', class: 'btn btn--primary btn--md', id: 'cl-approve', text: 'Approve my profile', onclick: function () { respond('approve'); } }),
      ]),
      changes,
      errEl,
    ]));
    function respond(decision, text) {
      errEl.textContent = '';
      if (decision === 'changes' && !String(text || '').trim()) { errEl.textContent = 'Please tell James what you would like changed.'; return; }
      H.api('client-summary-respond', { decision: decision, comment: text || '' }).then(function (d) { H.setState(d); }, function (e) { if (!e.fatal) errEl.textContent = e.message; });
    }
  }

  // ------------------------------------------------------------------ F5 review
  var chosen = [];
  var R = null;

  function review() {
    H.lead(E.choicesSubmittedAt ? 'Thank you. Your choices are with James.' : 'Your profiles are ready. Take your time.');
    var v = view();
    v.appendChild(el('p', { class: 'cl-center', text: 'Loading your profiles…' }));
    H.api('client-review-get').then(function (d) {
      R = d;
      chosen = (d.choices || []).slice();
      v.innerHTML = '';
      if (d.choicesSubmittedAt) return chosenView();
      drawReview();
    }, function (e) { if (!e.fatal) { v.innerHTML = ''; v.appendChild(card('', [el('p', { text: e.message })])); } });
  }

  function watermark(name) {
    var w = el('div', { class: 'cl-wm', 'aria-hidden': 'true' });
    for (var i = 0; i < 18; i++) w.appendChild(el('span', { text: name }));
    return w;
  }

  function profileCard(c) {
    var idx = chosen.indexOf(c.id);
    var head = el('div', { class: 'cl-pc-head' }, [
      el('h3', { text: c.displayName + (c.age ? ', ' + c.age : '') }),
      el('span', { class: 'cl-pc-sub', text: c.province || '' }),
    ]);
    var gallery = el('div', { class: 'cl-pc-photos' + (c.photos.length ? '' : ' is-empty') });
    if (c.photos.length) {
      c.photos.forEach(function (p, i) {
        var img = el('img', { src: p.url || '', alt: c.displayName + ', photo ' + (i + 1), draggable: 'false' });
        gallery.appendChild(el('div', { class: 'cl-pc-photo' }, [img, watermark(R.viewer)]));
      });
    } else {
      gallery.appendChild(el('p', { text: 'She has chosen not to share photos.' }));
    }
    var dl = el('dl', { class: 'cl-pc-answers' });
    c.items.forEach(function (it) { dl.appendChild(el('dt', { text: it.label })); dl.appendChild(el('dd', { text: it.text })); });
    var btn = el('button', { type: 'button', class: 'btn ' + (idx !== -1 ? 'btn--primary' : 'btn--secondary') + ' btn--md cl-action', 'aria-pressed': idx !== -1 ? 'true' : 'false',
      text: idx !== -1 ? '✓ Choice ' + (idx + 1) + ' — remove' : 'Choose ' + c.displayName,
      disabled: idx === -1 && chosen.length >= R.maxChoices });
    btn.addEventListener('click', function () {
      var k = chosen.indexOf(c.id);
      if (k !== -1) chosen.splice(k, 1); else if (chosen.length < R.maxChoices) chosen.push(c.id);
      drawReview(c.id);
    });
    return el('article', { class: 'cl-pc' + (idx !== -1 ? ' is-chosen' : ''), id: 'pc-' + c.id }, [
      idx !== -1 ? el('span', { class: 'cl-pc-rank', text: String(idx + 1) }) : null,
      gallery, head, dl, btn,
    ]);
  }

  function drawReview(focusId) {
    var v = view();
    v.innerHTML = '';
    var intro = card('cl-card--accent', [
      el('h2', { text: 'Your profiles' }),
      el('p', { text: R.cards.length + ' women whose own answers meet your must-haves. Each has registered herself and chosen to let clients see her profile. Choose up to ' + R.maxChoices + ', in order of preference.' }),
      el('p', { class: 'cl-help', text: 'These profiles are shared with you in confidence. Please do not copy, save or share them, or their photos.' }),
    ]);
    v.appendChild(intro);
    var grid = el('div', { class: 'cl-pcs' });
    R.cards.forEach(function (c) { grid.appendChild(profileCard(c)); });
    if (!R.cards.length) grid.appendChild(card('', [el('p', { text: 'None of the profiles on your list is available any more. James will be in touch.' })]));
    v.appendChild(grid);
    v.appendChild(choicesBar());
    if (focusId) { var b = document.querySelector('#pc-' + focusId + ' .cl-action'); if (b) b.focus({ preventScroll: true }); }
    // Discourage saving photos (screenshots can't be prevented).
    v.querySelectorAll('.cl-pc-photo').forEach(function (p) { p.addEventListener('contextmenu', function (e) { e.preventDefault(); }); });
  }

  function nameOf(id) { var c = R.cards.filter(function (x) { return x.id === id; })[0]; return c ? c.displayName : '—'; }

  function choicesBar() {
    var list = el('ol', { class: 'cl-choice-list' });
    chosen.forEach(function (id, i) {
      list.appendChild(el('li', null, [
        el('span', { text: nameOf(id) }),
        el('span', { class: 'cl-choice-move' }, [
          el('button', { type: 'button', class: 'cl-icon-btn', text: '↑', 'aria-label': 'Move ' + nameOf(id) + ' up', disabled: i === 0, onclick: function () { chosen.splice(i - 1, 0, chosen.splice(i, 1)[0]); drawReview(); } }),
          el('button', { type: 'button', class: 'cl-icon-btn', text: '↓', 'aria-label': 'Move ' + nameOf(id) + ' down', disabled: i === chosen.length - 1, onclick: function () { chosen.splice(i + 1, 0, chosen.splice(i, 1)[0]); drawReview(); } }),
        ]),
      ]));
    });
    var errEl = el('p', { class: 'cl-form-error', role: 'alert' });
    var send = el('button', { type: 'button', class: 'btn btn--primary btn--sm', id: 'cl-send-choices', text: 'Send', disabled: !chosen.length, 'aria-label': 'Send my choices' });
    send.addEventListener('click', function () { confirmChoices(errEl); });
    return el('aside', { class: 'cl-choices', 'aria-label': 'Your choices' }, [
      el('div', { class: 'cl-choices-top' }, [el('h2', { text: 'Your choices: ' + chosen.length + ' of ' + R.maxChoices }), send]),
      chosen.length ? list : el('p', { class: 'cl-help', text: 'Tap "Choose" on a profile to add her. Your first choice is the woman we approach first.' }),
      errEl,
    ]);
  }

  function confirmChoices(errEl) {
    var names = chosen.map(function (id, i) { return (i + 1) + '. ' + nameOf(id); }).join('\n');
    var box = el('div', { class: 'cl-confirm', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cl-confirm-title' });
    var panel = el('div', { class: 'cl-confirm-box' }, [
      el('h2', { id: 'cl-confirm-title', text: 'Send your choices?' }),
      el('p', { class: 'cl-pre', text: names }),
      el('p', { text: 'Once sent, your choices can\'t be changed here, only by writing to James.' }),
      el('div', { class: 'cl-nav' }, [
        el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Not yet', onclick: function () { box.remove(); } }),
        el('button', { type: 'button', class: 'btn btn--primary btn--md', id: 'cl-confirm-send', text: 'Send my choices', onclick: function (e) {
          e.currentTarget.disabled = true;
          H.api('client-choices-submit', { candidateIds: chosen }).then(function () { box.remove(); review(); }, function (er) { box.remove(); if (!er.fatal) errEl.textContent = er.message; });
        } }),
      ]),
    ]);
    box.appendChild(panel);
    document.body.appendChild(box);
    document.getElementById('cl-confirm-send').focus();
  }

  var HIS_STATUS = {
    waiting: 'Waiting for her reply',
    introduced: '✓ Introduced: James has sent you her details',
    not_this_time: 'Not this time',
    unavailable: 'No longer available',
  };

  function chosenView() {
    var v = view();
    var list = E.introductions && E.introductions.length ? E.introductions : chosen.map(function (id) { return { candidateId: id, name: nameOf(id), status: 'waiting' }; });
    var ol = el('ol', { class: 'cl-intros' });
    list.forEach(function (x) {
      ol.appendChild(el('li', { class: 'cl-intro is-' + x.status }, [
        el('span', { class: 'cl-intro-name', text: x.name || nameOf(x.candidateId) }),
        el('span', { class: 'cl-intro-status', text: HIS_STATUS[x.status] || '' }),
      ]));
    });
    v.appendChild(progressCard(5));
    v.appendChild(card('cl-card--accent', [
      el('h2', { text: 'Your introductions' }), ol,
      el('p', { class: 'cl-help', text: (E.introductionsUsed || list.length) + ' of 5 introductions in use. A "no" or an unanswered request doesn\'t count.' }),
      el('p', { text: 'James and Huyen share your profile with each woman in her language. Each decides freely, in her own time, and never has to give a reason. When a woman says yes, James sends you the details she chose to share.' }),
    ]));
    if (E.canReplace) v.appendChild(replacementCard());
    v.querySelectorAll('.cl-pc-photo').forEach(function (p) { p.addEventListener('contextmenu', function (e) { e.preventDefault(); }); });
  }

  function replacementCard() {
    var left = R.cards.filter(function (c) { return (R.taken || []).indexOf(c.id) === -1; });
    var c = card('', [el('h2', { text: 'Choose someone else' })]);
    if (!left.length) { c.appendChild(el('p', { text: 'Everyone on your list has already been asked. James will be in touch about what happens next.' })); return c; }
    c.appendChild(el('p', { text: 'You can choose another woman from your list. She will be asked in the same way.' }));
    var grid = el('div', { class: 'cl-pcs' });
    left.forEach(function (x) {
      var pc = profileCard(x);
      var btn = pc.querySelector('.cl-action');
      var fresh = btn.cloneNode(false);
      fresh.textContent = 'Choose ' + x.displayName;
      fresh.disabled = false;
      fresh.setAttribute('aria-pressed', 'false');
      fresh.addEventListener('click', function () {
        fresh.disabled = true;
        H.api('client-replacement', { candidateId: x.id }).then(function (d) { H.setState(d); }, function (e) { if (!e.fatal) { fresh.disabled = false; window.alert(e.message); } });
      });
      btn.replaceWith(fresh);
      grid.appendChild(pc);
    });
    c.appendChild(grid);
    return c;
  }

  window.HUEngagement = { render: render };
})();
