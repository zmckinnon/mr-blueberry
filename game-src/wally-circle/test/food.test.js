import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createFood, advanceFood, eatBananas, sizeForBananas, BANANA_EDGE_MARGIN } from '../src/food.js';
import { createBananas } from '../src/bananas.js';
import { SAFE_RADIUS } from '../src/challenge.js';

test('bananas cover the world but stay entirely inside the boundary', () => {
  const food = createFood();
  assert.equal(food.items.length, 680 * 3);
  for (const banana of food.items) {
    assert.ok(Math.hypot(banana.x, banana.z) <= SAFE_RADIUS - BANANA_EDGE_MARGIN);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    assert.ok(food.items.some(banana => banana.x * sx > 50 && banana.z * sz > 50));
  }
  assert.equal(eatBananas(food, { x: 0, z: 0 }), 0);
  assert.equal(food.size, 1);
});

test('touching a banana consumes it once and visibly increases Wally’s size', () => {
  const food = createFood();
  const first = food.items[0];
  assert.equal(eatBananas(food, first), 1);
  assert.equal(first.eaten, true);
  assert.equal(food.eaten, 1);
  assert.ok(food.size > 1.1);
  const grownSize = food.size;
  assert.equal(eatBananas(food, first), 0);
  assert.equal(food.size, grownSize);
  assert.equal(food.eaten, 1);
  assert.equal(food.items[1].eaten, false);
});

test('collection works around Wally and his reach grows with his body', () => {
  for (const direction of [{ x: 1, z: 0 }, { x: 0, z: -1 }, { x: -0.6, z: 0.8 }]) {
    const food = { items: [{ x: direction.x * 2, z: direction.z * 2, eaten: false }], size: 1, eaten: 0 };
    assert.equal(eatBananas(food, { x: 0, z: 0 }), 0);
    food.size = 2;
    assert.equal(eatBananas(food, { x: 0, z: 0 }), 1);
  }
});

test('a long round counts every banana once, and restart restores the field and size', () => {
  const food = createFood();
  let lastSize = food.size;
  for (const banana of food.items) {
    const collected = eatBananas(food, banana);
    assert.ok(Number.isFinite(food.size));
    if (collected) assert.ok(food.size > lastSize);
    lastSize = food.size;
  }
  assert.equal(food.eaten, food.items.length);
  assert.ok(food.items.every(banana => banana.eaten));
  const restarted = createFood();
  assert.equal(restarted.eaten, 0);
  assert.equal(restarted.size, 1);
  assert.ok(restarted.items.every(banana => !banana.eaten));
  assert.deepEqual(restarted.items.map(({ x, z }) => ({ x, z })), food.items.map(({ x, z }) => ({ x, z })));
});

test('all bananas return together at six minutes without resetting size or count', () => {
  const food = createFood();
  const originalPositions = food.items.map(({ x, z }) => ({ x, z }));
  eatBananas(food, food.items[0]);
  assert.equal(advanceFood(food, 359), false);
  eatBananas(food, food.items[1]);
  const { eaten, size } = food;
  assert.equal(food.items[0].eaten, true);
  assert.equal(food.items[1].eaten, true);
  assert.equal(advanceFood(food, 1), true);
  assert.ok(food.items.every(banana => !banana.eaten));
  assert.equal(food.eaten, eaten);
  assert.equal(food.size, size);
  assert.deepEqual(food.items.map(({ x, z }) => ({ x, z })), originalPositions);
  assert.equal(eatBananas(food, food.items[0]), 1);
  assert.equal(food.eaten, eaten + 1);
  assert.ok(food.size > size);
});

test('refills repeat every six minutes and retain extra time from delayed frames', () => {
  const food = createFood();
  assert.equal(advanceFood(food, 365), true);
  eatBananas(food, food.items[0]);
  assert.equal(advanceFood(food, 354), false);
  assert.equal(food.items[0].eaten, true);
  assert.equal(advanceFood(food, 1), true);
  assert.equal(food.items[0].eaten, false);
  eatBananas(food, food.items[0]);
  assert.equal(advanceFood(food, 1085), true);
  assert.equal(food.refillElapsed, 5);
  eatBananas(food, food.items[0]);
  assert.equal(advanceFood(food, 0), false);
  assert.equal(food.items[0].eaten, true);
});

test('growth has no gameplay ceiling and continues across repeated full-field refills', () => {
  for (const count of [0, 100, 2040, 1e6, 1e12]) {
    assert.ok(Number.isFinite(sizeForBananas(count)));
    assert.ok(sizeForBananas(count + 1) > sizeForBananas(count));
  }
  assert.ok(sizeForBananas(1e12) > 1000);
  const food = createFood();
  let previousSize = food.size;
  for (let round = 1; round <= 3; round++) {
    for (const banana of food.items) eatBananas(food, banana);
    assert.equal(food.eaten, food.items.length * round);
    assert.ok(food.size > previousSize);
    previousSize = food.size;
    advanceFood(food, 360);
    assert.equal(food.size, previousSize);
  }
});

test('refill timing is frame-rate independent and zero-time resume does not advance it', () => {
  for (const fps of [30, 60, 144]) {
    const food = createFood();
    eatBananas(food, food.items[0]);
    for (let frame = 0; frame < fps * 360 - 1; frame++) assert.equal(advanceFood(food, 1 / fps), false);
    // Paused games do not update; resuming starts with a zero-time frame.
    for (const seconds of [0, -1, NaN, Infinity]) assert.equal(advanceFood(food, seconds), false);
    assert.equal(food.items[0].eaten, true);
    assert.equal(advanceFood(food, 1 / fps), true);
    assert.equal(advanceFood(food, 0), false);
  }
  const restarted = createFood();
  assert.equal(restarted.refillElapsed, 0);
  assert.equal(advanceFood(restarted, 359), false);
  assert.equal(advanceFood(restarted, 1), true);
});

test('the banana renderer removes eaten fruit and follows the player without moving world positions', () => {
  const scene = new THREE.Scene();
  const food = createFood();
  const renderer = createBananas(scene, food.items.length);
  const first = food.items[0];
  const player = { x: first.x, z: first.z };
  renderer.update(food, player, 1);
  const [fruit, tips] = scene.children;
  assert.equal(fruit.count, 1);
  assert.equal(tips.count, 2);
  const matrix = new THREE.Matrix4();
  fruit.getMatrixAt(0, matrix);
  assert.equal(matrix.elements[12], 0);
  assert.equal(matrix.elements[14], 0);
  eatBananas(food, player);
  renderer.update(food, player, 1);
  assert.equal(fruit.count, 0);
  assert.equal(tips.count, 0);
  advanceFood(food, 360);
  renderer.update(food, player, 1);
  assert.equal(fruit.count, 1);
  assert.equal(tips.count, 2);
});
