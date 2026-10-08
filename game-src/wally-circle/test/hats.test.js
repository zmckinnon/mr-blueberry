import test from 'node:test';
import assert from 'node:assert/strict';
import { createWally } from '../src/wally.js';

test('each hat has distinct geometry and only the selected hat is visible', () => {
  const wally = createWally();
  const signatures = [];
  for (const name of ['cap', 'top', 'wizard', 'crown']) {
    wally.setHat(name);
    const hat = wally.model.children.at(-4 + ['cap', 'top', 'wizard', 'crown'].indexOf(name));
    assert.ok(hat.visible);
    signatures.push(hat.children.map(mesh => `${mesh.geometry.type}:${mesh.material.color.getHexString()}`).join(','));
    assert.equal(wally.model.children.slice(-4).filter(group => group.visible).length, 1);
  }
  assert.equal(new Set(signatures).size, 4);
});
