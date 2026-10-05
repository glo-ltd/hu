/* Heritage Union — Site JavaScript */

(function () {
  'use strict';

  /* ---- Sticky nav ---- */
  var nav = document.getElementById('site-nav');
  function onScroll() {
    if (window.pageYOffset > 12) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById('nav-menu-btn');
  var mobileMenu = document.getElementById('nav-mobile');
  var menuIconOpen = document.getElementById('icon-menu');
  var menuIconClose = document.getElementById('icon-close');

  function toggleMenu() {
    var isOpen = mobileMenu.classList.toggle('open');
    nav.classList.toggle('menu-open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuIconOpen.style.display = isOpen ? 'none' : 'block';
    menuIconClose.style.display = isOpen ? 'block' : 'none';
  }

  menuBtn.addEventListener('click', toggleMenu);

  /* ---- Smooth scroll ---- */
  function scrollToId(id, offset) {
    offset = offset || 70;
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function scrollToBook() { scrollToId('book', 16); }
  function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  /* nav links — prevent default href jump, use smooth scroll instead */
  document.querySelectorAll('[data-scroll-to]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var target = el.getAttribute('data-scroll-to');
      if (target === 'top') {
        scrollToTop();
      } else if (target === 'book') {
        scrollToBook();
      } else {
        scrollToId(target);
      }
      /* close mobile menu if open */
      if (mobileMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  /* ---- Nav "About" dropdown ---- */
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var btn = dropdown.querySelector('.nav-dropdown-btn');
    if (!btn) return;

    function close() {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      var isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });
    dropdown.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); btn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) close();
    });
  });

  /* ---- FAQ accordion ---- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item, idx) {
    var btn = item.querySelector('.faq-btn');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      /* close all */
      faqItems.forEach(function (i) { i.classList.remove('open'); });
      /* open clicked if it was closed */
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* ---- Calendly inline widget ---- */
  var calUrl = 'https://calendly.com/james-heritage-union/30min'
    + '?hide_event_type_details=1'
    + '&primary_color=4a2023&text_color=16202e&background_color=ffffff';

  var calWrap = document.getElementById('calendly-embed');
  if (calWrap) {
    if (window.Calendly) {
      window.Calendly.initInlineWidget({ url: calUrl, parentElement: calWrap });
    } else {
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      s.addEventListener('load', function () {
        if (window.Calendly && calWrap) {
          window.Calendly.initInlineWidget({ url: calUrl, parentElement: calWrap });
        }
      });
      document.body.appendChild(s);
    }
  }

  /* ---- Fee structure request form ---- */
  var feeForm = document.getElementById('fee-structure-form');
  if (feeForm) {
    var feeSubmitBtn = document.getElementById('fee-form-submit');
    var feeErrorEl = document.getElementById('fee-form-error');
    var feeSuccessEl = document.getElementById('fee-form-success');
    var feeSubmitDefaultText = feeSubmitBtn.textContent;

    function showFeeError(message) {
      feeErrorEl.textContent = message;
      feeErrorEl.classList.add('visible');
    }

    function hideFeeError() {
      feeErrorEl.textContent = '';
      feeErrorEl.classList.remove('visible');
    }

    feeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideFeeError();

      var name = feeForm.elements.name.value.trim();
      var email = feeForm.elements.email.value.trim();
      var country = feeForm.elements.country.value.trim();
      var website = feeForm.elements.website ? feeForm.elements.website.value : '';

      if (!name || !email || !country) {
        showFeeError('Please complete all fields.');
        return;
      }

      feeSubmitBtn.disabled = true;
      feeSubmitBtn.textContent = 'Sending...';

      fetch('/.netlify/functions/request-fee-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, country: country, website: website })
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || 'Something went wrong. Please try again.');
            }
            return data;
          });
        })
        .then(function () {
          feeForm.style.display = 'none';
          feeSuccessEl.style.display = 'block';
        })
        .catch(function (err) {
          showFeeError(err.message || 'We could not send the document right now. Please try again shortly.');
          feeSubmitBtn.disabled = false;
          feeSubmitBtn.textContent = feeSubmitDefaultText;
        });
    });
  }

  /* ---- Candidate registration (become-a-candidate page) ---- */
  var waitlistForm = document.getElementById('candidate-waitlist-form');
  var registerForm = document.getElementById('candidate-register-form');
  if (waitlistForm || registerForm) {
    var isViPage = document.documentElement.lang === 'vi';
    var waitlistWrap = document.getElementById('candidate-waitlist-wrap');
    var registerWrap = document.getElementById('candidate-register-wrap');
    var turnstileContainer = document.getElementById('reg-turnstile') || document.getElementById('reg-turnstile-vi');
    var aboutField = document.getElementById('reg-about') || document.getElementById('reg-about-vi');
    var aboutCount = document.getElementById('reg-about-count') || document.getElementById('reg-about-count-vi');
    var turnstileWidgetId = null;

    var genericError = isViPage ? 'Đã có lỗi xảy ra. Vui lòng thử lại.' : 'Something went wrong. Please try again.';

    /* Prefill "source" from ?src= query param */
    var validSources = ['facebook_group', 'friend', 'search', 'other'];
    if (registerForm && registerForm.elements.source) {
      var srcParam = new URLSearchParams(window.location.search).get('src');
      if (srcParam && validSources.indexOf(srcParam) !== -1) {
        registerForm.elements.source.value = srcParam;
      }
    }

    /* Character counter for the "about" textarea */
    if (aboutField && aboutCount) {
      aboutField.addEventListener('input', function () {
        aboutCount.textContent = String(aboutField.value.length);
      });
    }

    function loadTurnstile(siteKey) {
      if (!siteKey || !turnstileContainer) return;
      function render() {
        if (window.turnstile && turnstileContainer && turnstileWidgetId === null) {
          turnstileWidgetId = window.turnstile.render(turnstileContainer, { sitekey: siteKey });
        }
      }
      if (window.turnstile) {
        render();
      } else {
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        s.defer = true;
        s.addEventListener('load', render);
        document.body.appendChild(s);
      }
    }

    /* Ask the server whether registrations are open. Fails safe: if this
       request fails or is slow, the waitlist form (the default markup)
       just stays visible. */
    fetch('/.netlify/functions/candidate-signup-status')
      .then(function (response) { return response.json(); })
      .then(function (status) {
        if (status && status.open) {
          if (waitlistWrap) waitlistWrap.hidden = true;
          if (registerWrap) registerWrap.hidden = false;
          loadTurnstile(status.turnstileSiteKey);
        }
      })
      .catch(function () {});

    if (waitlistForm) {
      var wlSubmitBtn = document.getElementById('wl-submit');
      var wlErrorEl = document.getElementById('wl-error');
      var wlSuccessEl = document.getElementById('wl-success');
      var wlSubmitDefaultText = wlSubmitBtn.textContent;

      function showWlError(message) {
        wlErrorEl.textContent = message;
        wlErrorEl.classList.add('visible');
      }

      waitlistForm.addEventListener('submit', function (e) {
        e.preventDefault();
        wlErrorEl.textContent = '';
        wlErrorEl.classList.remove('visible');

        var name = waitlistForm.elements.name.value.trim();
        var contact = waitlistForm.elements.contact.value.trim();
        var consentNotify = waitlistForm.elements.consentNotify.checked;
        var website = waitlistForm.elements.website ? waitlistForm.elements.website.value : '';

        if (!name || !contact) {
          showWlError(isViPage ? 'Vui lòng điền đầy đủ thông tin.' : 'Please complete all fields.');
          return;
        }
        if (!consentNotify) {
          showWlError(isViPage ? 'Vui lòng đồng ý để được liên hệ.' : 'Please confirm you agree to be contacted.');
          return;
        }

        wlSubmitBtn.disabled = true;
        wlSubmitBtn.textContent = isViPage ? 'Đang gửi...' : 'Sending...';

        fetch('/.netlify/functions/candidate-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, contact: contact, consentNotify: consentNotify, website: website })
        })
          .then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
              if (!response.ok) { throw new Error(data.error || genericError); }
              return data;
            });
          })
          .then(function () {
            waitlistForm.style.display = 'none';
            wlSuccessEl.style.display = 'block';
          })
          .catch(function (err) {
            showWlError(err.message || genericError);
            wlSubmitBtn.disabled = false;
            wlSubmitBtn.textContent = wlSubmitDefaultText;
          });
      });
    }

    if (registerForm) {
      var regSubmitBtn = document.getElementById('reg-submit');
      var regErrorEl = document.getElementById('reg-error');
      var regSubmitDefaultText = regSubmitBtn.textContent;

      function showRegError(message) {
        regErrorEl.textContent = message;
        regErrorEl.classList.add('visible');
      }

      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        regErrorEl.textContent = '';
        regErrorEl.classList.remove('visible');

        var el = registerForm.elements;
        var fullName = el.fullName.value.trim();
        var dateOfBirth = el.dateOfBirth.value;
        var ageDeclared = el.ageDeclared.checked;
        var province = el.province.value;
        var zaloNumber = el.zaloNumber.value.trim();
        var email = el.email.value.trim();
        var preferredLanguage = el.preferredLanguage.value;
        var aboutText = el.aboutText.value.trim();
        var source = el.source ? el.source.value : '';
        var consentContact = el.consentContact.checked;
        var consentProcessing = el.consentProcessing.checked;
        var website = el.website ? el.website.value : '';

        if (!fullName || !dateOfBirth || !province || !zaloNumber || !preferredLanguage || !aboutText) {
          showRegError(isViPage ? 'Vui lòng điền đầy đủ các trường bắt buộc.' : 'Please complete all required fields.');
          return;
        }
        if (!ageDeclared) {
          showRegError(isViPage ? 'Vui lòng xác nhận bạn từ 18 tuổi trở lên.' : 'You must confirm you are 18 or over.');
          return;
        }
        if (!consentContact || !consentProcessing) {
          showRegError(isViPage ? 'Vui lòng đồng ý với cả hai điều khoản để tiếp tục.' : 'Please agree to both consent statements to continue.');
          return;
        }

        var turnstileToken = window.turnstile && turnstileWidgetId !== null ? window.turnstile.getResponse(turnstileWidgetId) : '';
        if (!turnstileToken) {
          showRegError(isViPage ? 'Vui lòng hoàn thành xác minh để tiếp tục.' : 'Please complete the verification to continue.');
          return;
        }

        regSubmitBtn.disabled = true;
        regSubmitBtn.textContent = isViPage ? 'Đang gửi...' : 'Submitting...';

        fetch('/.netlify/functions/candidate-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName,
            dateOfBirth: dateOfBirth,
            ageDeclared: ageDeclared,
            province: province,
            zaloNumber: zaloNumber,
            email: email,
            preferredLanguage: preferredLanguage,
            aboutText: aboutText,
            source: source,
            consentContact: consentContact,
            consentProcessing: consentProcessing,
            turnstileToken: turnstileToken,
            website: website
          })
        })
          .then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
              if (!response.ok) { throw new Error(data.error || genericError); }
              return data;
            });
          })
          .then(function () {
            window.location.href = isViPage ? '/vi/thank-you-registration' : '/thank-you-registration';
          })
          .catch(function (err) {
            showRegError(err.message || genericError);
            regSubmitBtn.disabled = false;
            regSubmitBtn.textContent = regSubmitDefaultText;
            if (window.turnstile && turnstileWidgetId !== null) {
              window.turnstile.reset(turnstileWidgetId);
            }
          });
      });
    }
  }

  /* ---- Withdraw candidate registration (withdraw page) ---- */
  var withdrawForm = document.getElementById('withdraw-form');
  if (withdrawForm) {
    var isViPageWithdraw = document.documentElement.lang === 'vi';
    var wdSubmitBtn = document.getElementById('withdraw-submit');
    var wdErrorEl = document.getElementById('withdraw-error');
    var wdSuccessEl = document.getElementById('withdraw-success');
    var wdSubmitDefaultText = wdSubmitBtn.textContent;

    withdrawForm.addEventListener('submit', function (e) {
      e.preventDefault();
      wdErrorEl.textContent = '';
      wdErrorEl.classList.remove('visible');

      var contact = withdrawForm.elements.contact.value.trim();
      var website = withdrawForm.elements.website ? withdrawForm.elements.website.value : '';

      if (!contact) {
        wdErrorEl.textContent = isViPageWithdraw ? 'Vui lòng nhập số Zalo hoặc email bạn đã đăng ký.' : 'Please provide the Zalo number or email you registered with.';
        wdErrorEl.classList.add('visible');
        return;
      }

      wdSubmitBtn.disabled = true;
      wdSubmitBtn.textContent = isViPageWithdraw ? 'Đang gửi...' : 'Sending...';

      fetch('/.netlify/functions/withdraw-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact, website: website })
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || (isViPageWithdraw ? 'Đã có lỗi xảy ra. Vui lòng thử lại.' : 'Something went wrong. Please try again.'));
            }
            return data;
          });
        })
        .then(function () {
          withdrawForm.style.display = 'none';
          wdSuccessEl.style.display = 'block';
        })
        .catch(function (err) {
          wdErrorEl.textContent = err.message || (isViPageWithdraw ? 'Đã có lỗi xảy ra. Vui lòng thử lại.' : 'Something went wrong. Please try again.');
          wdErrorEl.classList.add('visible');
          wdSubmitBtn.disabled = false;
          wdSubmitBtn.textContent = wdSubmitDefaultText;
        });
    });
  }

})();
