/* F1 enquiry form on /contact. Saves to Supabase through client-enquiry.
   Women are pointed to registration and nothing is sent. Turnstile is used
   whenever its site key is configured. */
(function () {
  'use strict';
  var form = document.getElementById('enquiry-form');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var errorEl = $('enq-error');
  var submit = $('enq-submit');
  var turnstileId = null;
  var siteKey = null;

  function iAm() { var c = form.querySelector('input[name="iAm"]:checked'); return c ? c.value : ''; }

  function sync() {
    var who = iAm();
    $('enq-woman').hidden = who !== 'woman';
    $('enq-fields').hidden = who === 'woman';
    $('enq-age-field').hidden = who === 'other';
    $('enq-age').required = who === 'client';
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'iAm') sync(); });
  sync();

  function loadTurnstile() {
    fetch('/.netlify/functions/candidate-signup-status').then(function (r) { return r.json(); }).then(function (s) {
      if (!s || !s.turnstileSiteKey) return;
      siteKey = s.turnstileSiteKey;
      var el = document.createElement('script');
      el.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      el.async = true;
      el.onload = function () { if (window.turnstile) turnstileId = window.turnstile.render('#enq-turnstile', { sitekey: siteKey }); };
      document.head.appendChild(el);
    }).catch(function () {});
  }
  loadTurnstile();

  function showError(msg, field) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
    form.querySelectorAll('[aria-invalid]').forEach(function (x) { x.removeAttribute('aria-invalid'); });
    var f = field && form.querySelector('[name="' + field + '"]');
    if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var who = iAm();
    if (!who) return showError('Please tell us who you are.', 'iAm');
    if (who === 'woman') return;
    var v = function (n) { var x = form.elements[n]; return x ? x.value.trim() : ''; };
    if (!v('fullName')) return showError('Please enter your full name.', 'fullName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) return showError('Please check your email address.', 'email');
    if (!v('country')) return showError('Please enter your country of residence.', 'country');
    if (who === 'client' && !(Number(v('age')) >= 18 && Number(v('age')) <= 99)) return showError('Please enter your age (you must be 18 or over).', 'age');
    if (!v('message')) return showError('Please write a short message.', 'message');
    if (!form.elements.consent.checked) return showError('Please confirm you agree to be contacted and to our Privacy Policy.', 'consent');
    var token = siteKey && window.turnstile && turnstileId !== null ? window.turnstile.getResponse(turnstileId) : '';
    if (siteKey && !token) return showError('Please complete the verification above.');
    errorEl.classList.remove('visible');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    fetch('/.netlify/functions/client-enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        iAm: who, fullName: v('fullName'), email: v('email'), country: v('country'), age: v('age') ? Number(v('age')) : null,
        phone: v('phone'), source: v('source'), message: v('message'), consent: form.elements.consent.checked,
        website: v('website'), turnstileToken: token,
      }),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var er = new Error(d.error || 'Something went wrong. Please try again.'); er.field = d.field; throw er; } return d; });
    }).then(function (d) {
      if (d.mode === 'other') $('enq-success-text').textContent = 'Your message has reached us, and we will reply as soon as we can.';
      form.hidden = true;
      $('enq-success').hidden = false;
      $('enq-success').focus();
    }).catch(function (err) {
      showError(err.message, err.field);
      submit.disabled = false;
      submit.textContent = 'Send enquiry';
      if (window.turnstile && turnstileId !== null) window.turnstile.reset(turnstileId);
    });
  });
})();
