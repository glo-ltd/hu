/* Thank-you page after registration: if the URL fragment carries her private
   profile token (#t=...), show the "complete your profile" button, then
   remove the token from the address bar so it isn't left in history or shown
   over her shoulder. The fragment is never sent to a server.
   The button opens the form in the language she chose when registering
   (&l=en -> /my-profile, &l=vi -> /vi/ho-so); without that, the page's own
   language decides. She can switch language on the form itself. */
(function () {
  var hash = window.location.hash || '';
  var m = /(?:^#|&)t=([A-Za-z0-9_-]{43})(?:&|$)/.exec(hash);
  if (!m) return;
  var token = m[1];
  var l = /(?:^#|&)l=(en|vi)(?:&|$)/.exec(hash);
  var lang = l ? l[1] : (String(document.documentElement.lang || '').slice(0, 2) === 'en' ? 'en' : 'vi');
  var cta = document.getElementById('profile-cta');
  var link = document.getElementById('profile-cta-link');
  if (cta && link) {
    link.href = (lang === 'en' ? '/my-profile#t=' : '/vi/ho-so#t=') + token;
    cta.hidden = false;
  }
  try {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (e) {}
})();
