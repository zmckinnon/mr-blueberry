import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createFood, advanceFood, sizeForBananas } from '../src/food.js';
import { createChestState, openChests } from '../src/chest-state.js';
import { createChests } from '../src/chests.js';
import { SAFE_RADIUS } from '../src/challenge.js';

test('white chests stay inside the circle, clear of bananas and the starting point', () => {
  const food = createFood();
  const chests = createChestState(food.items);
  assert.equal(chests.items.length, 24);
  assert.ok(Math.hypot(chests.items[0].x, chests.items[0].z) < 9);
  for (const chest of chests.items) {
    assert.ok(Math.hypot(chest.x, chest.z) <= SAFE_RADIUS - 3);
    assert.ok(food.items.every(banana => Math.hypot(chest.x - banana.x, chest.z - banana.z) >= 2.2));
    assert.ok(chests.items.every(other => other === chest || Math.hypot(chest.x - other.x, chest.z - other.z) >= 16));
  }
  assert.equal(openChests(chests, food, { x: 0, z: 0 }), 0);
  assert.equal(food.eaten, 0);
});

test('a chest grants exactly nine bananas and their growth, once only', () => {
  const food = createFood();
  const chests = createChestState(food.items);
  const first = chests.items[0];
  assert.equal(openChests(chests, food, first), 1);
  assert.equal(first.opened, true);
  assert.equal(food.eaten, 9);
  assert.equal(food.size, sizeForBananas(9));
  assert.ok(food.items.every(banana => !banana.eaten));
  assert.equal(openChests(chests, food, first), 0);
  assert.equal(food.eaten, 9);
  assert.equal(food.size, sizeForBananas(9));
  assert.equal(chests.items[1].opened, false);
});

test('large Wally can reach chests with his body and receives nine per chest', () => {
  const food = { eaten: 10, size: 1 };
  const chests = { items: [{ x: 3, z: 0, opened: false }, { x: 0, z: -3, opened: false }] };
  assert.equal(openChests(chests, food, { x: 0, z: 0 }), 0);
  food.size = sizeForBananas(food.eaten);
  assert.equal(openChests(chests, food, { x: 0, z: 0 }), 2);
  assert.equal(food.eaten, 28);
  assert.equal(food.size, sizeForBananas(28));
  assert.equal(openChests(chests, food, { x: 0, z: 0 }), 0);
});

test('banana refills keep chests open, while a new round restores their rewards', () => {
  const food = createFood();
  const chests = createChestState(food.items);
  openChests(chests, food, chests.items[0]);
  advanceFood(food, 120);
  assert.equal(openChests(chests, food, chests.items[0]), 0);
  assert.equal(food.eaten, 9);
  const restartedFood = createFood();
  const restartedChests = createChestState(restartedFood.items);
  assert.ok(restartedChests.items.every(chest => !chest.opened));
  assert.deepEqual(restartedChests.items.map(({ x, z }) => ({ x, z })), chests.items.map(({ x, z }) => ({ x, z })));
  assert.equal(openChests(restartedChests, restartedFood, restartedChests.items[0]), 1);
  assert.equal(restartedFood.eaten, 9);
});

test('chest lids visibly open, stay open, and close on restart without moving the base', () => {
  const food = createFood();
  const chests = createChestState(food.items);
  const scene = new THREE.Scene();
  const renderer = createChests(scene, chests.items.length);
  const player = { x: chests.items[0].x, z: chests.items[0].z };
  const bodies = scene.getObjectByName('white-chest-bodies');
  const lids = scene.getObjectByName('white-chest-lids');
  renderer.update(chests, player, 3);
  assert.equal(bodies.count, 1);
  const closed = new THREE.Matrix4();
  const fixedBase = new THREE.Matrix4();
  lids.getMatrixAt(0, closed);
  bodies.getMatrixAt(0, fixedBase);
  openChests(chests, food, player);
  for (let frame = 0; frame < 60; frame++) renderer.update(chests, player, 3, 1 / 60);
  const opened = new THREE.Matrix4();
  const base = new THREE.Matrix4();
  lids.getMatrixAt(0, opened);
  bodies.getMatrixAt(0, base);
  assert.ok(!opened.equals(closed));
  assert.ok(base.equals(fixedBase));
  assert.equal(lids.count, 1);
  renderer.update(chests, player, 3, 0);
  const stillOpen = new THREE.Matrix4();
  lids.getMatrixAt(0, stillOpen);
  assert.ok(stillOpen.equals(opened));
  renderer.update(createChestState(food.items), player, 3);
  const reset = new THREE.Matrix4();
  lids.getMatrixAt(0, reset);
  assert.ok(reset.equals(closed));
});
