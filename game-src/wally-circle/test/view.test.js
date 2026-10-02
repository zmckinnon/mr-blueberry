import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { getGrowthView } from '../src/view.js';
import { createWally } from '../src/wally.js';
import { createWorld } from '../src/world.js';
import { SAFE_RADIUS } from '../src/challenge.js';

test('Wally stays fully in view at huge sizes on desktop and narrow screens', () => {
  const wally = createWally();
  for (const heading of [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    wally.animate({ heading, distance: 3 }, 1);
    const bounds = new THREE.Box3().setFromObject(wally.model);
    for (const size of [1, 2, 10, 1000, 1e6]) {
      for (const aspect of [0.5, 0.64, 1, 2.3]) {
        const view = getGrowthView(size, aspect);
        const camera = new THREE.PerspectiveCamera(40, aspect, view.near, view.far);
        camera.position.set(0, view.cameraHeight, view.cameraDepth);
        camera.lookAt(0, view.targetHeight, 0);
        camera.updateMatrixWorld();
        for (const x of [bounds.min.x, bounds.max.x]) {
          for (const y of [bounds.min.y, bounds.max.y]) {
            for (const z of [bounds.min.z, bounds.max.z]) {
              const point = new THREE.Vector3(x, y, z).multiplyScalar(size).project(camera);
              assert.ok(Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && Math.abs(point.z) < 1,
                `Clipped at size ${size}, aspect ${aspect}, heading ${heading}: ${point.toArray()}`);
            }
          }
        }
      }
    }
  }
});

test('ground expansion keeps grass density, its position, and the world boundary fixed', () => {
  const originalDocument = globalThis.document;
  globalThis.document = { createElement: () => ({ getContext: () => ({
    fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
  }) }) };
  try {
    const scene = new THREE.Scene();
    const world = createWorld(scene);
    const [ground, circle] = scene.children;
    const texture = ground.material.map;
    let originalPhase;
    for (const size of [1, 10, 1000, 1e6, 1]) {
      const view = getGrowthView(size, 0.64);
      world.update(23, -17, view.scale);
      const width = ground.geometry.parameters.width * ground.scale.x;
      assert.equal(width / texture.repeat.x, 8);
      assert.ok(width / 2 > view.cameraDepth + view.fogFar);
      const phase = (texture.repeat.x / 2 + texture.offset.x) % 1;
      if (originalPhase === undefined) originalPhase = phase;
      assert.ok(Math.abs(phase - originalPhase) < 1e-6);
      assert.equal(circle.geometry.parameters.innerRadius, SAFE_RADIUS);
      assert.equal(circle.scale.x, 1);
      assert.equal(circle.position.x, -23);
      assert.equal(circle.position.z, 17);
    }
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});
