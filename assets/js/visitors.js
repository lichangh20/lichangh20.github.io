/* Local globe rendering + the site's own aggregate statistics service.
   Preview pages may read statistics, but only the live site records visits. */
(function () {
  'use strict';
  var host = document.querySelector('.visitors');
  if (!host) return;
  var canvas = host.querySelector('canvas');
  var context = canvas.getContext('2d');
  var note = host.querySelector('.visitors__note');
  var coastlines = [];
  var points = [];
  var longitude = -105;
  var radians = Math.PI / 180;
  var tilt = 20 * radians;
  var size = 190;
  var radius = 86;
  var colors;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var theme = window.matchMedia('(prefers-color-scheme: dark)');
  var visible = true;
  var hovered = false;
  var animation = 0;
  var lastDraw = 0;

  function project(lon, lat) {
    var phi = lat * radians;
    var lambda = (lon - longitude) * radians;
    var cosPhi = Math.cos(phi);
    return {
      x: size / 2 + radius * cosPhi * Math.sin(lambda),
      y: size / 2 - radius * (Math.cos(tilt) * Math.sin(phi) - Math.sin(tilt) * cosPhi * Math.cos(lambda)),
      front: Math.sin(tilt) * Math.sin(phi) + Math.cos(tilt) * cosPhi * Math.cos(lambda) >= 0
    };
  }

  function line(coordinates) {
    var drawing = false;
    context.beginPath();
    coordinates.forEach(function (coordinate) {
      var p = project(coordinate[0], coordinate[1]);
      if (!p.front) { drawing = false; return; }
      if (drawing) context.lineTo(p.x, p.y);
      else context.moveTo(p.x, p.y);
      drawing = true;
    });
    context.stroke();
  }

  var graticules = [];
  for (var lon = -180; lon < 180; lon += 30) {
    var meridian = [];
    for (var lat = -90; lat <= 90; lat += 3) meridian.push([lon, lat]);
    graticules.push(meridian);
  }
  for (var latitude = -60; latitude <= 60; latitude += 30) {
    var parallel = [];
    for (var angle = -180; angle <= 180; angle += 3) parallel.push([angle, latitude]);
    graticules.push(parallel);
  }

  function draw() {
    if (!context) return;
    var center = size / 2;
    context.clearRect(0, 0, size, size);
    context.save();
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    var gradient = context.createRadialGradient(size * .35, size * .3, 0, center, center, radius);
    gradient.addColorStop(0, colors.surface);
    gradient.addColorStop(1, colors.soft);
    context.fillStyle = gradient;
    context.fill();
    context.clip();
    context.strokeStyle = colors.muted;
    context.lineWidth = .6;
    context.globalAlpha = .2;
    graticules.forEach(line);
    context.globalAlpha = .65;
    context.lineWidth = .85;
    coastlines.forEach(line);
    context.globalAlpha = .9;
    points.forEach(function (point) {
      var p = project(point.lon, point.lat);
      if (!p.front) return;
      context.beginPath();
      context.arc(p.x, p.y, Math.min(4, 1.8 + Math.log1p(point.count) * .3), 0, Math.PI * 2);
      context.fillStyle = colors.accent;
      context.fill();
      context.strokeStyle = colors.surface;
      context.lineWidth = .7;
      context.stroke();
    });
    context.restore();
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.strokeStyle = colors.muted;
    context.globalAlpha = .35;
    context.lineWidth = .8;
    context.stroke();
    context.globalAlpha = 1;
  }

  function refresh() {
    if (!context) return;
    var style = getComputedStyle(document.documentElement);
    colors = {
      surface: style.getPropertyValue('--surface').trim(),
      soft: style.getPropertyValue('--accent-soft').trim(),
      muted: style.getPropertyValue('--muted').trim(),
      accent: style.getPropertyValue('--accent').trim()
    };
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * scale;
    canvas.height = size * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  }

  function canAnimate() {
    return context && !motion.matches && visible && !hovered && !document.hidden;
  }
  function tick(time) {
    animation = 0;
    if (!canAnimate()) return;
    if (!lastDraw || time - lastDraw >= 80) {
      if (lastDraw) longitude = (longitude + Math.min(time - lastDraw, 160) * .004) % 360;
      lastDraw = time;
      draw();
    }
    animation = requestAnimationFrame(tick);
  }
  function synchronizeAnimation() {
    cancelAnimationFrame(animation);
    animation = 0;
    lastDraw = 0;
    if (canAnimate()) animation = requestAnimationFrame(tick);
  }

  async function fetchJSON(url, method) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch(url, {
        method: method || 'GET', credentials: 'omit', cache: 'no-store', signal: controller.signal
      });
      if (!response.ok) throw new Error('Statistics unavailable');
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  if (context) {
    canvas.hidden = false;
    host.querySelector('.visitors__placeholder').setAttribute('hidden', '');
    refresh();
    new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    theme.addEventListener('change', refresh);
    motion.addEventListener('change', synchronizeAnimation);
    document.addEventListener('visibilitychange', synchronizeAnimation);
    host.addEventListener('mouseenter', function () { hovered = true; synchronizeAnimation(); });
    host.addEventListener('mouseleave', function () { hovered = false; synchronizeAnimation(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        synchronizeAnimation();
      }).observe(canvas);
    }
    synchronizeAnimation();
    fetchJSON('assets/img/world-land.geojson').then(function (data) {
      data.features.forEach(function (feature) {
        var polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        polygons.forEach(function (polygon) { coastlines = coastlines.concat(polygon); });
      });
      host.dataset.mapState = 'ready';
      draw();
    }).catch(function () {
      // The graticule and real visit markers remain usable without coastlines.
      host.dataset.mapState = 'unavailable';
    });
  }

  async function loadStatistics() {
    var configured = host.dataset.statsEndpoint.trim();
    if (!configured) { host.dataset.statsState = 'unconnected'; note.textContent = 'Statistics not connected yet'; return; }
    try {
      var endpoint = new URL(configured);
      var loopback = endpoint.hostname === '127.0.0.1' || endpoint.hostname === 'localhost';
      if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && loopback)) throw new Error('Invalid endpoint');
      endpoint.pathname = endpoint.pathname.replace(/\/$/, '') + '/';
      endpoint.search = '';
      endpoint.hash = '';
      var counted = false;
      try { counted = sessionStorage.getItem('changhao-visitor-counted') === '1'; } catch (error) {}
      if (window.location.origin === 'https://lichangh20.github.io' && !counted) {
        try {
          await fetchJSON(new URL('hit', endpoint), 'POST');
          try { sessionStorage.setItem('changhao-visitor-counted', '1'); } catch (error) {}
        } catch (error) { /* Reading aggregate statistics may still succeed. */ }
      }
      var data = await fetchJSON(new URL('stats', endpoint));
      if (!data.totals || !Number.isSafeInteger(data.totals.visits) || data.totals.visits < 0 ||
          !Number.isSafeInteger(data.totals.places) || data.totals.places < 0 || !Array.isArray(data.points)) {
        throw new Error('Invalid statistics');
      }
      points = data.points.slice(0, 500).filter(function (point) {
        return point && Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 &&
          Number.isFinite(point.lon) && Math.abs(point.lon) <= 180 && Number.isSafeInteger(point.count) && point.count > 0;
      });
      var visits = data.totals.visits.toLocaleString('en-US');
      var places = data.totals.places.toLocaleString('en-US');
      host.querySelector('.visitors__visits').textContent = visits;
      host.querySelector('.visitors__places').textContent = places;
      host.setAttribute('aria-label', 'Visitor statistics: ' + visits + ' visits from ' + places + ' approximate locations');
      host.dataset.statsState = 'ready';
      note.hidden = true;
      draw();
    } catch (error) {
      host.dataset.statsState = 'unavailable';
      note.textContent = 'Statistics temporarily unavailable';
    }
  }
  loadStatistics();
})();
