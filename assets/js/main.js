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

  /* ---- Read-aloud (Web Speech API) ---- */
  var audioButtons = document.querySelectorAll('.audio-play-btn');
  if (audioButtons.length && 'speechSynthesis' in window) {
    var synth = window.speechSynthesis;
    var currentBtn = null;
    var voiceCache = null;

    var preferredVoiceNames = [
      'Daniel', 'George', 'Arthur',
      'Google UK English Male', 'Microsoft George', 'Microsoft Ryan',
      'UK English Male'
    ];

    function pickVoice() {
      var voices = voiceCache || synth.getVoices();
      voiceCache = voices;
      for (var i = 0; i < preferredVoiceNames.length; i++) {
        for (var j = 0; j < voices.length; j++) {
          if (voices[j].name.indexOf(preferredVoiceNames[i]) !== -1) return voices[j];
        }
      }
      for (var k = 0; k < voices.length; k++) {
        if (voices[k].lang === 'en-GB' && /male/i.test(voices[k].name)) return voices[k];
      }
      for (var m = 0; m < voices.length; m++) {
        if (voices[m].lang === 'en-GB') return voices[m];
      }
      for (var n = 0; n < voices.length; n++) {
        if (voices[n].lang && voices[n].lang.indexOf('en') === 0) return voices[n];
      }
      return voices[0] || null;
    }

    if (synth.onvoiceschanged !== undefined) {
      synth.addEventListener('voiceschanged', function () { voiceCache = synth.getVoices(); });
    }

    function resetButton(btn) {
      btn.setAttribute('data-state', 'idle');
      var label = btn.querySelector('.audio-play-label');
      if (label) label.textContent = btn.getAttribute('data-label-play');
    }

    function stopAll() {
      synth.cancel();
      if (currentBtn) resetButton(currentBtn);
      currentBtn = null;
    }

    audioButtons.forEach(function (btn) {
      var targetId = btn.getAttribute('data-audio-target');
      var target = targetId && document.getElementById(targetId);
      if (!target) return;

      var label = btn.querySelector('.audio-play-label');
      btn.setAttribute('data-label-play', label ? label.textContent : 'Listen to this article');
      btn.setAttribute('data-label-pause', 'Pause reading');

      btn.addEventListener('click', function () {
        var wasPlaying = btn.getAttribute('data-state') === 'playing';
        stopAll();
        if (wasPlaying) return;

        var paragraphs = target.querySelectorAll('p');
        var text = Array.prototype.map.call(paragraphs, function (p) {
          return p.textContent.trim();
        }).join(' ');
        if (!text) return;

        var utterance = new SpeechSynthesisUtterance(text);
        var voice = pickVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = 'en-GB';
        }
        utterance.rate = 0.94;
        utterance.pitch = 0.96;
        utterance.onend = function () { resetButton(btn); currentBtn = null; };
        utterance.onerror = function () { resetButton(btn); currentBtn = null; };

        currentBtn = btn;
        btn.setAttribute('data-state', 'playing');
        if (label) label.textContent = btn.getAttribute('data-label-pause');
        synth.speak(utterance);
      });
    });

    window.addEventListener('beforeunload', stopAll);
  } else {
    audioButtons.forEach(function (btn) { btn.style.display = 'none'; });
  }

})();
