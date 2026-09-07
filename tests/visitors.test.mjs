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
    classList: {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
    },
    setAttribute() {},
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

async function globe({ reducedMotion = false, hasHint = true } = {}) {
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
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 190, height: 190 }),
    setPointerCapture: id => capture.add(id),
    hasPointerCapture: id => capture.has(id),
    releasePointerCapture: id => capture.delete(id),
  });
  const host = target();
  host.dataset.statsEndpoint = 'https://stats.example.test';
  const elements = new Map();
  host.querySelector = selector => {
    if (selector === 'canvas' || selector === '.visitors__canvas') return canvas;
    if (selector === '.visitors__hint' && !hasHint) return null;
    if (!elements.has(selector)) elements.set(selector, target());
    return elements.get(selector);
  };
  const document = Object.assign(target(), {
    hidden: false,
    documentElement: target(),
    querySelector: () => host,
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
      return { ok: true, async json() {
        if (String(url).includes('world-land')) return { features: [] };
        return { totals: { visits: 1, places: 1 }, points: [{ lon: -105, lat: 0, count: 1 }] };
      } };
    },
  };
  vm.runInNewContext(source, sandbox, { filename: 'visitors.js' });
  // Drain the map, hit, and stats promise chains without any external I/O.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(host.dataset.statsState, 'ready');
  return {
    canvas, host, document, motion, capture, requests, window: sandbox.window,
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
  const view = await globe({ hasHint: false });
  const initial = view.marker;
  view.pointer('pointerdown');
  view.pointer('pointermove', { clientX: 110 });
  view.pointer('pointerup');
  assert.notDeepEqual(view.marker, initial);
  assert.equal(view.host.dataset.statsState, 'ready');
});
