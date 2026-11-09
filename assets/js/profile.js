/* Heritage Union: candidate profile questionnaire (/vi/ho-so).
 *
 * - Opened only with her private link: /vi/ho-so#t=<token>. The token is
 *   read from the fragment (never sent to a server in a URL or Referer),
 *   kept in sessionStorage and removed from the address bar.
 * - One step per screen; saves on "Tiếp tục" and 3 s after typing stops.
 *   A failed save keeps everything in memory and offers a retry.
 * - Photos are rotated, resized (max 1600 px) and re-encoded as JPEG in the
 *   browser before upload, which strips EXIF metadata including GPS.
 * No libraries; works on old Android browsers (ES5 + Promise + fetch).
 */
(function () {
  'use strict';

  var API = '/.netlify/functions/';
  var TOKEN_KEY = 'hu_profile_token';
  var TOTAL_STEPS = 6;
  var AUTOSAVE_MS = 3000;
  var REQUEST_TIMEOUT_MS = 30000;
  var MAX_EDGE = 1600;
  var JPEG_QUALITY = 0.82;
  var MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ token

  function readToken() {
    var m = /(?:^#|&)t=([A-Za-z0-9_-]{43})(?:&|$)/.exec(window.location.hash || '');
    var token = m ? m[1] : null;
    if (token) {
      try { sessionStorage.setItem(TOKEN_KEY, token); } catch (e) {}
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
      return token;
    }
    try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  var token = readToken();

  // ------------------------------------------------------------------ state

  var Q = null;              // question JSON
  var S = null;              // server state from profile-get
  var answers = {};          // in-memory answers, incl. display_name
  var dirty = {};            // question ids changed since the last good save
  var step = 1;
  var furthestStep = 1;      // prefills for later steps are only saved once she has seen them
  var saving = null;         // in-flight save promise
  var saveAgain = false;
  var autosaveTimer = null;
  var photoBusy = false;

  // ------------------------------------------------------------------ api

  function api(name, body) {
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS) : null;
    return fetch(API + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ token: token }, body || {})),
      signal: controller ? controller.signal : undefined,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) { showNoLink(data.error); throw Object.assign(new Error(data.error || ''), { fatal: true }); }
        if (!res.ok) { var err = new Error(data.error || 'Đã có lỗi xảy ra. Bạn vui lòng thử lại nhé.'); err.data = data; throw err; }
        return data;
      });
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw new Error('Không kết nối được. Bạn kiểm tra mạng rồi thử lại nhé.');
    });
  }

  // ------------------------------------------------------------------ screens

  function show(id) {
    ['pf-loading', 'pf-nolink', 'pf-app', 'pf-done'].forEach(function (x) { $(x).hidden = x !== id; });
  }

  function showNoLink(message) {
    if (message) $('pf-nolink-message').textContent = message;
    show('pf-nolink');
  }

  // ------------------------------------------------------------------ helpers

  function qsForStep(n) { return Q.questions.filter(function (q) { return q.step === n; }); }
  function byId(id) { for (var i = 0; i < Q.questions.length; i++) if (Q.questions[i].id === id) return Q.questions[i]; return null; }
  function isEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0); }
  function isShown(q) {
    if (!q.showIf) return true;
    var v = answers[q.showIf.id];
    return typeof v === 'number' && v >= q.showIf.min;
  }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'class') e.className = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function optionLabel(q, value) {
    for (var i = 0; i < (q.options || []).length; i++) if (q.options[i].value === value) return q.options[i].label.vi;
    return value;
  }
  function formatAnswer(q, v) {
    if (isEmpty(v)) return null;
    if (q.type === 'single') return optionLabel(q, v);
    if (q.type === 'multi') return v.map(function (x) { return optionLabel(q, x); }).join(', ');
    if (q.type === 'range') return 'Từ ' + v[0] + ' đến ' + v[1] + ' tuổi';
    return String(v);
  }
  function setAnswer(id, value) {
    answers[id] = value;
    dirty[id] = true;
    setStatus('');
    var fe = $('pf-form-error');
    if (fe && !fe.hidden && !document.querySelector('.pf-q.has-error:not([data-q="' + id + '"])')) fe.hidden = true;
  }

  // ------------------------------------------------------------------ saving

  function setStatus(kind) {
    var s = $('pf-save-status');
    s.className = 'pf-save-status' + (kind === 'saved' ? ' is-saved' : '');
    s.textContent = kind === 'saving' ? 'Đang lưu…' : kind === 'saved' ? 'Đã lưu' : '';
  }

  function payloadFromDirty() {
    var out = {};
    Object.keys(dirty).forEach(function (id) {
      var q = byId(id);
      if (!q || q.step > furthestStep) return;
      var v = answers[id];
      out[id] = isEmpty(v) || !isShown(q) ? null : v;
    });
    return out;
  }

  // Saves whatever is dirty. Resolves true on success, false on failure
  // (answers stay in memory and dirty, and the retry banner shows).
  function save() {
    if (autosaveTimer) { clearTimeout(autosaveTimer); autosaveTimer = null; }
    if (saving) { saveAgain = true; return saving; }
    var body = payloadFromDirty();
    var ids = Object.keys(body);
    if (!ids.length) { $('pf-save-error').hidden = true; return Promise.resolve(true); }
    var sent = {};
    ids.forEach(function (id) { sent[id] = JSON.stringify(answers[id]); });
    setStatus('saving');
    saving = api('profile-save', { answers: body }).then(function () {
      // Only clear what hasn't changed again while the request was in flight.
      ids.forEach(function (id) { if (JSON.stringify(answers[id]) === sent[id]) delete dirty[id]; });
      $('pf-save-error').hidden = true;
      setStatus('saved');
      return true;
    }, function (err) {
      if (err.fatal) return false;
      setStatus('');
      if (err.data && err.data.field) showFieldError(err.data.field, err.message);
      $('pf-save-error').hidden = false;
      return false;
    }).then(function (ok) {
      saving = null;
      if (saveAgain) { saveAgain = false; return save(); }
      return ok;
    });
    return saving;
  }

  function scheduleAutosave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(save, AUTOSAVE_MS);
  }

  // ------------------------------------------------------------------ validation

  var MESSAGES = {
    required: 'Bạn vui lòng trả lời câu này.',
    requiredMulti: 'Bạn vui lòng chọn ít nhất một điều.',
    tooLong: function (max) { return 'Câu trả lời dài quá ' + max + ' ký tự. Bạn vui lòng rút gọn lại nhé.'; },
    number: function (q) { return 'Bạn vui lòng nhập một số từ ' + q.min + ' đến ' + q.max + '.'; },
    range: function (q) { return 'Bạn vui lòng chọn độ tuổi từ ' + q.min + ' đến ' + q.max + ', số đầu nhỏ hơn hoặc bằng số sau.'; },
  };

  function validate(q) {
    if (!isShown(q)) return '';
    var v = answers[q.id];
    if (isEmpty(v) || (typeof v === 'string' && !v.trim())) {
      return q.required ? (q.type === 'multi' ? MESSAGES.requiredMulti : MESSAGES.required) : '';
    }
    if ((q.type === 'text' || q.type === 'textarea') && v.trim().length > q.max) return MESSAGES.tooLong(q.max);
    if (q.type === 'number' && (typeof v !== 'number' || v < q.min || v > q.max || Math.floor(v) !== v)) return MESSAGES.number(q);
    if (q.type === 'range' && (!Array.isArray(v) || !(v[0] >= q.min && v[1] <= q.max && v[0] <= v[1]))) return MESSAGES.range(q);
    return '';
  }

  function showFieldError(id, message) {
    var box = document.querySelector('[data-q="' + id + '"]');
    if (!box) return;
    box.classList.toggle('has-error', !!message);
    var e = box.querySelector('.pf-error');
    if (e) e.textContent = message || '';
  }

  function validateStep(n) {
    var first = null;
    qsForStep(n).forEach(function (q) {
      var m = validate(q);
      showFieldError(q.id, m);
      if (m && !first) first = q.id;
    });
    if (first) {
      var box = document.querySelector('[data-q="' + first + '"]');
      if (box) {
        box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        var f = box.querySelector('input, textarea, select, button');
        if (f) f.focus({ preventScroll: true });
      }
    }
    return !first;
  }

  // First step with a required answer missing (1-4), else null.
  function firstIncompleteStep() {
    for (var n = 1; n <= 4; n++) {
      var bad = qsForStep(n).some(function (q) { return !!validate(q); });
      if (bad) return n;
    }
    return null;
  }

  // ------------------------------------------------------------------ rendering questions

  function questionBox(q, control) {
    var labelId = 'q-' + q.id + '-label';
    var helpId = 'q-' + q.id + '-help';
    var errId = 'q-' + q.id + '-err';
    var label = el(q.type === 'single' && q.widget !== 'select' || q.type === 'multi' || q.type === 'range' ? 'span' : 'label',
      { class: 'pf-q-label', id: labelId, for: q.type === 'text' || q.type === 'textarea' || q.type === 'number' || q.widget === 'select' ? 'q-' + q.id : null },
      [q.label.vi, q.required ? el('span', { class: 'pf-req', 'aria-hidden': 'true', text: '*' }) : el('span', { class: 'pf-opt', text: '(không bắt buộc)' })]);
    return el('div', { class: 'pf-q', 'data-q': q.id }, [
      label,
      q.help && q.help.vi ? el('p', { class: 'pf-help', id: helpId, text: q.help.vi }) : null,
      control,
      el('p', { class: 'pf-error', id: errId, 'aria-live': 'polite' }),
    ]);
  }

  function describedBy(q) {
    return (q.help && q.help.vi ? 'q-' + q.id + '-help ' : '') + 'q-' + q.id + '-err';
  }

  function renderText(q) {
    var input = el('input', {
      class: 'form-input', type: 'text', id: 'q-' + q.id, maxlength: q.max, 'aria-required': q.required ? 'true' : null,
      'aria-describedby': describedBy(q), autocomplete: q.id === 'display_name' ? 'given-name' : 'off', value: answers[q.id] || '',
    });
    input.addEventListener('input', function () { setAnswer(q.id, input.value); showFieldError(q.id, ''); });
    return input;
  }

  function renderTextarea(q) {
    var counter = el('p', { class: 'pf-counter', 'aria-live': 'off' });
    var ta = el('textarea', {
      class: 'form-textarea', id: 'q-' + q.id, maxlength: q.max, 'aria-required': q.required ? 'true' : null,
      'aria-describedby': describedBy(q) + ' q-' + q.id + '-count', rows: 6,
    });
    counter.id = 'q-' + q.id + '-count';
    ta.value = answers[q.id] || '';
    function count() {
      var n = ta.value.length;
      counter.textContent = n + '/' + q.max + ' ký tự';
      counter.classList.toggle('is-over', n > q.max);
    }
    ta.addEventListener('input', function () { setAnswer(q.id, ta.value); showFieldError(q.id, ''); count(); scheduleAutosave(); });
    count();
    var wrap = el('div', null, [ta, counter]);
    return wrap;
  }

  function renderSelect(q) {
    var sel = el('select', { class: 'form-input', id: 'q-' + q.id, 'aria-required': q.required ? 'true' : null, 'aria-describedby': describedBy(q) });
    sel.appendChild(el('option', { value: '', text: 'Chọn…' }));
    q.options.forEach(function (o) {
      var opt = el('option', { value: o.value, text: o.label.vi });
      if (answers[q.id] === o.value) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () { setAnswer(q.id, sel.value || null); showFieldError(q.id, ''); });
    return sel;
  }

  function renderSingle(q) {
    if (q.widget === 'select') return renderSelect(q);
    var group = el('div', {
      class: 'pf-chips' + (q.options.length > 4 ? '' : ' pf-chips--stack'), role: 'radiogroup',
      'aria-labelledby': 'q-' + q.id + '-label', 'aria-describedby': describedBy(q), 'aria-required': q.required ? 'true' : null,
    });
    var buttons = q.options.map(function (o) {
      var b = el('button', { type: 'button', class: 'pf-chip', role: 'radio', 'aria-checked': answers[q.id] === o.value ? 'true' : 'false', 'data-value': o.value, text: o.label.vi });
      b.addEventListener('click', function () {
        // Tapping the selected chip of an optional question clears it.
        var next = answers[q.id] === o.value && !q.required ? null : o.value;
        setAnswer(q.id, next);
        buttons.forEach(function (x) { x.setAttribute('aria-checked', x.getAttribute('data-value') === next ? 'true' : 'false'); });
        showFieldError(q.id, '');
      });
      return b;
    });
    // Arrow keys move between options, as for native radios.
    group.addEventListener('keydown', function (e) {
      var i = buttons.indexOf(document.activeElement);
      if (i === -1) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); buttons[(i + 1) % buttons.length].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); buttons[(i - 1 + buttons.length) % buttons.length].focus(); }
    });
    buttons.forEach(function (b) { group.appendChild(b); });
    return group;
  }

  function renderMulti(q) {
    var chosen = (answers[q.id] || []).slice();
    var note = el('p', { class: 'pf-help', 'aria-live': 'polite' });
    var group = el('div', { class: 'pf-chips', role: 'group', 'aria-labelledby': 'q-' + q.id + '-label', 'aria-describedby': describedBy(q) });
    var buttons = q.options.map(function (o) {
      var b = el('button', { type: 'button', class: 'pf-chip', 'aria-pressed': chosen.indexOf(o.value) !== -1 ? 'true' : 'false', 'data-value': o.value, text: o.label.vi });
      b.addEventListener('click', function () {
        var i = chosen.indexOf(o.value);
        if (i !== -1) chosen.splice(i, 1);
        else if (chosen.length < q.max) chosen.push(o.value);
        setAnswer(q.id, chosen.slice());
        showFieldError(q.id, '');
        sync();
      });
      return b;
    });
    function sync() {
      buttons.forEach(function (b) {
        var on = chosen.indexOf(b.getAttribute('data-value')) !== -1;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.disabled = !on && chosen.length >= q.max;
      });
      note.textContent = 'Đã chọn ' + chosen.length + '/' + q.max;
    }
    buttons.forEach(function (b) { group.appendChild(b); });
    sync();
    return el('div', null, [group, note]);
  }

  function renderNumber(q) {
    var input = el('input', {
      class: 'form-input', type: 'number', id: 'q-' + q.id, inputmode: 'numeric', pattern: '[0-9]*', min: q.min, max: q.max, step: 1,
      'aria-required': q.required ? 'true' : null, 'aria-describedby': describedBy(q),
    });
    if (typeof answers[q.id] === 'number') input.value = answers[q.id];
    function commit(v) {
      var n = v === '' ? null : Number(v);
      setAnswer(q.id, n === null || isNaN(n) ? null : n);
      showFieldError(q.id, '');
      if (Q.questions.some(function (x) { return x.showIf && x.showIf.id === q.id; })) refreshConditional();
    }
    input.addEventListener('input', function () { commit(input.value); });
    function bump(d) {
      var cur = typeof answers[q.id] === 'number' ? answers[q.id] : q.min;
      var n = Math.min(q.max, Math.max(q.min, cur + d));
      input.value = n;
      commit(String(n));
    }
    return el('div', { class: 'pf-stepper' }, [
      el('button', { type: 'button', class: 'pf-step-btn', 'aria-label': 'Bớt 1', onclick: function () { bump(-1); } }, ['−']),
      input,
      el('button', { type: 'button', class: 'pf-step-btn', 'aria-label': 'Thêm 1', onclick: function () { bump(1); } }, ['+']),
    ]);
  }

  function renderRange(q) {
    var v = answers[q.id] || [];
    var lo = el('input', { class: 'form-input', type: 'number', inputmode: 'numeric', min: q.min, max: q.max, 'aria-label': 'Từ (tuổi)', id: 'q-' + q.id, 'aria-describedby': describedBy(q) });
    var hi = el('input', { class: 'form-input', type: 'number', inputmode: 'numeric', min: q.min, max: q.max, 'aria-label': 'Đến (tuổi)', 'aria-describedby': describedBy(q) });
    if (v.length === 2) { lo.value = v[0]; hi.value = v[1]; }
    function commit() {
      var a = lo.value === '' ? null : Number(lo.value);
      var b = hi.value === '' ? null : Number(hi.value);
      setAnswer(q.id, a === null && b === null ? null : [a, b]);
      showFieldError(q.id, '');
    }
    lo.addEventListener('input', commit);
    hi.addEventListener('input', commit);
    return el('div', { class: 'pf-range', role: 'group', 'aria-labelledby': 'q-' + q.id + '-label' }, ['Từ', lo, 'đến', hi, 'tuổi']);
  }

  function renderQuestion(q) {
    var control =
      q.type === 'text' ? renderText(q) :
      q.type === 'textarea' ? renderTextarea(q) :
      q.type === 'single' ? renderSingle(q) :
      q.type === 'multi' ? renderMulti(q) :
      q.type === 'number' ? renderNumber(q) :
      q.type === 'range' ? renderRange(q) : null;
    var box = questionBox(q, control);
    if (!isShown(q)) box.hidden = true;
    return box;
  }

  function refreshConditional() {
    qsForStep(step).forEach(function (q) {
      if (!q.showIf) return;
      var box = document.querySelector('[data-q="' + q.id + '"]');
      if (box) box.hidden = !isShown(q);
      if (!isShown(q) && !isEmpty(answers[q.id])) setAnswer(q.id, null);
    });
  }

  // ------------------------------------------------------------------ steps

  var INTROS = {
    1: 'Những thông tin cơ bản về bạn. Bạn có thể sửa lại bất cứ lúc nào.',
    2: '',
    3: '',
    4: 'Hãy viết bằng lời của chính bạn. Viết bằng tiếng Việt là tốt nhất, Huyền sẽ giúp dịch.',
    5: 'Ảnh là không bắt buộc. Bạn có thể bỏ qua bước này.',
    6: 'Bạn xem lại các câu trả lời. Bấm “Sửa” nếu muốn thay đổi điều gì.',
  };

  function stepTitle(n) {
    for (var i = 0; i < Q.steps.length; i++) if (Q.steps[i].step === n) return Q.steps[i].title.vi;
    return '';
  }

  function goTo(n, focusTitle) {
    step = Math.max(1, Math.min(TOTAL_STEPS, n));
    furthestStep = Math.max(furthestStep, step);
    $('pf-step-count').textContent = 'Bước ' + step + '/' + TOTAL_STEPS;
    $('pf-progress-bar').style.width = Math.round((step / TOTAL_STEPS) * 100) + '%';
    $('pf-step-title').textContent = stepTitle(step);
    $('pf-step-intro').textContent = INTROS[step] || '';
    $('pf-form-error').hidden = true;
    $('pf-back').hidden = step === 1;
    $('pf-next').textContent = step === TOTAL_STEPS ? (S.submittedAt ? 'Lưu thay đổi' : 'Gửi hồ sơ') : 'Tiếp tục';
    var body = $('pf-step-body');
    body.innerHTML = '';
    if (step <= 4) qsForStep(step).forEach(function (q) { body.appendChild(renderQuestion(q)); });
    else if (step === 5) renderPhotos(body);
    else renderReview(body);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (focusTitle) $('pf-step-title').focus({ preventScroll: true });
  }

  function formError(message) {
    var e = $('pf-form-error');
    e.textContent = message;
    e.hidden = !message;
  }

  $('pf-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (step <= 4) {
      if (!validateStep(step)) { formError('Bạn vui lòng xem lại những câu được đánh dấu bên trên.'); return; }
      var next = $('pf-next');
      next.disabled = true;
      save().then(function () {
        // Even if this save failed, her answers stay in memory and are
        // retried on the next save; she can keep going.
        next.disabled = false;
        goTo(step + 1, true);
      });
    } else if (step === 5) {
      if (photoBusy) { formError('Bạn vui lòng đợi ảnh tải lên xong nhé.'); return; }
      goTo(6, true);
    } else {
      submit();
    }
  });

  $('pf-back').addEventListener('click', function () {
    save();
    goTo(step - 1, true);
  });

  $('pf-retry').addEventListener('click', function () { save(); });

  // ------------------------------------------------------------------ photos

  function renderPhotos(body) {
    body.appendChild(el('ul', { class: 'pf-guidance' }, [
      el('li', { text: 'Ảnh chụp gần đây.' }),
      el('li', { text: 'Thấy rõ khuôn mặt của bạn.' }),
      el('li', { text: 'Chỉ có một mình bạn trong ảnh.' }),
      el('li', { text: 'Không có trẻ em trong bất kỳ ảnh nào.' }),
      el('li', { text: 'Không chụp giấy tờ tuỳ thân (CCCD, hộ chiếu…).' }),
    ]));
    body.appendChild(el('p', { class: 'pf-help', text: 'Bạn có thể thêm tối đa 3 ảnh. Ảnh đầu tiên là ảnh chính. Trước khi tải lên, ảnh được thu nhỏ ngay trên điện thoại của bạn và mọi thông tin ẩn trong ảnh (như vị trí chụp) đều được xoá. Ảnh được lưu riêng tư, không ai xem được nếu bạn không đồng ý ở bước cuối.' }));
    var grid = el('div', { class: 'pf-photos', id: 'pf-photos' });
    body.appendChild(grid);
    var status = el('p', { class: 'pf-photo-status', id: 'pf-photo-status', role: 'status', 'aria-live': 'polite' });
    var input = el('input', { type: 'file', accept: 'image/*', id: 'pf-photo-input', 'aria-label': 'Thêm ảnh' });
    var add = el('div', { class: 'pf-add-photo' }, [
      el('span', { class: 'btn btn--secondary btn--md pf-btn', 'aria-hidden': 'true', text: '+ Thêm ảnh' }),
      input,
    ]);
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';
      if (file) addPhoto(file);
    });
    body.appendChild(add);
    body.appendChild(status);
    drawPhotos();
  }

  function drawPhotos() {
    var grid = $('pf-photos');
    if (!grid) return;
    grid.innerHTML = '';
    var photos = S.photos || [];
    photos.forEach(function (p, i) {
      var img = el('img', { alt: 'Ảnh ' + (i + 1) + (i === 0 ? ' (ảnh chính)' : ''), src: p.url || '', loading: 'lazy' });
      grid.appendChild(el('div', { class: 'pf-photo' }, [
        img,
        i === 0 ? el('span', { class: 'pf-photo-main', text: 'Ảnh chính' }) : null,
        el('div', { class: 'pf-photo-actions' }, [
          el('button', { type: 'button', 'aria-label': 'Đưa ảnh ' + (i + 1) + ' lên trước', disabled: i === 0, onclick: function () { movePhoto(i, -1); } }, ['←']),
          el('button', { type: 'button', 'aria-label': 'Đưa ảnh ' + (i + 1) + ' ra sau', disabled: i === photos.length - 1, onclick: function () { movePhoto(i, 1); } }, ['→']),
          el('button', { type: 'button', onclick: function () { deletePhoto(p.path); } }, ['Xoá']),
        ]),
      ]));
    });
    var input = $('pf-photo-input');
    if (input) input.disabled = photoBusy || photos.length >= 3;
  }

  function photoStatus(text) { var s = $('pf-photo-status'); if (s) s.textContent = text || ''; }

  function setPhotoState(data) {
    S.photos = data.photos || [];
    S.consents = data.consents || S.consents;
    drawPhotos();
  }

  function addPhoto(file) {
    if ((S.photos || []).length >= 3) { photoStatus('Bạn đã có đủ 3 ảnh.'); return; }
    if (file.type && file.type.indexOf('image/') !== 0) { photoStatus('Tệp này không phải là ảnh. Bạn vui lòng chọn một tấm ảnh nhé.'); return; }
    photoBusy = true;
    drawPhotos();
    photoStatus('Đang xử lý ảnh…');
    var path;
    processPhoto(file).then(function (blob) {
      photoStatus('Đang tải ảnh lên…');
      return api('profile-photo-upload-url').then(function (r) {
        path = r.path;
        return fetch(r.signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=3600', 'x-upsert': 'false' },
          body: blob,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        });
      }).then(function (res) {
        if (!res.ok) throw new Error('Chưa tải được ảnh lên. Bạn vui lòng thử lại nhé.');
        return api('profile-photo-confirm', { path: path });
      });
    }).then(function (data) {
      setPhotoState(data);
      photoStatus('Đã thêm ảnh.');
    }, function (err) {
      photoStatus(err.message || 'Chưa thêm được ảnh. Bạn vui lòng thử lại nhé.');
    }).then(function () {
      photoBusy = false;
      drawPhotos();
    });
  }

  function deletePhoto(path) {
    if (photoBusy) return;
    if (!window.confirm('Xoá ảnh này?')) return;
    photoBusy = true;
    photoStatus('Đang xoá ảnh…');
    api('profile-photo-delete', { path: path }).then(function (data) {
      setPhotoState(data);
      photoStatus('Đã xoá ảnh.');
    }, function (err) { photoStatus(err.message); }).then(function () { photoBusy = false; drawPhotos(); });
  }

  function movePhoto(i, d) {
    if (photoBusy) return;
    var paths = (S.photos || []).map(function (p) { return p.path; });
    var j = i + d;
    if (j < 0 || j >= paths.length) return;
    var t = paths[i]; paths[i] = paths[j]; paths[j] = t;
    photoBusy = true;
    api('profile-photo-order', { paths: paths }).then(function (data) {
      setPhotoState(data);
      photoStatus(j === 0 ? 'Đã đổi ảnh chính.' : 'Đã đổi thứ tự ảnh.');
    }, function (err) { photoStatus(err.message); }).then(function () { photoBusy = false; drawPhotos(); });
  }

  // ---- image processing: EXIF orientation, resize, JPEG re-encode

  function readOrientation(buf) {
    try {
      var v = new DataView(buf);
      if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return 1;
      var off = 2;
      while (off + 4 <= v.byteLength) {
        var marker = v.getUint16(off);
        if ((marker & 0xFF00) !== 0xFF00) return 1;
        var len = v.getUint16(off + 2);
        if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) { // "Exif"
          var tiff = off + 10;
          var little = v.getUint16(tiff) === 0x4949;
          var ifd = tiff + v.getUint32(tiff + 4, little);
          var n = v.getUint16(ifd, little);
          for (var i = 0; i < n; i++) {
            var e = ifd + 2 + i * 12;
            if (v.getUint16(e, little) === 0x0112) return v.getUint16(e + 8, little) || 1;
          }
          return 1;
        }
        if (marker === 0xFFDA) return 1;
        off += 2 + len;
      }
    } catch (e) {}
    return 1;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('Không đọc được ảnh này. Bạn vui lòng chọn một ảnh khác (JPG hoặc PNG).')); };
      img.src = src;
    });
  }

  function readBuffer(file) {
    if (file.arrayBuffer) return file.arrayBuffer();
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    });
  }

  function toBlob(canvas, quality) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) return canvas.toBlob(resolve, 'image/jpeg', quality);
      var bin = atob(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      resolve(new Blob([arr], { type: 'image/jpeg' }));
    });
  }

  // Newer browsers apply EXIF orientation when decoding an <img>; older ones
  // don't. Find out by decoding a tiny 2x1 JPEG tagged "rotate 90°".
  var autoOrientPromise = null;
  function browserAutoOrients() {
    if (autoOrientPromise) return autoOrientPromise;
    var c = document.createElement('canvas');
    c.width = 2; c.height = 1;
    autoOrientPromise = toBlob(c, 0.9).then(readBuffer).then(function (buf) {
      var src = new Uint8Array(buf);
      var app1 = [0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
        0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
      var out = new Uint8Array(src.length + app1.length);
      out.set(src.subarray(0, 2), 0);
      out.set(app1, 2);
      out.set(src.subarray(2), 2 + app1.length);
      var url = URL.createObjectURL(new Blob([out], { type: 'image/jpeg' }));
      return loadImage(url).then(function (img) { URL.revokeObjectURL(url); return img.naturalWidth === 1; });
    }).catch(function () { return true; });
    return autoOrientPromise;
  }

  function processPhoto(file) {
    var url = URL.createObjectURL(file);
    return Promise.all([readBuffer(file), loadImage(url), browserAutoOrients()]).then(function (r) {
      URL.revokeObjectURL(url);
      var img = r[1];
      var o = r[2] ? 1 : readOrientation(r[0]);
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) throw new Error('Không đọc được ảnh này. Bạn vui lòng chọn một ảnh khác.');
      var swap = o >= 5 && o <= 8;
      var ow = swap ? h : w, oh = swap ? w : h;
      var scale = Math.min(1, MAX_EDGE / Math.max(ow, oh));
      var cw = Math.max(1, Math.round(ow * scale)), ch = Math.max(1, Math.round(oh * scale));
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cw, ch);
      var t = { 2: [-1, 0, 0, 1, cw, 0], 3: [-1, 0, 0, -1, cw, ch], 4: [1, 0, 0, -1, 0, ch], 5: [0, 1, 1, 0, 0, 0],
        6: [0, 1, -1, 0, cw, 0], 7: [0, -1, -1, 0, cw, ch], 8: [0, -1, 1, 0, 0, ch] }[o];
      if (t) ctx.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, swap ? ch : cw, swap ? cw : ch);
      return toBlob(canvas, JPEG_QUALITY).then(function (blob) {
        if (blob && blob.size > MAX_UPLOAD_BYTES) return toBlob(canvas, 0.7);
        return blob;
      });
    }, function (err) {
      URL.revokeObjectURL(url);
      throw err;
    }).then(function (blob) {
      if (!blob || blob.size > MAX_UPLOAD_BYTES) throw new Error('Ảnh này quá lớn. Bạn vui lòng chọn một ảnh khác.');
      return blob;
    });
  }

  // ------------------------------------------------------------------ review & consent

  // TODO(James): counsel to approve these three consent texts (version vi-2026-11-profile-v1).
  var CONSENT_TEXT = {
    confirmTrue: 'Tôi xác nhận những thông tin trên là đúng sự thật và do chính tôi viết.',
    profileSharing: 'Không bắt buộc: Tôi đồng ý để Heritage Union cho khách hàng đã hoàn thành bản khai lý lịch xem hồ sơ của tôi, gồm tên hiển thị, tuổi, thành phố/tỉnh và các câu trả lời ở trên. Không bao giờ kèm họ, ngày sinh, số Zalo hay email của tôi. Tôi có thể thay đổi ý định bất cứ lúc nào.',
    photoSharing: 'Không bắt buộc: Tôi đồng ý để những khách hàng nói trên xem ảnh của tôi.',
  };
  var consentState = null;

  function renderReview(body) {
    if (!consentState) {
      consentState = {
        confirmTrue: false, // always unticked: she confirms afresh each time
        profileSharing: !!S.consents.profileSharing,
        photoSharing: !!S.consents.photoSharing,
      };
    }
    for (var n = 1; n <= 5; n++) {
      (function (n) {
        var list = el('dl', { class: 'pf-review-list' });
        if (n <= 4) {
          qsForStep(n).forEach(function (q) {
            if (!isShown(q)) return;
            var txt = formatAnswer(q, answers[q.id]);
            list.appendChild(el('dt', { text: q.label.vi }));
            list.appendChild(el('dd', { class: txt ? '' : 'pf-review-empty', text: txt || (q.required ? 'Chưa trả lời' : 'Không trả lời') }));
          });
        } else {
          var photos = S.photos || [];
          if (photos.length) {
            list.appendChild(el('dd', { class: 'pf-review-thumbs' }, photos.map(function (p, i) { return el('img', { src: p.url || '', alt: 'Ảnh ' + (i + 1) }); })));
          } else {
            list.appendChild(el('dd', { class: 'pf-review-empty', text: 'Không có ảnh' }));
          }
        }
        body.appendChild(el('section', { class: 'pf-review-step', 'aria-label': stepTitle(n) }, [
          el('div', { class: 'pf-review-head' }, [
            el('h2', { text: stepTitle(n) }),
            el('button', { type: 'button', class: 'pf-link-btn', 'aria-label': 'Sửa: ' + stepTitle(n), onclick: function () { goTo(n, true); } }, ['Sửa']),
          ]),
          list,
        ]));
      })(n);
    }

    var hasPhotos = (S.photos || []).length > 0;
    var consents = el('div', { class: 'pf-consents' });
    consents.appendChild(el('h2', { text: 'Sự đồng ý của bạn', style: 'font-size:22px' }));
    function box(key, required) {
      var id = 'consent-' + key;
      var input = el('input', { type: 'checkbox', id: id, 'aria-required': required ? 'true' : null });
      input.checked = !!consentState[key];
      var label = el('label', { class: 'pf-consent' + (input.checked ? ' is-checked' : ''), for: id }, [
        input,
        el('span', null, [CONSENT_TEXT[key], required ? el('span', { class: 'pf-req', 'aria-hidden': 'true', text: ' *' }) : null]),
      ]);
      input.addEventListener('change', function () {
        consentState[key] = input.checked;
        label.classList.toggle('is-checked', input.checked);
        updateWarning();
        formError('');
      });
      consents.appendChild(label);
    }
    box('confirmTrue', true);
    box('profileSharing', false);
    if (hasPhotos) box('photoSharing', false);
    var warn = el('p', { class: 'pf-warning', id: 'pf-photo-warning', role: 'note', hidden: true,
      text: 'Bạn chưa đồng ý cho khách hàng xem ảnh. Khi bạn gửi hồ sơ, ảnh của bạn sẽ bị xoá. Nếu muốn giữ ảnh, bạn hãy đánh dấu ô đồng ý về ảnh ở trên.' });
    var noShare = el('p', { class: 'form-note', id: 'pf-share-note', hidden: true,
      text: 'Nếu bạn không đánh dấu ô thứ hai, chúng tôi sẽ không cho khách hàng xem hồ sơ của bạn, vì vậy bạn khó có thể nhận được lời giới thiệu. Bạn vẫn có thể gửi hồ sơ.' });
    consents.appendChild(noShare);
    consents.appendChild(warn);
    body.appendChild(consents);
    function updateWarning() {
      warn.hidden = !(hasPhotos && !consentState.photoSharing);
      noShare.hidden = !!consentState.profileSharing;
    }
    updateWarning();
  }

  function submit() {
    var missingStep = firstIncompleteStep();
    if (missingStep) {
      goTo(missingStep, true);
      validateStep(missingStep);
      formError('Bạn vui lòng trả lời đủ các câu bắt buộc ở bước này trước khi gửi.');
      return;
    }
    if (!consentState || !consentState.confirmTrue) {
      formError('Bạn vui lòng đánh dấu ô xác nhận thông tin là đúng sự thật và do chính bạn viết.');
      var c = $('consent-confirmTrue');
      if (c) c.focus();
      return;
    }
    var hasPhotos = (S.photos || []).length > 0;
    var photosWillGo = hasPhotos && !consentState.photoSharing;
    if (photosWillGo && !window.confirm('Ảnh của bạn sẽ bị xoá vì bạn chưa đồng ý cho khách hàng xem ảnh. Tiếp tục gửi?')) return;
    var btn = $('pf-next');
    btn.disabled = true;
    formError('');
    save().then(function (ok) {
      if (!ok) throw new Error('Chưa lưu được câu trả lời. Bạn vui lòng bấm “Thử lại” ở trên rồi gửi lại nhé.');
      return api('profile-submit', { consents: {
        confirmTrue: true,
        profileSharing: !!consentState.profileSharing,
        photoSharing: hasPhotos && !!consentState.photoSharing,
      } });
    }).then(function (data) {
      S = data;
      consentState = null;
      $('pf-done-photos').hidden = !photosWillGo;
      show('pf-done');
      window.scrollTo(0, 0);
      $('pf-done-title').focus({ preventScroll: true });
    }, function (err) {
      if (err.fatal) return;
      if (err.data && err.data.step) { goTo(err.data.step, true); validateStep(err.data.step); }
      formError(err.message);
    }).then(function () { btn.disabled = false; });
  }

  $('pf-edit-again').addEventListener('click', function () {
    show('pf-app');
    goTo(6, true);
  });

  // ------------------------------------------------------------------ start

  function applyPrefill() {
    var pre = S.prefill || {};
    function fill(id, value) {
      if (isEmpty(answers[id]) && !isEmpty(value)) { answers[id] = value; dirty[id] = true; }
    }
    fill('display_name', pre.display_name);
    var prov = byId('province');
    if (prov && prov.options.some(function (o) { return o.value === pre.province; })) fill('province', pre.province);
    fill('about', pre.about ? String(pre.about).slice(0, byId('about').max) : '');
    var range = byId('partner_age_range');
    if (range && typeof pre.age === 'number') {
      var lo = Math.max(range.min, pre.age - 5), hi = Math.min(range.max, pre.age + 20);
      fill('partner_age_range', [Math.min(lo, hi), hi]);
    }
  }

  function start() {
    if (!token) { showNoLink(); return; }
    Promise.all([
      fetch('/assets/data/profile-questions.json', { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(); return r.json(); }),
      api('profile-get'),
    ]).then(function (r) {
      Q = r[0];
      S = r[1];
      answers = Object.assign({}, S.answers || {});
      if (S.displayName) answers.display_name = S.displayName;
      applyPrefill();
      show('pf-app');
      goTo(S.resumeStep || 1, false);
    }, function (err) {
      if (err && err.fatal) return;
      $('pf-loading').innerHTML = '';
      $('pf-loading').appendChild(el('p', { text: 'Chưa mở được hồ sơ. Bạn kiểm tra mạng rồi thử lại nhé.' }));
      $('pf-loading').appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md pf-btn', text: 'Thử lại', onclick: function () { window.location.reload(); } }));
    });
  }

  // Last chance to save typed text if she leaves the page or switches app.
  function flushOnLeave() {
    if (!token || !navigator.sendBeacon) return;
    var body = payloadFromDirty();
    if (!Object.keys(body).length) return;
    try {
      navigator.sendBeacon(API + 'profile-save', new Blob([JSON.stringify({ token: token, answers: body })], { type: 'application/json' }));
    } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushOnLeave(); });
  window.addEventListener('pagehide', flushOnLeave);

  start();
})();
