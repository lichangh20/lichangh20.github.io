import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/js/visitors.js', import.meta.url), 'utf8');

function target() {
  const listeners = new Map();
  const classes = new Set();
  return {
    dataset: {},
    children: [],
    attributes: {},
    hidden: true,
    appendChild(child) { this.children.push(child); },
    contains(child) { return child === this || this.children.some(item => item.contains(child)); },
    classList: {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, listener) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(listener);
    },
    emit(name, details = {}) {
      const event = { preventDefault() { this.defaultPrevented = true; }, ...details };
      for (const listener of listeners.get(name) || []) listener(event);
      return event;
    },
  };
}

async function globe({ reducedMotion = false, hasHint = true, hasControls = true, hasContext = true,
  stats = { totals: { visits: 1, places: 1 }, points: [{ lon: -105, lat: 0, count: 1, label: 'Denver, US' }] },
  failStats = false, failMap = false } = {}) {
  let draws = 0;
  let arcs = [];
  let nextFrame = 0;
  let intersection;
  const frames = new Map();
  const requests = [];
  const capture = new Set();
  const context = {
    clearRect() { draws++; arcs = []; },
    arc(...args) { arcs.push(args); },
    createRadialGradient() { return { addColorStop() {} }; },
  };
  for (const name of ['save', 'restore', 'beginPath', 'fill', 'clip', 'stroke', 'moveTo', 'lineTo', 'setTransform']) {
    context[name] = () => {};
  }
  const canvas = Object.assign(target(), {
    getContext: () => hasContext ? context : null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 190, height: 190 }),
    setPointerCapture: id => capture.add(id),
    hasPointerCapture: id => capture.has(id),
    releasePointerCapture: id => capture.delete(id),
  });
  const host = target();
  host.appendChild(canvas);
  host.dataset.statsEndpoint = 'https://stats.example.test';
  const elements = new Map();
  host.querySelector = selector => {
    if (selector === 'canvas' || selector === '.visitors__canvas') return canvas;
    if (selector === '.visitors__hint' && !hasHint) return null;
    if (!hasControls && ['.visitors__tooltip', '.visitors__locations', '.visitors__location-list', '.visitors__location-note'].includes(selector)) return null;
    if (!elements.has(selector)) { elements.set(selector, target()); host.appendChild(elements.get(selector)); }
    return elements.get(selector);
  };
  const document = Object.assign(target(), {
    hidden: false,
    documentElement: target(),
    querySelector: () => host,
    createElement: () => target(),
  });
  canvas.focus = () => canvas.emit('focus');
  const motion = Object.assign(target(), { matches: reducedMotion });
  const theme = Object.assign(target(), { matches: false });
  class IntersectionObserver {
    constructor(callback) { intersection = callback; }
    observe() {}
  }
  const sandbox = {
    document,
    window: Object.assign(target(), {
      devicePixelRatio: 1,
      location: { origin: 'https://lichangh20.github.io' },
      matchMedia: query => query.includes('reduced-motion') ? motion : theme,
      IntersectionObserver,
    }),
    IntersectionObserver,
    MutationObserver: class { observe() {} },
    getComputedStyle: () => ({ getPropertyValue: () => '#123456' }),
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    sessionStorage: { getItem: () => null, setItem() {} },
    async fetch(url, options) {
      requests.push({ url: String(url), method: options.method });
      if ((failStats && String(url).endsWith('/stats')) || (failMap && String(url).includes('world-land'))) throw new Error('Offline');
      return { ok: true, async json() {
        if (String(url).includes('world-land')) return { features: [] };
        return stats;
      } };
    },
  };
  vm.runInNewContext(source, sandbox, { filename: 'visitors.js' });
  // Drain the map, hit, and stats promise chains without any external I/O.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(host.dataset.statsState, failStats ? 'unavailable' : 'ready');
  return {
    canvas, host, document, motion, capture, requests, window: sandbox.window,
    get tooltip() { return elements.get('.visitors__tooltip'); },
    get locations() { return elements.get('.visitors__locations'); },
    get locationNote() { return elements.get('.visitors__location-note'); },
    get buttons() { return elements.get('.visitors__location-list')?.children.map(item => item.children[0]) || []; },
    get draws() { return draws; },
    get pendingFrames() { return frames.size; },
    get marker() { return arcs.find(([, , radius]) => radius < 5)?.slice(0, 2); },
    setVisible(value) { intersection([{ isIntersecting: value }]); },
    frame(time) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(time));
    },
    pointer(name, details = {}) {
      return canvas.emit(name, { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1, clientX: 95, clientY: 95, ...details });
    },
  };
}

test('horizontal and vertical pointer drags redraw the globe immediately', async () => {
  const view = await globe();
  const initial = view.marker;
  view.pointer('pointerdown');
  assert.ok(view.capture.has(1));
  assert.ok(view.canvas.classList.contains('is-dragging'));
  assert.equal(view.pendingFrames, 0);
  const draws = view.draws;
  view.pointer('pointermove', { clientX: 110 });
  assert.ok(view.draws > draws);
  assert.ok(Math.abs(view.marker[0] - initial[0]) > 1);
  const horizontal = view.marker;
  view.pointer('pointermove', { clientX: 110, clientY: 110 });
  assert.ok(Math.abs(view.marker[1] - horizontal[1]) > 1);
});

test('secondary buttons, non-primary pointers, and unrelated pointer moves are ignored', async () => {
  const view = await globe();
  for (const details of [{ button: 2 }, { button: 1 }, { isPrimary: false }]) {
    view.pointer('pointerdown', details);
    assert.equal(view.capture.size, 0);
    assert.equal(view.canvas.classList.contains('is-dragging'), false);
  }
  view.pointer('pointerdown');
  const draws = view.draws;
  view.pointer('pointermove', { pointerId: 2, clientX: 120 });
  view.pointer('pointerup', { pointerId: 2 });
  assert.equal(view.draws, draws);
  assert.ok(view.canvas.classList.contains('is-dragging'));
});

test('primary touch and pen pointers can drag without hover', async () => {
  for (const pointerType of ['touch', 'pen']) {
    const view = await globe();
    const initial = view.marker;
    view.pointer('pointerdown', { pointerType });
    view.pointer('pointermove', { pointerType, clientX: 110, clientY: 110 });
    assert.notDeepEqual(view.marker, initial);
    view.pointer('pointerup', { pointerType });
    assert.equal(view.capture.size, 0);
  }
});

for (const ending of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  test(`${ending} clears dragging and ignores subsequent movement`, async () => {
    const view = await globe();
    view.pointer('pointerdown');
    assert.ok(view.canvas.classList.contains('is-dragging'));
    if (ending === 'lostpointercapture') view.capture.delete(1);
    view.pointer(ending);
    assert.equal(view.canvas.classList.contains('is-dragging'), false);
    assert.equal(view.capture.size, 0);
    const draws = view.draws;
    view.pointer('pointermove', { clientX: 120, clientY: 115 });
    assert.equal(view.draws, draws);
    view.canvas.emit('blur');
    assert.equal(view.pendingFrames, 1);
  });
}

test('released buttons, canvas/window blur, and document hiding clean up an active drag', async () => {
  const endings = [
    view => view.pointer('pointermove', { buttons: 0, clientX: 120 }),
    view => view.canvas.emit('blur'),
    view => view.window.emit('blur'),
    view => { view.document.hidden = true; view.document.emit('visibilitychange'); },
  ];
  for (const end of endings) {
    const view = await globe();
    view.pointer('pointerdown');
    assert.ok(view.canvas.classList.contains('is-dragging'));
    end(view);
    assert.equal(view.canvas.classList.contains('is-dragging'), false);
    assert.equal(view.capture.size, 0);
    const draws = view.draws;
    view.pointer('pointermove', { clientX: 120 });
    assert.equal(view.draws, draws);
  }
});

test('arrow keys rotate on both axes, Home resets, unrelated keys remain untouched', async () => {
  const view = await globe();
  const initial = view.marker;
  view.canvas.emit('focus');
  assert.equal(view.pendingFrames, 0);
  assert.ok(view.canvas.emit('keydown', { key: 'ArrowRight' }).defaultPrevented);
  assert.notDeepEqual(view.marker, initial);
  view.canvas.emit('keydown', { key: 'ArrowLeft' });
  assert.deepEqual(view.marker, initial);
  view.canvas.emit('keydown', { key: 'ArrowUp' });
  assert.notDeepEqual(view.marker, initial);
  view.canvas.emit('keydown', { key: 'ArrowDown' });
  assert.deepEqual(view.marker, initial);
  view.canvas.emit('keydown', { key: 'ArrowRight' });
  view.canvas.emit('keydown', { key: 'ArrowUp' });
  assert.ok(view.canvas.emit('keydown', { key: 'Home' }).defaultPrevented);
  assert.deepEqual(view.marker, initial);
  const draws = view.draws;
  assert.equal(view.canvas.emit('keydown', { key: 'Tab' }).defaultPrevented, undefined);
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
    assert.equal(view.canvas.emit('keydown', { key: 'ArrowLeft', [modifier]: true }).defaultPrevented, undefined);
  }
  assert.equal(view.draws, draws);
});

test('reduced motion disables auto-spin but allows manual pointer and keyboard rotation', async () => {
  const view = await globe({ reducedMotion: true });
  assert.equal(view.pendingFrames, 0);
  const initial = view.marker;
  view.pointer('pointerdown');
  view.pointer('pointermove', { clientX: 110 });
  view.pointer('pointerup');
  assert.notDeepEqual(view.marker, initial);
  const dragged = view.marker;
  view.canvas.emit('keydown', { key: 'ArrowUp' });
  assert.notDeepEqual(view.marker, dragged);
  view.canvas.emit('blur');
  assert.equal(view.pendingFrames, 0);
});

test('extreme vertical drags clamp tilt instead of flipping past the poles', async () => {
  const view = await globe({ reducedMotion: true });
  view.pointer('pointerdown');
  view.pointer('pointermove', { clientY: 10000 });
  const firstPole = view.marker;
  assert.ok(firstPole, 'equatorial marker remains on the visible hemisphere');
  assert.ok(Math.abs(Math.abs(firstPole[1] - 95) - 86 * Math.sin(85 * Math.PI / 180)) < 0.001);
  view.pointer('pointermove', { clientY: 20000 });
  assert.deepEqual(view.marker, firstPole);
  view.pointer('pointermove', { clientY: -10000 });
  const oppositePole = view.marker;
  assert.ok(oppositePole);
  assert.ok(Math.abs(oppositePole[1] + firstPole[1] - 190) < 0.001);
});

test('existing hover, visibility, and offscreen conditions continue to pause animation', async () => {
  const view = await globe();
  assert.equal(view.pendingFrames, 1);
  view.host.emit('mouseenter');
  assert.equal(view.pendingFrames, 0);
  view.host.emit('mouseleave');
  assert.equal(view.pendingFrames, 1);
  view.setVisible(false);
  assert.equal(view.pendingFrames, 0);
  view.setVisible(true);
  view.document.hidden = true;
  view.document.emit('visibilitychange');
  assert.equal(view.pendingFrames, 0);
  view.document.hidden = false;
  view.document.emit('visibilitychange');
  view.frame(100);
  const initial = view.marker;
  view.frame(200);
  assert.notDeepEqual(view.marker, initial);
});

test('manual interaction makes no additional hit or stats requests', async () => {
  const view = await globe();
  assert.equal(view.requests.filter(request => request.method === 'POST').length, 1);
  assert.equal(view.requests.filter(request => request.url.endsWith('/stats')).length, 1);
  const initial = [...view.requests];
  view.pointer('pointerdown');
  view.pointer('pointermove', { clientX: 120, clientY: 110 });
  view.pointer('pointerup');
  view.canvas.emit('keydown', { key: 'ArrowLeft' });
  view.canvas.emit('keydown', { key: 'Home' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(view.requests, initial);
});

test('older cached HTML without a drag hint still loads statistics and controls', async () => {
  const view = await globe({ hasHint: false, hasControls: false });
  const initial = view.marker;
  view.pointer('pointerdown');
  view.pointer('pointermove', { clientX: 110 });
  view.pointer('pointerup');
  assert.notDeepEqual(view.marker, initial);
  assert.equal(view.host.dataset.statsState, 'ready');
});

test('hover identifies front-side markers and leaving hides unpinned details', async () => {
  const view = await globe();
  const [clientX, clientY] = view.marker;
  view.pointer('pointermove', { clientX, clientY, buttons: 0 });
  assert.equal(view.tooltip.hidden, false);
  assert.equal(view.tooltip.textContent, 'Denver, US · 1 visit');
  view.pointer('pointerleave');
  assert.equal(view.tooltip.hidden, true);
  view.pointer('pointermove', { clientX: 0, clientY: 0, buttons: 0 });
  assert.equal(view.tooltip.hidden, true);
});

test('mouse clicks and touch taps pin details; blank taps, Escape, and outside clicks dismiss', async () => {
  for (const pointerType of ['mouse', 'touch']) {
    const view = await globe();
    const [clientX, clientY] = view.marker;
    const tap = (x = clientX, y = clientY) => {
      view.pointer('pointerdown', { pointerType, clientX: x, clientY: y });
      view.pointer('pointerup', { pointerType, clientX: x, clientY: y });
    };
    tap();
    assert.equal(view.capture.size, 0);
    view.pointer('pointerleave');
    assert.equal(view.tooltip.hidden, false);
    view.canvas.emit('blur');
    assert.equal(view.pendingFrames, 0, 'pinned details keep globe still');
    view.document.emit('keydown', { key: 'Escape' });
    assert.equal(view.tooltip.hidden, true);
    tap();
    view.document.emit('pointerdown', { target: target() });
    assert.equal(view.tooltip.hidden, true);
    tap();
    tap(0, 0);
    assert.equal(view.tooltip.hidden, true);
  }
});

test('tap slop does not rotate; real drags dismiss and never become a click', async () => {
  const view = await globe();
  const initial = view.marker;
  const [clientX, clientY] = initial;
  view.pointer('pointerdown', { clientX, clientY });
  view.pointer('pointermove', { clientX: clientX + 3, clientY: clientY + 2 });
  assert.deepEqual(view.marker, initial);
  view.pointer('pointerup', { clientX: clientX + 3, clientY: clientY + 2 });
  assert.equal(view.tooltip.hidden, false);
  view.pointer('pointerdown', { clientX, clientY });
  view.pointer('pointermove', { clientX: clientX + 8, clientY });
  view.pointer('pointermove', { clientX, clientY });
  view.pointer('pointerup', { clientX, clientY });
  assert.equal(view.tooltip.hidden, true);
  assert.equal(view.capture.size, 0);
});

test('touch has a generous hit area and overlapping markers resolve deterministically', async () => {
  const view = await globe({ stats: { totals: { visits: 3, places: 2 }, points: [
    { lat: 20, lon: -105, count: 1, label: 'First' },
    { lat: 20, lon: -105, count: 2, label: 'Second' },
  ] } });
  view.pointer('pointermove', { clientX: 110, buttons: 0 });
  assert.equal(view.tooltip.hidden, true);
  view.pointer('pointerdown', { pointerType: 'touch', clientX: 110 });
  view.pointer('pointerup', { pointerType: 'touch', clientX: 110 });
  assert.equal(view.tooltip.textContent, 'First · 1 visit');
});

test('hidden hemisphere cannot be hit; location list selects it and rotates it to front', async () => {
  const view = await globe({ stats: { totals: { visits: 12, places: 1 }, points: [
    { lat: -20, lon: 75, count: 12, label: 'Far side' },
  ] } });
  assert.equal(view.marker, undefined);
  view.pointer('pointermove', { buttons: 0 });
  assert.equal(view.tooltip.hidden, true);
  assert.equal(view.locations.hidden, false);
  view.buttons[0].emit('click');
  assert.ok(Math.abs(view.marker[0] - 95) < 0.001);
  assert.ok(Math.abs(view.marker[1] - 95) < 0.001);
  assert.equal(view.tooltip.textContent, 'Far side · 12 visits');
  assert.equal(view.buttons[0].attributes['aria-pressed'], 'true');
  view.canvas.emit('keydown', { key: 'Home' });
  assert.equal(view.buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(view.tooltip.hidden, true);
});

test('activating a selected location again toggles its pressed state and details off', async () => {
  const view = await globe();
  const initialRequests = [...view.requests];
  view.buttons[0].emit('click');
  assert.equal(view.buttons[0].attributes['aria-pressed'], 'true');
  assert.equal(view.tooltip.hidden, false);
  view.buttons[0].emit('click');
  assert.equal(view.buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(view.tooltip.hidden, true);
  assert.deepEqual(view.requests, initialRequests);
});

test('location labels are literal bounded text, with safe missing-label fallback', async () => {
  const view = await globe({ stats: { totals: { visits: 3, places: 3 }, points: [
    { lat: 20, lon: -105, count: 1, label: '<img src=x onerror=alert(1)>\u0000' },
    { lat: 10, lon: 0, count: 1, label: 'A'.repeat(1000) },
    { lat: 0, lon: 0, count: 1, label: {} },
  ] } });
  assert.equal(view.buttons[0].textContent, '<img src=x onerror=alert(1)> · 1 visit');
  assert.equal(view.buttons[0].children.length, 0);
  assert.equal(view.buttons[1].textContent, 'A'.repeat(80) + ' · 1 visit');
  assert.equal(view.buttons[2].textContent, 'Unknown location · 1 visit');
  assert.ok(!source.includes('innerHTML'));
});

test('locations cap at 500 without altering global totals; empty and failure states remain honest', async () => {
  const view = await globe({ stats: { totals: { visits: 999, places: 700 }, points:
    Array.from({ length: 510 }, (_, i) => ({ lat: 0, lon: 0, count: 1, label: String(i) })) } });
  assert.equal(view.buttons.length, 500);
  assert.match(view.locationNote.textContent, /up to 500/);
  assert.equal(view.host.querySelector('.visitors__places').textContent, '700');
  const empty = await globe({ stats: { totals: { visits: 0, places: 0 }, points: [] } });
  assert.equal(empty.buttons.length, 0);
  assert.equal(empty.locationNote.textContent, 'No location data yet');
  const failed = await globe({ failStats: true });
  assert.equal(failed.locations.hidden, true);
  assert.equal(failed.tooltip.hidden, true);
});

test('map or canvas failure preserves accessible textual locations; interactions never fetch', async () => {
  for (const settings of [{ failMap: true }, { hasContext: false }]) {
    const view = await globe(settings);
    assert.equal(view.locations.hidden, false);
    const initialRequests = [...view.requests];
    view.buttons[0].emit('click');
    assert.equal(view.buttons[0].attributes['aria-pressed'], 'true');
    view.document.emit('keydown', { key: 'Escape' });
    assert.deepEqual(view.requests, initialRequests);
  }
});
