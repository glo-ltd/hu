/* /admin/ team tool for James and Huyen.
 *
 * Sign-in: Supabase Auth email magic link (supabase-js, pinned). The page
 * only ever holds the signed-in user's access token; every read and write
 * goes through admin-* Netlify Functions, which verify that token, check
 * ADMIN_EMAILS and only then use the service role.
 *
 * What the team can do: read, translate, record admin facts (Zalo
 * confirmed, link sent, withdrawn) and delete. What it can't: edit her
 * answers, or rate, tag, score or annotate her. There are no such fields.
 */
(function () {
  'use strict';

  var API = '/.netlify/functions/';
  var NEXT_KEY = 'hu_admin_next';
  var $ = function (id) { return document.getElementById(id); };
  var sb = null;
  var session = null;
  var all = [];
  var filter = 'followup';
  var questions = null;

  // ------------------------------------------------------------------ utils

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k === 'class') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmtDateTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function daysSince(iso) { return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null; }
  function fold(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function flash(message, isError) {
    var f = $('ad-flash');
    f.textContent = message;
    f.className = 'ad-flash' + (isError ? ' is-error' : '');
    f.hidden = !message;
    if (message) setTimeout(function () { if (f.textContent === message) f.hidden = true; }, 6000);
  }
  var STATUS_LABEL = {
    new: 'New', contacted: 'Contacted', profile_in_progress: 'Profile in progress',
    profile_complete: 'Profile complete', withdrawn: 'Withdrawn', deleted: 'Deleted',
  };

  // ------------------------------------------------------------------ api

  function api(name, body) {
    return fetch(API + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session ? session.access_token : '') },
      body: JSON.stringify(body || {}),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) { signedOut(data.error || 'Please sign in again.'); throw new Error(data.error || 'Signed out'); }
        if (!res.ok) throw new Error(data.error || 'Something went wrong.');
        return data;
      });
    });
  }

  // ------------------------------------------------------------------ auth

  function show(id) {
    ['ad-signin', 'ad-list', 'ad-detail', 'ad-clients', 'ad-client-detail'].forEach(function (x) { if ($(x)) $(x).hidden = x !== id; });
    var clientsTab = id === 'ad-clients' || id === 'ad-client-detail';
    document.querySelectorAll('.ad-tab').forEach(function (t) {
      var on = (t.getAttribute('data-tab') === 'clients') === clientsTab;
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
  }

  function signedOut(message) {
    session = null;
    if ($('ad-tabs')) $('ad-tabs').hidden = true;
    $('ad-me').textContent = '';
    $('ad-signout').hidden = true;
    show('ad-signin');
    if (message) $('ad-signin-msg').textContent = message;
  }

  $('ad-signin-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('ad-email').value.trim();
    if (!email) return;
    var target = location.hash.replace('#', '');
    // Remember which candidate the email link pointed to. localStorage (not
    // sessionStorage) because the sign-in link usually opens in a new tab.
    // Only her reference number is kept, and only for an hour.
    try { if (/^(client-)?[0-9a-f-]{36}$|^clients$/i.test(target)) localStorage.setItem(NEXT_KEY, JSON.stringify({ id: target, at: Date.now() })); } catch (err) {}
    $('ad-signin-msg').textContent = 'Sending…';
    sb.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: false, emailRedirectTo: location.origin + '/admin/' },
    }).then(function (r) {
      // Same message either way, so this form can't be used to find out
      // which emails are team accounts.
      if (r.error) console.warn(r.error.message);
      $('ad-signin-msg').textContent = 'If that email belongs to a team member, a sign-in link is on its way. Open it on this device.';
    });
  });

  $('ad-signout').addEventListener('click', function () {
    sb.auth.signOut().then(function () { signedOut('Signed out.'); });
  });

  function onSession(s) {
    session = s;
    if (!s) { signedOut(); return; }
    $('ad-me').textContent = s.user && s.user.email ? s.user.email : '';
    $('ad-signout').hidden = false;
    var next = null;
    try {
      var saved = JSON.parse(localStorage.getItem(NEXT_KEY) || 'null');
      localStorage.removeItem(NEXT_KEY);
      if (saved && /^(client-)?[0-9a-f-]{36}$|^clients$/i.test(saved.id) && Date.now() - saved.at < 3600000) next = saved.id;
    } catch (err) {}
    $('ad-tabs').hidden = false;
    if (next && !/^#(client-)?[0-9a-f-]{36}$/i.test(location.hash)) { location.hash = next; return; }
    route();
  }

  // ------------------------------------------------------------------ routing

  function currentId() {
    var h = location.hash.replace('#', '');
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(h) ? h : null;
  }

  function route() {
    if (!session) return;
    if (/^#client/.test(location.hash) && window.HUClients) { window.HUClients.route(location.hash); return; }
    var id = currentId();
    if (id) loadDetail(id); else loadList();
  }
  window.addEventListener('hashchange', route);

  // ------------------------------------------------------------------ list

  function matchesFilter(c) {
    switch (filter) {
      case 'followup': return (c.status === 'new' || c.status === 'contacted') && !c.zaloConfirmedAt;
      case 'in_progress': return c.status === 'profile_in_progress';
      case 'complete': return c.status === 'profile_complete';
      case 'withdrawn': return c.status === 'withdrawn';
      default: return true;
    }
  }

  function card(c) {
    var badges = [el('span', { class: 'ad-badge ad-badge--status', text: STATUS_LABEL[c.status] || c.status })];
    if (c.status === 'withdrawn') {
      var d = daysSince(c.withdrawnAt);
      badges.push(el('span', { class: 'ad-badge ' + (d !== null && d > 21 ? 'ad-badge--danger' : 'ad-badge--warn'),
        text: d === null ? 'Withdrawn' : 'Withdrawn ' + d + ' day' + (d === 1 ? '' : 's') + ' ago · delete by day 30' }));
    }
    badges.push(c.zaloConfirmedAt ? el('span', { class: 'ad-badge ad-badge--ok', text: '✓ Zalo confirmed' }) : el('span', { class: 'ad-badge', text: 'Zalo not confirmed' }));
    if (c.linkSentAt && !c.zaloConfirmedAt) badges.push(el('span', { class: 'ad-badge', text: 'Link sent ' + fmtDate(c.linkSentAt) }));
    badges.push(el('span', { class: 'ad-badge' + (c.sharingConsent ? ' ad-badge--ok' : ''), text: c.sharingConsent ? 'Sharing: yes' : 'Sharing: no' }));
    if (c.photoCount) badges.push(el('span', { class: 'ad-badge' + (c.photoConsent ? ' ad-badge--ok' : ' ad-badge--warn'), text: c.photoCount + ' photo' + (c.photoCount > 1 ? 's' : '') + (c.photoConsent ? ' · consented' : ' · no consent') }));
    var progress = c.submittedAt ? 'Submitted ' + fmtDate(c.submittedAt) : 'Profile ' + c.stepsComplete + '/4 steps';
    return el('button', { type: 'button', class: 'ad-card', onclick: function () { location.hash = c.id; } }, [
      el('div', { class: 'ad-card-top' }, [
        el('span', { class: 'ad-card-name', lang: 'vi', text: c.name || '—' }),
        el('span', { class: 'ad-card-sub', text: 'Registered ' + fmtDate(c.createdAt) }),
      ]),
      el('span', { class: 'ad-card-sub', lang: 'vi', text: (c.province || '') }),
      el('div', { class: 'ad-progress', 'aria-label': progress }, [el('span', { style: 'width:' + (c.submittedAt ? 100 : c.stepsComplete * 25) + '%' })]),
      el('span', { class: 'ad-card-sub', text: progress }),
      el('div', { class: 'ad-badges' }, badges),
    ]);
  }

  function drawList() {
    var q = fold($('ad-search').value.trim());
    var qDigits = q.replace(/\D/g, '');
    var rows = all.filter(matchesFilter).filter(function (c) {
      if (!q) return true;
      return fold(c.name).indexOf(q) !== -1 || fold(c.fullName).indexOf(q) !== -1 ||
        (qDigits.length >= 3 && String(c.zalo || '').indexOf(qDigits) !== -1);
    });
    var box = $('ad-cards');
    box.innerHTML = '';
    rows.forEach(function (c) { box.appendChild(card(c)); });
    $('ad-count').textContent = rows.length + ' of ' + all.length + ' candidates';
    if (!rows.length) box.appendChild(el('p', { class: 'form-note', text: 'Nobody here.' }));
  }

  document.querySelectorAll('.ad-filter').forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.getAttribute('data-filter');
      document.querySelectorAll('.ad-filter').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      drawList();
    });
  });
  $('ad-search').addEventListener('input', drawList);

  function loadList() {
    show('ad-list');
    $('ad-count').textContent = 'Loading…';
    api('admin-list').then(function (d) {
      all = d.candidates || [];
      drawList();
    }, function (err) { flash(err.message, true); });
  }

  // ------------------------------------------------------------------ detail

  function loadDetail(id) {
    var box = $('ad-detail');
    show('ad-detail');
    box.innerHTML = '';
    box.appendChild(el('p', { text: 'Loading…' }));
    api('admin-candidate', { id: id }).then(function (d) {
      questions = d.questions;
      drawDetail(d);
    }, function (err) {
      box.innerHTML = '';
      box.appendChild(el('p', { class: 'ad-flash is-error', text: err.message }));
      box.appendChild(el('button', { type: 'button', class: 'ad-link', text: '← Back to list', onclick: function () { location.hash = ''; } }));
    });
  }

  function optionLabel(q, v, lang) {
    var o = (q.options || []).filter(function (x) { return x.value === v; })[0];
    return o ? o.label[lang] : v;
  }

  // Her answer exactly as she gave it: free text verbatim; choices shown in
  // Vietnamese (as she saw them) with the English label alongside.
  function answerText(q, v) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return null;
    if (q.type === 'single') return optionLabel(q, v, 'vi') + ' (' + optionLabel(q, v, 'en') + ')';
    if (q.type === 'multi') return v.map(function (x) { return optionLabel(q, x, 'vi') + ' (' + optionLabel(q, x, 'en') + ')'; }).join(', ');
    if (q.type === 'range') return v[0] + '–' + v[1];
    if (q.type === 'languages') return v.map(function (x) {
      var lv = (q.levels || []).filter(function (l) { return l.value === x.level; })[0];
      return (x.language === 'other' ? x.other : optionLabel(q, x.language, 'en')) + ' (' + (lv ? lv.label.en.toLowerCase() : x.level) + ')';
    }).join(', ');
    return String(v);
  }

  function isShown(q, answers) {
    if (!q.showIf) return true;
    var v = answers[q.showIf.id];
    return typeof v === 'number' && v >= q.showIf.min;
  }

  function dl(pairs) {
    var d = el('dl', { class: 'ad-dl' });
    pairs.forEach(function (p) {
      d.appendChild(el('dt', { text: p[0] }));
      d.appendChild(el('dd', { lang: p[2] || null, text: p[1] === null || p[1] === undefined || p[1] === '' ? '—' : String(p[1]) }));
    });
    return d;
  }

  function drawDetail(d) {
    var c = d.candidate;
    var p = d.profile;
    var answers = (p && p.answers) || {};
    var translations = (p && p.translations) || {};
    var box = $('ad-detail');
    box.innerHTML = '';
    var name = (p && p.display_name) || c.given_name;

    box.appendChild(el('div', { class: 'ad-detail-head' }, [
      el('button', { type: 'button', class: 'ad-link', text: '← All candidates', onclick: function () { location.hash = ''; } }),
    ]));
    box.appendChild(el('div', { class: 'ad-detail-head' }, [
      el('h1', { lang: 'vi', text: name }),
      el('div', { class: 'ad-badges' }, [
        el('span', { class: 'ad-badge ad-badge--status', text: STATUS_LABEL[c.status] || c.status }),
        c.zalo_confirmed_at ? el('span', { class: 'ad-badge ad-badge--ok', text: '✓ Zalo confirmed ' + fmtDate(c.zalo_confirmed_at) }) : el('span', { class: 'ad-badge', text: 'Zalo not confirmed' }),
      ]),
    ]));

    var left = el('div', { class: 'ad-grid-col', style: 'display:grid;gap:12px' });
    var right = el('div', { class: 'ad-grid-col', style: 'display:grid;gap:12px' });
    box.appendChild(el('div', { class: 'ad-grid' }, [left, right]));

    // Registration details
    left.appendChild(el('section', { class: 'ad-section' }, [
      el('h2', { text: 'Registration details' }),
      dl([
        ['Full name', c.full_name, 'vi'],
        ['Date of birth', c.date_of_birth ? c.date_of_birth + ' (age ' + c.age + ')' : null],
        ['Province', c.province, 'vi'],
        ['Zalo', c.zalo_number],
        ['Email', c.email],
        ['Language', c.preferred_language === 'vi' ? 'Vietnamese' : 'English'],
        ['Source', c.source],
        ['Registered', fmtDateTime(c.created_at)],
        ['Consent: contact', fmtDateTime(c.consent_contact_at)],
        ['Consent: processing', fmtDateTime(c.consent_processing_at)],
        ['Consent text version', c.consent_text_version],
        ['Consent: show profile to clients', c.consent_profile_sharing_at ? fmtDateTime(c.consent_profile_sharing_at) : 'Not given'],
        ['Consent: show photos to clients', p && p.consent_photo_sharing_at ? fmtDateTime(p.consent_photo_sharing_at) : 'Not given'],
        ['Profile consent version', p && p.consent_profile_text_version],
        ['Confirmed true', p && p.confirmed_true_at ? fmtDateTime(p.confirmed_true_at) : null],
        ['Profile submitted', p && p.submitted_at ? fmtDateTime(p.submitted_at) : 'Not yet'],
        ['Profile link sent', fmtDateTime(c.profile_link_sent_at)],
        ['Profile link expires', fmtDateTime(c.profile_token_expires_at)],
        c.status === 'withdrawn' ? ['Withdrawn', fmtDateTime(c.withdrawn_at) + ' (' + daysSince(c.withdrawn_at) + ' days ago)'] : null,
      ].filter(Boolean)),
      el('h3', { text: 'What she wrote at registration' }),
      el('p', { class: 'ad-a', lang: 'vi', text: c.about_text || '' }),
    ]));

    // Her answers
    var ans = el('section', { class: 'ad-section' }, [el('h2', { text: 'Her answers' })]);
    if (!p) ans.appendChild(el('p', { class: 'ad-empty', text: 'She has not started her profile yet.' }));
    else {
      ans.appendChild(el('p', { class: 'form-note', text: 'Shown as she wrote them. The team can add English translations below free-text answers, but cannot change her answers.' }));
      questions.steps.forEach(function (s) {
        if (s.step > 4) return;
        ans.appendChild(el('h3', { text: s.step + '. ' + s.title.en }));
        questions.questions.filter(function (q) { return q.step === s.step && isShown(q, answers); }).forEach(function (q) {
          var v = q.id === 'display_name' ? p.display_name : answers[q.id];
          var txt = answerText(q, v);
          var block = el('div', { class: 'ad-answer' }, [
            el('span', { class: 'ad-q', text: (q.label.team || q.label.en) }),
            el('span', { class: 'ad-a' + (txt ? '' : ' ad-empty'), lang: txt ? 'vi' : null, text: txt || 'No answer' }),
          ]);
          if (txt && (q.type === 'textarea' || (q.type === 'text' && q.id !== 'display_name'))) block.appendChild(translateBox(c.id, q, translations, p));
          ans.appendChild(block);
        });
      });
    }
    left.appendChild(ans);

    // Photos
    var ph = el('section', { class: 'ad-section' }, [el('h2', { text: 'Photos' })]);
    if (d.photos && d.photos.length) {
      ph.appendChild(el('div', { class: 'ad-photos' }, d.photos.map(function (x, i) { return el('img', { src: x.url || '', alt: 'Photo ' + (i + 1) + (i === 0 ? ' (main)' : '') }); })));
      ph.appendChild(el('p', { class: 'form-note', text: p.consent_photo_sharing_at ? 'She consented to clients seeing her photos.' : 'No photo consent yet. If she submits without it, these are deleted.' }));
    } else ph.appendChild(el('p', { class: 'ad-empty', text: 'No photos.' }));
    left.appendChild(ph);

    right.appendChild(actions(c, name));
    right.appendChild(clientPreview(c, p, d.photos, translations));
  }

  function translateBox(id, q, translations, p) {
    var tid = 'tr-' + q.id;
    var ta = el('textarea', { class: 'form-textarea', id: tid, maxlength: 4000 });
    ta.value = translations[q.id] || '';
    var meta = el('span', { text: translations[q.id] && p.translated_by ? 'Last saved by ' + p.translated_by + ', ' + fmtDateTime(p.translated_at) : '' });
    var btn = el('button', { type: 'button', class: 'btn btn--secondary btn--sm', text: 'Save translation' });
    btn.addEventListener('click', function () {
      var t = {}; t[q.id] = ta.value;
      btn.disabled = true;
      api('admin-translate', { id: id, translations: t }).then(function (r) {
        translations[q.id] = r.translations[q.id];
        p.translated_by = r.translated_by; p.translated_at = r.translated_at;
        meta.textContent = 'Saved by ' + r.translated_by + ', ' + fmtDateTime(r.translated_at);
      }, function (err) { meta.textContent = err.message; }).then(function () { btn.disabled = false; });
    });
    return el('div', { class: 'ad-translate' }, [el('label', { for: tid, text: 'English translation' }), ta, el('div', { class: 'ad-translate-row' }, [btn, meta])]);
  }

  function actions(c, name) {
    var sec = el('section', { class: 'ad-section' }, [el('h2', { text: 'Actions' })]);
    var list = el('div', { class: 'ad-actions' });
    var withdrawn = c.status === 'withdrawn';
    if (!withdrawn) {
      list.appendChild(el('button', { type: 'button', class: 'btn btn--primary btn--md', text: 'Copy Zalo message (new private link)', onclick: function (e) { copyZalo(c, e.currentTarget); } }));
      list.appendChild(el('p', { class: 'form-note', text: 'Makes a new link and stops the old one working. Last sent: ' + fmtDateTime(c.profile_link_sent_at) + '.' }));
      list.appendChild(c.zalo_confirmed_at
        ? el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Undo Zalo confirmed', onclick: function () { setStatus(c.id, 'zalo_unconfirm', 'Zalo confirmation removed.'); } })
        : el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: '✓ Mark Zalo confirmed', onclick: function () { setStatus(c.id, 'zalo_confirm', 'Marked Zalo confirmed.'); } }));
      list.appendChild(el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Mark withdrawn (she asked on Zalo)', onclick: function () {
        confirmModal('Mark ' + name + ' as withdrawn?', 'Her private link stops working, her sharing consents are cleared and her photos are deleted now. Delete her record within 30 days.', 'Mark withdrawn', function () {
          setStatus(c.id, 'withdraw', 'Marked withdrawn. Photos deleted. Delete her record within 30 days.');
        });
      } }));
    } else {
      var days = daysSince(c.withdrawn_at);
      list.appendChild(el('p', { class: days > 21 ? 'ad-preview-no' : 'form-note', text: 'Withdrawn ' + days + ' days ago. We promised to delete her data within 30 days.' }));
    }
    list.appendChild(el('button', { type: 'button', class: 'btn btn--danger btn--md', text: 'Delete permanently…', onclick: function () { deleteModal(c, name); } }));
    sec.appendChild(list);
    sec.appendChild(el('div', { id: 'ad-copy-area' }));
    return sec;
  }

  function setStatus(id, action, done) {
    api('admin-status', { id: id, action: action }).then(function () { flash(done); loadDetail(id); }, function (err) { flash(err.message, true); });
  }

  function copyZalo(c, btn) {
    btn.disabled = true;
    var area = $('ad-copy-area');
    area.innerHTML = '';
    api('admin-link', { id: c.id }).then(function (r) {
      c.profile_link_sent_at = r.sentAt;
      var ta = el('textarea', { class: 'form-textarea ad-copybox', readonly: true, 'aria-label': 'Zalo message', lang: 'vi' });
      ta.value = r.message;
      var note = el('p', { class: 'form-note', role: 'status' });
      area.appendChild(note);
      area.appendChild(ta);
      function manual() {
        note.textContent = 'Copy didn’t work on this phone. The message is selected below: long-press and choose Copy, then paste it into Zalo.';
        ta.focus(); ta.select();
        try { ta.setSelectionRange(0, ta.value.length); } catch (e) {}
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(r.message).then(function () {
          note.textContent = 'Copied. Paste it into Zalo. The previous link no longer works. (The message is also below.)';
        }, function () {
          try { ta.select(); if (document.execCommand('copy')) { note.textContent = 'Copied. Paste it into Zalo.'; return; } } catch (e) {}
          manual();
        });
      } else {
        try { ta.select(); if (document.execCommand('copy')) { note.textContent = 'Copied. Paste it into Zalo.'; return; } } catch (e) {}
        manual();
      }
    }, function (err) { flash(err.message, true); }).then(function () { btn.disabled = false; });
  }

  // ------------------------------------------------------------------ modals

  function openModal(title, body) {
    $('ad-modal-title').textContent = title;
    var b = $('ad-modal-body');
    b.innerHTML = '';
    body.forEach(function (x) { b.appendChild(x); });
    $('ad-modal').hidden = false;
    var f = b.querySelector('input, button');
    if (f) f.focus();
  }
  function closeModal() { $('ad-modal').hidden = true; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  function confirmModal(title, text, okText, onOk) {
    openModal(title, [
      el('p', { text: text }),
      el('div', { class: 'ad-modal-row' }, [
        el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Cancel', onclick: closeModal }),
        el('button', { type: 'button', class: 'btn btn--primary btn--md', text: okText, onclick: function () { closeModal(); onOk(); } }),
      ]),
    ]);
  }

  function deleteModal(c, name) {
    var input = el('input', { class: 'form-input', type: 'text', id: 'ad-del-name', autocomplete: 'off', lang: 'vi' });
    var msg = el('p', { class: 'pf-error', role: 'alert', style: 'color:#8A3A36' });
    var ok = el('button', { type: 'button', class: 'btn btn--danger btn--md', text: 'Delete permanently' });
    ok.addEventListener('click', function () {
      ok.disabled = true;
      api('admin-delete', { id: c.id, confirmName: input.value }).then(function () {
        closeModal();
        flash('Deleted permanently, including photos.');
        location.hash = '';
      }, function (err) { msg.textContent = err.message; ok.disabled = false; });
    });
    openModal('Delete ' + name + ' permanently?', [
      el('p', { text: 'This deletes her photos and her whole record (registration and profile). It cannot be undone. Use this for the 30-day deletion promise.' }),
      el('label', { class: 'form-label', for: 'ad-del-name', text: 'Type her first name (' + name + ') to confirm' }),
      input, msg,
      el('div', { class: 'ad-modal-row' }, [el('button', { type: 'button', class: 'btn btn--secondary btn--md', text: 'Cancel', onclick: closeModal }), ok]),
    ]);
  }

  // ------------------------------------------------------------------ client preview (internal)

  function clientPreview(c, p, photos, translations) {
    var sec = el('section', { class: 'ad-section' }, [
      el('h2', { text: 'Client preview (internal only)' }),
      el('p', { class: 'ad-preview-banner', role: 'note', text: 'Internal preview. No profile may be shown to clients until the client IMBRA disclosure process exists.' }),
    ]);
    if (!c.consent_profile_sharing_at) {
      sec.appendChild(el('p', { class: 'ad-preview-no', text: 'Not consented: must not be shown to clients.' }));
      return sec;
    }
    if (!p || !p.submitted_at) {
      sec.appendChild(el('p', { class: 'ad-empty', text: 'She has not submitted her profile yet.' }));
      return sec;
    }
    var answers = p.answers || {};
    // Only what the consent covers: display name, age, province, her answers
    // (with translations), and photos only with photo consent. Never
    // surname, date of birth, Zalo or email.
    var cardBox = el('div', { class: 'ad-preview-card' }, [
      el('span', { class: 'ad-card-name', lang: 'vi', text: (p.display_name || '') + ', ' + c.age }),
      el('span', { class: 'ad-card-sub', lang: 'vi', text: answers.province || '' }),
    ]);
    if (p.consent_photo_sharing_at && photos && photos.length) {
      cardBox.appendChild(el('div', { class: 'ad-photos' }, photos.map(function (x, i) { return el('img', { src: x.url || '', alt: 'Photo ' + (i + 1) }); })));
    } else if (photos && photos.length) {
      cardBox.appendChild(el('p', { class: 'form-note', text: 'Photos hidden: no photo consent.' }));
    }
    questions.questions.forEach(function (q) {
      if (q.step > 4 || q.id === 'display_name' || q.id === 'province' || !isShown(q, answers)) return;
      var txt = answerText(q, answers[q.id]);
      if (!txt) return;
      var parts = [el('span', { class: 'ad-q', text: (q.label.team || q.label.en) }), el('span', { class: 'ad-a', lang: 'vi', text: txt })];
      if (translations[q.id]) parts.push(el('span', { class: 'ad-a', text: 'EN: ' + translations[q.id] }));
      else if (q.type === 'textarea' || q.type === 'text') parts.push(el('span', { class: 'ad-empty', text: 'No English translation yet.' }));
      cardBox.appendChild(el('div', { class: 'ad-answer' }, parts));
    });
    sec.appendChild(cardBox);
    return sec;
  }

  // ------------------------------------------------------------------ start

  function start() {
    fetch(API + 'admin-config').then(function (r) { return r.json(); }).then(function (cfg) {
      if (!cfg.supabaseUrl || !window.supabase) throw new Error(cfg.error || 'Sign-in is not available.');
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
      });
      sb.auth.onAuthStateChange(function (event, s) {
        if (event === 'SIGNED_OUT') { signedOut(); return; }
        if (s && (!session || s.access_token !== session.access_token)) {
          var first = !session;
          session = s;
          if (first) onSession(s);
        }
      });
      return sb.auth.getSession().then(function (r) {
        if (r.data && r.data.session) { if (!session) onSession(r.data.session); } else signedOut();
      });
    }).catch(function (err) {
      show('ad-signin');
      $('ad-signin-msg').textContent = err.message || 'Sign-in is not available.';
    });
  }

  // Shared with the Clients tab (admin/clients.js).
  window.HUAdmin = { api: api, el: el, flash: flash, fmtDate: fmtDate, fmtDateTime: fmtDateTime, daysSince: daysSince, show: show, fold: fold, me: function () { return session && session.user ? session.user.email : ''; } };

  start();
})();
