import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createMonkeyState, advanceMonkeys, catchMonkeys } from '../src/monkey-state.js';
import { createMonkeys } from '../src/monkeys.js';
import { createFood, advanceFood, sizeForBananas } from '../src/food.js';
import { SAFE_RADIUS } from '../src/challenge.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} should be near ${expected}`);

test('eleven monkeys roam around inside the circle without spawning on Wally', () => {
  const monkeys = createMonkeyState();
  const original = structuredClone(monkeys);
  const visited = monkeys.items.map(() => ({ minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }));
  assert.equal(monkeys.items.length, 11);
  assert.equal(catchMonkeys(monkeys, { eaten: 0, size: 1 }, { x: 0, z: 0 }), 0);
  for (let frame = 0; frame < 60 * 120; frame++) {
    const previous = monkeys.items.map(({ x, z }) => ({ x, z }));
    advanceMonkeys(monkeys, 1 / 60);
    monkeys.items.forEach((monkey, index) => {
      assert.ok(Math.hypot(monkey.x, monkey.z) < SAFE_RADIUS - 2);
      const distance = Math.hypot(monkey.x - previous[index].x, monkey.z - previous[index].z);
      assert.ok(distance >= 0 && distance <= 4.5 / 60 + 1e-8);
      assert.ok(Number.isFinite(monkey.heading));
      const bounds = visited[index];
      bounds.minX = Math.min(bounds.minX, monkey.x);
      bounds.maxX = Math.max(bounds.maxX, monkey.x);
      bounds.minZ = Math.min(bounds.minZ, monkey.z);
      bounds.maxZ = Math.max(bounds.maxZ, monkey.z);
    });
  }
  monkeys.items.forEach((monkey, index) => {
    assert.ok(visited[index].maxX - visited[index].minX > 40);
    assert.ok(visited[index].maxZ - visited[index].minZ > 40);
    assert.notEqual(monkey.x, original.items[index].x);
    assert.notEqual(monkey.z, original.items[index].z);
  });
});

test('running paths are frame-rate independent and freeze when no play time passes', () => {
  const at30 = createMonkeyState();
  const at144 = createMonkeyState();
  for (let frame = 0; frame < 30 * 10; frame++) advanceMonkeys(at30, 1 / 30);
  for (let frame = 0; frame < 144 * 10; frame++) advanceMonkeys(at144, 1 / 144);
  at30.items.forEach((monkey, index) => {
    near(monkey.x, at144.items[index].x);
    near(monkey.z, at144.items[index].z);
    near(monkey.heading, at144.items[index].heading);
  });
  const paused = structuredClone(at30);
  for (const seconds of [0, -1, NaN, Infinity]) advanceMonkeys(at30, seconds);
  assert.deepEqual(at30, paused);
  const capped = structuredClone(paused);
  advanceMonkeys(at30, 1000);
  advanceMonkeys(capped, 0.05);
  assert.deepEqual(at30, capped);
});

test('catching each monkey awards exactly twenty bananas and growth only once', () => {
  const monkeys = createMonkeyState();
  const food = createFood();
  monkeys.items.forEach((monkey, index) => {
    const isolated = { items: [monkey] };
    assert.equal(catchMonkeys(isolated, food, monkey), 1);
    assert.equal(monkey.caught, true);
    assert.equal(food.eaten, (index + 1) * 20);
    assert.equal(food.size, sizeForBananas((index + 1) * 20));
    assert.equal(catchMonkeys(isolated, food, monkey), 0);
  });
  assert.equal(food.eaten, 220);
  assert.ok(food.items.every(banana => !banana.eaten));
  const caught = structuredClone(monkeys);
  advanceMonkeys(monkeys, 0.05);
  assert.deepEqual(monkeys, caught);
  advanceFood(food, 120);
  assert.equal(catchMonkeys(monkeys, food, monkeys.items[0]), 0);
  assert.equal(food.eaten, 220);
  const restarted = createMonkeyState();
  assert.ok(restarted.items.every(monkey => !monkey.caught));
  assert.equal(catchMonkeys(restarted, createFood(), restarted.items[0]), 1);
});

test('growing Wally can catch monkeys anywhere within his larger reach', () => {
  const food = { eaten: 0, size: 1 };
  const monkeys = { items: [{ x: 4, z: 0, caught: false }, { x: 0, z: -4, caught: false }] };
  assert.equal(catchMonkeys(monkeys, food, { x: 0, z: 0 }), 0);
  food.size = 3;
  assert.equal(catchMonkeys(monkeys, food, { x: 0, z: 0 }), 2);
  assert.equal(food.eaten, 40);
  assert.equal(food.size, sizeForBananas(40));
  assert.equal(catchMonkeys(monkeys, food, { x: 0, z: 0 }), 0);
});

test('monkey models carry bananas, animate their run, and disappear when caught', () => {
  const scene = new THREE.Scene();
  const monkeys = createMonkeyState();
  const renderer = createMonkeys(scene, monkeys.items.length);
  const player = { x: monkeys.items[0].x, z: monkeys.items[0].z };
  const model = scene.getObjectByName('monkey-0');
  const leg = model.getObjectByName('left-leg');
  const arm = model.getObjectByName('right-arm');
  const bunch = model.getObjectByName('held-bananas');
  assert.equal(scene.children.length, 11);
  for (const monkeyModel of scene.children) {
    assert.ok(monkeyModel.getObjectByName('curled-tail'));
    assert.ok(monkeyModel.getObjectByName('face'));
    assert.equal(monkeyModel.getObjectByName('held-bananas').children.filter(part => part.name === 'held-banana').length, 3);
  }
  assert.equal(bunch.parent, arm);
  renderer.update(monkeys, player, 100);
  assert.ok(model.visible);
  near(model.position.x, 0);
  near(model.position.z, 0);
  const before = leg.rotation.x;
  advanceMonkeys(monkeys, 0.05);
  renderer.update(monkeys, player, 100);
  assert.notEqual(leg.rotation.x, before);
  near(model.position.x, monkeys.items[0].x - player.x);
  near(model.position.z, monkeys.items[0].z - player.z);
  const paused = model.position.clone();
  renderer.update(monkeys, player, 100);
  assert.ok(model.position.equals(paused));
  renderer.update(monkeys, { x: 1e6, z: 1e6 }, 100);
  assert.ok(scene.children.every(monkey => !monkey.visible));
  catchMonkeys(monkeys, createFood(), monkeys.items[0]);
  renderer.update(monkeys, player, 100);
  assert.equal(model.visible, false);
  renderer.update(createMonkeyState(), player, 100);
  assert.equal(model.visible, true);
});
