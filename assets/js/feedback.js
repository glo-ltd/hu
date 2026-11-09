/* R21 feedback form (/feedback#t=<token>). Token from the fragment, kept in
   sessionStorage, removed from the address bar. Nothing is ever published
   without the written permission chosen here. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'hu_feedback_token';
  var token = null;
  var m = /(?:^#|&)t=([A-Za-z0-9_-]{43})/.exec(location.hash || '');
  if (m) { token = m[1]; try { sessionStorage.setItem(KEY, token); } catch (e) {} try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  else { try { token = sessionStorage.getItem(KEY); } catch (e) {} }
  var rating = 0;
  function api(name, body) {
    return fetch('/.netlify/functions/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify(Object.assign({ token: token }, body || {})) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error(d.error || 'Something went wrong. Please try again.'); e.status = r.status; throw e; } return d; }); });
  }
  function fail(text) { $('fb-loading').hidden = true; $('fb-form').hidden = true; $('fb-message').hidden = false; $('fb-text').textContent = text; }
  if (!token) { fail('This page opens only with the private link in our email. You can always write to team@heritage-union.com.'); return; }
  api('feedback-get').then(function (d) {
    $('fb-loading').hidden = true;
    $('fb-form').hidden = false;
    $('fb-hello').textContent = 'Thank you, ' + d.firstName;
    var g = $('fb-rating');
    [1, 2, 3, 4, 5].forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cl-chip fb-star'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.textContent = n; b.setAttribute('aria-label', n + ' out of 5');
      b.addEventListener('click', function () { rating = n; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); });
      g.appendChild(b);
    });
    var perm = $('fb-perm');
    d.options.forEach(function (o, i) {
      var id = 'fb-p-' + o.value;
      var label = document.createElement('label');
      label.className = 'cl-check'; label.setAttribute('for', id);
      var r = document.createElement('input');
      r.type = 'radio'; r.name = 'permission'; r.id = id; r.value = o.value; r.checked = i === 0;
      r.addEventListener('change', function () {
        var none = r.value === 'none';
        $('fb-agree-row').hidden = none;
        $('fb-agree').checked = false;
        $('fb-agree-text').textContent = none ? '' : d.permissionText + ' ' + o.label + '.';
      });
      var span = document.createElement('span');
      span.textContent = o.value === 'none' ? o.label : 'Yes, with ' + o.label;
      label.appendChild(r); label.appendChild(span);
      perm.appendChild(label);
    });
  }, function (e) { fail(e.message); });
  $('fb-agree').addEventListener('change', function () { $('fb-error').textContent = ''; });
  $('fb-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('fb-error');
    err.textContent = '';
    var p = (document.querySelector('input[name="permission"]:checked') || {}).value || 'none';
    if (!rating) { err.textContent = 'Please choose a rating from 1 to 5.'; return; }
    if (p !== 'none' && !$('fb-agree').checked) { err.textContent = 'Please tick the box to give written permission, or choose "Please don\'t publish it".'; return; }
    $('fb-send').disabled = true;
    api('feedback-submit', { rating: rating, comments: $('fb-comments').value, permission: p, agree: $('fb-agree').checked }).then(function () {
      $('fb-form').hidden = true; $('fb-done').hidden = false; $('fb-done').focus();
    }, function (x) { err.textContent = x.message; $('fb-send').disabled = false; });
  });
})();
