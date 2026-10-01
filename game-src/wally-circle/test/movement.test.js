import test from 'node:test';
import assert from 'node:assert/strict';
import { createMovement, moveWally, normalizeInput, chunkAnchor, CHUNK_SIZE, MOVE_SPEED } from '../src/movement.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} should be near ${expected}`);

test('keyboard diagonals have the same speed as a cardinal direction', () => {
  const straight = createMovement();
  const diagonal = createMovement();
  moveWally(straight, { x: 1, z: 0 }, 0.02);
  moveWally(diagonal, { x: 1, z: -1 }, 0.02);
  near(straight.distance, diagonal.distance);
  near(Math.hypot(diagonal.x, diagonal.z), MOVE_SPEED * 0.02);
});

test('analog input preserves arbitrary angles and partial speed', () => {
  const input = normalizeInput(0.3, -0.4);
  const state = createMovement();
  moveWally(state, input, 0.02);
  near(state.x, 0.03);
  near(state.z, -0.04);
  near(state.distance, 0.05);
});

test('movement speed is independent of frame rate', () => {
  const slow = createMovement();
  const fast = createMovement();
  for (let i = 0; i < 30; i++) moveWally(slow, { x: -1, z: 0 }, 1 / 30);
  for (let i = 0; i < 144; i++) moveWally(fast, { x: -1, z: 0 }, 1 / 144);
  near(slow.x, fast.x);
  near(slow.x, -MOVE_SPEED);
});

test('releasing controls stops immediately and suspended frames cannot teleport Wally', () => {
  const state = createMovement();
  moveWally(state, { x: 0, z: 1 }, 200);
  near(state.z, MOVE_SPEED * 0.05);
  const stopped = { ...state };
  moveWally(state, { x: 0, z: 0 }, 0.02);
  assert.deepEqual(state, stopped);
  moveWally(state, { x: 1, z: 1 }, -10);
  moveWally(state, { x: 1, z: 1 }, NaN);
  assert.deepEqual(state, stopped);
});

test('Wally turns across the angle boundary by the shorter path', () => {
  const state = { ...createMovement(), heading: Math.PI - 0.01 };
  moveWally(state, { x: -0.01, z: -1 }, 0.01);
  const turn = Math.atan2(Math.sin(state.heading - (Math.PI - 0.01)), Math.cos(state.heading - (Math.PI - 0.01)));
  assert.ok(turn > 0 && turn < 0.02);
});

test('long journeys have no world boundary and render coordinates stay near zero', () => {
  const state = createMovement();
  for (let i = 0; i < 100000; i++) moveWally(state, { x: -1, z: 1 }, 0.05);
  assert.ok(state.x < -17000 && state.z > 17000);
  for (const position of [state.x, state.z, -0.001, 0, 12, -12, 1e9, -1e9]) {
    const anchor = chunkAnchor(position);
    assert.ok(anchor.offset <= 0 && anchor.offset > -CHUNK_SIZE);
    near(anchor.index * CHUNK_SIZE - anchor.offset, position);
  }
});
