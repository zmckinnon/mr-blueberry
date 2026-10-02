import test from 'node:test';
import assert from 'node:assert/strict';
import { createChallenge, updateChallenge, SAFE_RADIUS } from '../src/challenge.js';

const inside = { x: 0, z: 0 };
const outside = { x: SAFE_RADIUS + 1, z: 0 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} should be near ${expected}`);

test('the circle includes its boundary and detects exits in every direction', () => {
  for (const direction of [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }, { x: -0.6, z: -0.8 }]) {
    const challenge = createChallenge();
    updateChallenge(challenge, { x: direction.x * SAFE_RADIUS, z: direction.z * SAFE_RADIUS }, 100);
    assert.equal(challenge.outside, false);
    assert.equal(challenge.gameOver, false);
    updateChallenge(challenge, { x: direction.x * (SAFE_RADIUS + 0.01), z: direction.z * (SAFE_RADIUS + 0.01) }, 0.02);
    assert.equal(challenge.outside, true);
    assert.equal(challenge.remaining, 12);
  }
});

test('the clock starts on exit and counts down even while Wally is stationary', () => {
  const challenge = createChallenge();
  updateChallenge(challenge, inside, 60);
  updateChallenge(challenge, outside, 0.02);
  assert.equal(challenge.remaining, 12);
  updateChallenge(challenge, outside, 5);
  near(challenge.remaining, 7);
  assert.equal(challenge.gameOver, false);
});

test('returning before the deadline resets the clock for the next exit', () => {
  const challenge = createChallenge();
  updateChallenge(challenge, outside, 0);
  updateChallenge(challenge, inside, 11.99);
  assert.equal(challenge.outside, false);
  assert.equal(challenge.remaining, 12);
  assert.equal(challenge.gameOver, false);
  updateChallenge(challenge, inside, 30);
  updateChallenge(challenge, outside, 0.02);
  assert.equal(challenge.remaining, 12);
  updateChallenge(challenge, outside, 1);
  near(challenge.remaining, 11);
});

test('exactly twelve seconds outside ends the round at different frame rates', () => {
  for (const fps of [30, 60, 144]) {
    const challenge = createChallenge();
    updateChallenge(challenge, outside, 0);
    for (let frame = 0; frame < fps * 12 - 1; frame++) updateChallenge(challenge, outside, 1 / fps);
    assert.equal(challenge.gameOver, false);
    updateChallenge(challenge, outside, 1 / fps);
    assert.equal(challenge.gameOver, true);
    assert.equal(challenge.remaining, 0);
  }
});

test('arriving at or after the deadline cannot revive the round', () => {
  for (const seconds of [12, 12.1, 30]) {
    const challenge = createChallenge();
    updateChallenge(challenge, outside, 0);
    updateChallenge(challenge, inside, seconds);
    assert.equal(challenge.gameOver, true);
    const ended = { ...challenge };
    updateChallenge(challenge, inside, 0.02);
    assert.deepEqual(challenge, ended);
    const restarted = createChallenge();
    updateChallenge(restarted, inside, 0);
    assert.equal(restarted.gameOver, false);
    assert.equal(restarted.remaining, 12);
    assert.equal(restarted.outside, false);
  }
});

test('resuming with a zero-time frame preserves the remaining countdown', () => {
  const challenge = createChallenge();
  updateChallenge(challenge, outside, 0);
  updateChallenge(challenge, outside, 4);
  // Pausing stops updates; the first frame after resuming has no elapsed play time.
  updateChallenge(challenge, outside, 0);
  assert.equal(challenge.remaining, 8);
  updateChallenge(challenge, outside, 1);
  assert.equal(challenge.remaining, 7);
});

test('long active frames count in full and invalid time cannot extend the deadline', () => {
  const challenge = createChallenge();
  updateChallenge(challenge, outside, 0);
  updateChallenge(challenge, outside, 6);
  for (const seconds of [-1, NaN, Infinity]) updateChallenge(challenge, outside, seconds);
  assert.equal(challenge.remaining, 6);
  updateChallenge(challenge, outside, 6);
  assert.equal(challenge.gameOver, true);
});
