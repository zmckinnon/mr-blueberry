import test from 'node:test';
import assert from 'node:assert/strict';
import { createControls } from '../src/controls.js';

class Surface extends EventTarget {
  style = {};
  captures = new Set();
  focus() { document.activeElement = this; }
  querySelector() { return this.thumb; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 126, height: 126 }; }
  hasPointerCapture(id) { return this.captures.has(id); }
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
}

function setup(t) {
  globalThis.window = new Surface();
  globalThis.document = new Surface();
  const canvas = new Surface();
  const joystick = new Surface();
  joystick.thumb = new Surface();
  let running = true;
  let pauses = 0;
  canvas.focus();
  const controls = createControls({ canvas, joystick, isRunning: () => running, pause: () => { running = false; pauses++; } });
  t.after(() => { controls.dispose(); delete globalThis.window; delete globalThis.document; });
  return { canvas, joystick, controls, pauses: () => pauses };
}

function send(target, type, data = {}) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, data);
  target.dispatchEvent(event);
  return event;
}

test('keyboard movement supports diagonals and stops on release', t => {
  const { controls } = setup(t);
  send(window, 'keydown', { code: 'KeyW', key: 'w' });
  send(window, 'keydown', { code: 'ArrowRight', key: 'ArrowRight' });
  assert.ok(controls.read().x > 0 && controls.read().z < 0);
  assert.ok(Math.abs(Math.hypot(controls.read().x, controls.read().z) - 1) < 1e-8);
  send(window, 'keyup', { code: 'KeyW', key: 'w' });
  send(window, 'keyup', { code: 'ArrowRight', key: 'ArrowRight' });
  assert.deepEqual(controls.read(), { x: 0, z: 0 });
});

test('keyboard aliases work when physical key codes are unavailable', t => {
  const { controls } = setup(t);
  send(window, 'keydown', { key: 'A' });
  assert.deepEqual(controls.read(), { x: -1, z: 0 });
  send(window, 'keyup', { key: 'a' });
  assert.deepEqual(controls.read(), { x: 0, z: 0 });
});

test('the game leaves page navigation and browser shortcuts alone', t => {
  const { controls, canvas } = setup(t);
  document.activeElement = new Surface();
  assert.equal(send(window, 'keydown', { code: 'ArrowDown' }).defaultPrevented, false);
  canvas.focus();
  assert.equal(send(window, 'keydown', { code: 'KeyW', metaKey: true }).defaultPrevented, false);
  assert.deepEqual(controls.read(), { x: 0, z: 0 });
});

test('pointer drag supports any direction and resets on release or cancellation', t => {
  const { controls, joystick } = setup(t);
  for (const end of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    send(joystick, 'pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 90, clientY: 50 });
    const direction = controls.read();
    assert.ok(direction.x > 0 && direction.z < 0 && direction.x !== -direction.z);
    send(joystick, end, { pointerId: 1 });
    assert.deepEqual(controls.read(), { x: 0, z: 0 });
    assert.equal(joystick.thumb.style.transform, 'translate(0px, 0px)');
  }
});

test('moving focus or switching tabs clears held controls', t => {
  const { controls, canvas, pauses } = setup(t);
  send(window, 'keydown', { code: 'ArrowUp' });
  send(canvas, 'blur');
  assert.deepEqual(controls.read(), { x: 0, z: 0 });
  send(window, 'keydown', { code: 'KeyD' });
  document.hidden = true;
  send(document, 'visibilitychange');
  assert.deepEqual(controls.read(), { x: 0, z: 0 });
  assert.equal(pauses(), 1);
  send(window, 'keydown', { code: 'KeyD' });
  assert.deepEqual(controls.read(), { x: 0, z: 0 });
});
