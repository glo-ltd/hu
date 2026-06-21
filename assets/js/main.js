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
    + '?hide_event_type_details=1&hide_gdpr_banner=1'
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

})();
