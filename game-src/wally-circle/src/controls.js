import { normalizeInput } from './movement.js';

const DIRECTIONS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};
const KEY_ALIASES = { w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD' };
const movementKey = event => DIRECTIONS[event.code] ? event.code : (KEY_ALIASES[event.key?.toLowerCase()] || event.key);

export function createControls({ canvas, joystick, isRunning, pause }) {
  const keys = new Set();
  const thumb = joystick.querySelector('.wally-joystick-thumb');
  const listeners = new AbortController();
  let pointer = null;
  let analog = { x: 0, z: 0 };
  const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { ...options, signal: listeners.signal });
  const focused = () => document.activeElement === canvas || document.activeElement === joystick;

  function releasePointer() {
    const active = pointer;
    pointer = null;
    analog = { x: 0, z: 0 };
    thumb.style.transform = 'translate(0px, 0px)';
    if (active !== null && joystick.hasPointerCapture(active)) joystick.releasePointerCapture(active);
  }
  function clear() {
    keys.clear();
    releasePointer();
  }
  function updatePointer(event) {
    const rect = joystick.getBoundingClientRect();
    const radius = rect.width * 0.31;
    const dx = event.clientX - rect.left - rect.width / 2;
    const dz = event.clientY - rect.top - rect.height / 2;
    const length = Math.hypot(dx, dz);
    const scale = Math.min(radius, length) / (length || 1);
    thumb.style.transform = `translate(${dx * scale}px, ${dz * scale}px)`;
    analog = length < 8 ? { x: 0, z: 0 } : normalizeInput(dx / radius, dz / radius);
  }

  on(window, 'keydown', event => {
    if (!isRunning() || !focused() || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = movementKey(event);
    if (event.code === 'Escape' || event.key === 'Escape') {
      event.preventDefault();
      pause(true);
    } else if (DIRECTIONS[key]) {
      event.preventDefault();
      keys.add(key);
    }
  });
  on(window, 'keyup', event => keys.delete(movementKey(event)));
  on(canvas, 'blur', clear);
  on(joystick, 'blur', clear);
  on(window, 'blur', () => { clear(); pause(false); });
  on(document, 'visibilitychange', () => {
    if (document.hidden) { clear(); pause(false); }
  });
  on(joystick, 'pointerdown', event => {
    if (!isRunning() || pointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    pointer = event.pointerId;
    joystick.setPointerCapture(pointer);
    updatePointer(event);
  });
  on(joystick, 'pointermove', event => {
    if (event.pointerId !== pointer) return;
    if (event.pointerType === 'mouse' && event.buttons === 0) releasePointer();
    else updatePointer(event);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    on(joystick, type, event => { if (event.pointerId === pointer) releasePointer(); });
  }
  for (const type of ['pointerup', 'pointercancel']) {
    on(window, type, event => { if (event.pointerId === pointer) releasePointer(); });
  }

  return {
    clear,
    read() {
      if (pointer !== null) return analog;
      let x = 0;
      let z = 0;
      for (const key of keys) {
        x += DIRECTIONS[key][0];
        z += DIRECTIONS[key][1];
      }
      return normalizeInput(Math.sign(x), Math.sign(z));
    },
    dispose() { clear(); listeners.abort(); },
  };
}
