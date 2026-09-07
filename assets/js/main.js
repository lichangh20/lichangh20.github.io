/* Homepage interactions; the academic content stays readable without JavaScript. */
(function () {
  'use strict';
  var root = document.documentElement;
  var themeButton = document.getElementById('theme-toggle');
  var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  var motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  function currentTheme() {
    return root.getAttribute('data-theme') || (themeMedia.matches ? 'dark' : 'light');
  }
  function reflectTheme() {
    var label = currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
  }
  themeButton.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (error) {}
    reflectTheme();
  });
  themeMedia.addEventListener('change', reflectTheme);
  reflectTheme();

  var nav = document.getElementById('nav');
  var toTop = document.getElementById('to-top');
  var navLinks = Array.from(document.querySelectorAll('.nav__links a'));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    var active = sections.filter(function (section) {
      return section.getBoundingClientRect().top <= nav.offsetHeight + 80;
    }).pop();
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    navLinks.forEach(function (link) {
      var selected = !!active && link.getAttribute('href') === '#' + active.id;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: motionMedia.matches ? 'instant' : 'smooth' });
  });

})();
