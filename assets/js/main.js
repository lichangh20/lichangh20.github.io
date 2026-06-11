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

  /* ---------- visitor map: lazy-load ClustrMaps on first Misc open ---------- */
  var misc = document.querySelector('.misc');
  var mapHost = document.getElementById('visitor-map');
  if (misc && mapHost) {
    var mapLoaded = false;
    var loadMap = function () {
      if (mapLoaded || !misc.open) return;
      mapLoaded = true;
      var s = document.createElement('script');
      s.id = 'clustrmaps';
      s.type = 'text/javascript';
      // colors matched to the site palette: navy dots, brass/red markers,
      // warm-white canvas, muted gray labels
      s.src = 'https://clustrmaps.com/map_v2.js?d=' + mapHost.getAttribute('data-clustrmaps-id') +
              '&w=a&t=tt&co=fffdf8&cl=0a3155&cmo=c79a2e&cmn=a23a2a&ct=5c6675';
      var ph = mapHost.querySelector('.misc__map-ph');
      s.onload = function () { if (ph) ph.remove(); };
      s.onerror = function () { if (ph) ph.textContent = 'visitor map unavailable (·_·)'; };
      mapHost.appendChild(s);
    };
    misc.addEventListener('toggle', loadMap);
    loadMap(); // in case the section is already open on load
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
