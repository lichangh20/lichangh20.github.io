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

  /* tiny canvas fireworks: palette-colored bursts, no dependencies */
  function startFireworks(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var COLORS = ['#e0a82e', '#a87b16', '#4a7fc1', '#b8453f', '#3f8f6b'];
    var parts = [], running = true, raf, nextBurst = 0;

    function burst() {
      if (parts.length > 340) return; // cap the workload, keep frames smooth
      var x = canvas.width * (0.12 + Math.random() * 0.76);
      var y = canvas.height * (0.12 + Math.random() * 0.5);
      var n = 54 + (Math.random() * 30 | 0);
      var color = COLORS[(Math.random() * COLORS.length) | 0];
      for (var i = 0; i < n; i++) {
        var a = (Math.PI * 2 * i) / n + Math.random() * 0.25;
        var sp = (1.2 + Math.random() * 2.6) * dpr;
        parts.push({
          x: x, y: y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: 0.007 + Math.random() * 0.009,
          r: (1.7 + Math.random() * 2.1) * dpr, c: color
        });
      }
    }

    burst(); // open with an immediate double burst
    burst();

    function frame(t) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (t > nextBurst) { burst(); nextBurst = t + 420 + Math.random() * 520; }
      // update + draw + compact in one pass, no per-frame array allocation
      var w = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.022 * dpr;            // gravity
        p.vx *= 0.985; p.vy *= 0.985;   // drag
        p.life -= p.decay;
        if (p.life <= 0) continue;
        parts[w++] = p;
        ctx.fillStyle = p.c;
        if (p.life > 0.35) {
          // soft halo only while the spark is still bright
          ctx.globalAlpha = p.life * 0.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life * 2.4, 0, 6.2832);
          ctx.fill();
        }
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, 6.2832);
        ctx.fill();
      }
      parts.length = w;
      ctx.globalAlpha = 1;
    }

    raf = requestAnimationFrame(frame);
    return function stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }

  if (misc && cards) {
    var ceremonyStarted = false;
    var showActive = false;
    var stopFireworks = null;

    var showCards = function () {
      showActive = false;
      if (stopFireworks) { stopFireworks(); stopFireworks = null; }
      if (stage) stage.hidden = true;
      cards.classList.remove('misc__cards--waiting');
      cards.classList.add('misc__cards--in');
    };

    var ceremony = function () {
      if (!misc.open) return;
      if (ceremonyStarted) { loadMap(); return; }
      ceremonyStarted = true;

      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || !stage || !stageTyped) { loadMap(); showCards(); return; }

      showActive = true;
      cards.classList.add('misc__cards--waiting');
      stage.hidden = false;
      stopFireworks = startFireworks(document.getElementById('misc-fireworks'));
      // give the show a smooth start before the third-party map script
      // competes for the main thread; still ready long before the reveal
      setTimeout(loadMap, 1500);

      // slow ceremonial typing; Array.from keeps emoji surrogate pairs intact
      var CHARS = Array.from('Congratulations — you’ve found the hidden easter egg! 🎉');
      var i = 0;
      (function type() {
        if (!showActive) return; // fast-forwarded by a close
        i++;
        stageTyped.textContent = CHARS.slice(0, i).join('');
        if (i < CHARS.length) {
          setTimeout(type, 80 + Math.random() * 75);
        } else {
          setTimeout(function () {
            if (!showActive) return;
            stage.classList.add('is-leaving');
            setTimeout(showCards, 680);
          }, 1500);
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
