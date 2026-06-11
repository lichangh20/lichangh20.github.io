/* Changhao Li — homepage interactions: theme toggle, scrollspy,
   scroll reveal, nav shadow, back-to-top. No dependencies. */

(function () {
  'use strict';

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return media.matches ? 'dark' : 'light';
  }

  function reflectTheme() {
    var t = currentTheme();
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    reflectTheme();
  });

  media.addEventListener('change', reflectTheme);
  reflectTheme();

  /* ---------- nav border on scroll + back-to-top ---------- */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('to-top');

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = sections.filter(function (s) { return visible[s.id]; })[0];
      setActive(current ? current.id : '');
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- typed intro line ---------- */
  var typedEl = document.getElementById('typed');
  if (typedEl) {
    var LINES = [
      'I work on RL, LLMs, and AI agents.',
      'I have hands-on experience in efficient ML — quantization & CUDA.',
      'Recently, I am exploring scaling data & environments for coding agents.',
      'Welcome to reach out!'
    ];
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      typedEl.textContent = LINES[0];
    } else {
      var li = 0, ci = 0, deleting = false;
      (function tick() {
        var line = LINES[li];
        if (!deleting) {
          ci++;
          typedEl.textContent = line.slice(0, ci);
          if (ci === line.length) {
            deleting = true;
            setTimeout(tick, 2300);          // hold the full sentence
          } else {
            setTimeout(tick, 38 + Math.random() * 52);
          }
        } else {
          ci--;
          typedEl.textContent = line.slice(0, ci);
          if (ci === 0) {
            deleting = false;
            li = (li + 1) % LINES.length;
            setTimeout(tick, 480);           // breathe before next line
          } else {
            setTimeout(tick, 20);
          }
        }
      })();
    }
  }

  /* ---------- Misc easter egg: reveal ceremony + lazy visitor map ---------- */
  var misc = document.querySelector('.misc');
  var mapHost = document.getElementById('visitor-map');
  var stage = document.getElementById('misc-reveal');
  var stageTyped = document.getElementById('misc-reveal-typed');
  var cards = document.getElementById('misc-cards');

  var loadMap = function () {
    if (!mapHost || loadMap.done || !misc.open) return;
    loadMap.done = true;
    var s = document.createElement('script');
    s.id = 'mapmyvisitors';
    s.type = 'text/javascript';
    // official default params — custom land/ocean colors silently drop
    // the country layer on the free tier, so keep cl=ffffff&w=a
    s.src = 'https://mapmyvisitors.com/map.js?d=' + mapHost.getAttribute('data-map-id') +
            '&cl=ffffff&w=a';
    var ph = mapHost.querySelector('.misc__map-ph');
    s.onload = function () { if (ph) ph.remove(); };
    s.onerror = function () { if (ph) ph.textContent = 'visitor map unavailable (·_·)'; };
    mapHost.appendChild(s);
  };

  if (misc && cards) {
    var ceremonyStarted = false;
    var showActive = false;

    var showCards = function () {
      showActive = false;
      if (stage) stage.hidden = true;
      cards.classList.remove('misc__cards--waiting');
      cards.classList.add('misc__cards--in');
    };

    var ceremony = function () {
      if (!misc.open) return;
      if (ceremonyStarted) { loadMap(); return; }
      ceremonyStarted = true;
      loadMap();

      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || !stage || !stageTyped) { showCards(); return; }

      showActive = true;
      cards.classList.add('misc__cards--waiting');
      stage.hidden = false;

      var TEXT = 'cat misc/ ...';
      var i = 0;
      (function type() {
        if (!showActive) return; // fast-forwarded by a close
        i++;
        stageTyped.textContent = TEXT.slice(0, i);
        if (i < TEXT.length) {
          setTimeout(type, 65 + Math.random() * 55);
        } else {
          setTimeout(function () {
            if (!showActive) return;
            stage.classList.add('is-leaving');
            setTimeout(showCards, 420);
          }, 600);
        }
      })();
    };

    misc.addEventListener('toggle', function () {
      if (misc.open) { ceremony(); }
      else if (showActive) { showCards(); } // closed mid-show: skip ahead
    });
    ceremony(); // in case the section is already open on load
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          reveal.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { reveal.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
})();
