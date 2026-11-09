/* Thank-you page after registration: if the URL fragment carries her private
   profile token (#t=...), show the "complete your profile" button pointing
   at /vi/ho-so#t=..., then remove the token from the address bar so it isn't
   left in history or shown over her shoulder. The fragment is never sent to
   a server. */
(function () {
  var m = /(?:^#|&)t=([A-Za-z0-9_-]{43})(?:&|$)/.exec(window.location.hash || '');
  if (!m) return;
  var token = m[1];
  var cta = document.getElementById('profile-cta');
  var link = document.getElementById('profile-cta-link');
  if (cta && link) {
    link.href = '/vi/ho-so#t=' + token;
    cta.hidden = false;
  }
  try {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (e) {}
})();
