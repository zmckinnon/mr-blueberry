import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createChests(scene, capacity) {
  const white = new THREE.MeshStandardMaterial({ color: '#fffefa', roughness: 0.65 });
  const silver = new THREE.MeshStandardMaterial({ color: '#7e9aae', roughness: 0.45, metalness: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: '#efb92c', roughness: 0.4, metalness: 0.25 });
  const inside = new THREE.MeshStandardMaterial({ color: '#34495e', roughness: 1 });
  const box = (width, height, depth, x, y, z) => new THREE.BoxGeometry(width, height, depth).translate(x, y, z);
  const arch = (radius, width, x) => new THREE.CylinderGeometry(radius, radius, width, 20, 1, false, 0, Math.PI)
    .rotateZ(Math.PI / 2).translate(x, 0, 0.85);
  const parts = [];
  function part(name, geometries, material, hinged = false) {
    const geometry = mergeGeometries(geometries);
    for (const source of geometries) source.dispose();
    const mesh = new THREE.InstancedMesh(geometry, material, capacity);
    mesh.name = name;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.count = 0;
    scene.add(mesh);
    parts.push({ mesh, hinged });
  }
  part('white-chest-bodies', [
    box(2.5, 0.18, 1.7, 0, 0.13, 0),
    box(2.5, 0.95, 0.14, 0, 0.625, -0.78),
    box(2.5, 0.95, 0.14, 0, 0.625, 0.78),
    box(0.16, 0.95, 1.42, -1.17, 0.625, 0),
    box(0.16, 0.95, 1.42, 1.17, 0.625, 0),
  ], white);
  part('chest-body-bands', [
    ...[-0.76, 0.76].flatMap(x => [-0.86, 0.86].map(z => box(0.14, 0.94, 0.05, x, 0.62, z))),
    box(2.56, 0.1, 1.76, 0, 0.15, 0),
  ], silver);
  part('chest-interiors', [box(2.16, 0.04, 1.38, 0, 0.24, 0)], inside);
  // Lid geometry is relative to a hinge along the back rim.
  part('white-chest-lids', [arch(0.85, 2.5, 0), box(2.5, 0.06, 1.7, 0, 0, 0.85)], white, true);
  part('chest-lid-bands', [arch(0.872, 0.14, -0.76), arch(0.872, 0.14, 0.76)], silver, true);
  part('chest-latches', [box(0.28, 0.36, 0.07, 0, 0.07, 1.735)], gold, true);
  part('chest-lid-linings', [box(2.15, 0.025, 1.38, 0, -0.05, 0.85)], inside, true);

  const opening = new Array(capacity).fill(0);
  const body = new THREE.Object3D();
  const hinge = new THREE.Object3D();
  hinge.position.set(0, 1.1, -0.85);
  const lidMatrix = new THREE.Matrix4();
  return {
    update(chests, player, viewRadius, seconds = 0) {
      const blend = 1 - Math.exp(-10 * Math.max(0, Math.min(seconds, 0.05)));
      let count = 0;
      chests.items.forEach((chest, index) => {
        opening[index] = chest.opened ? opening[index] + (1 - opening[index]) * blend : 0;
        if (Math.abs(1 - opening[index]) < 0.001) opening[index] = 1;
        const x = chest.x - player.x;
        const z = chest.z - player.z;
        if (Math.hypot(x, z) > viewRadius) return;
        body.position.set(x, 0, z);
        body.rotation.y = chest.rotation;
        body.updateMatrix();
        hinge.rotation.x = -1.8 * opening[index];
        hinge.updateMatrix();
        lidMatrix.multiplyMatrices(body.matrix, hinge.matrix);
        for (const { mesh, hinged } of parts) mesh.setMatrixAt(count, hinged ? lidMatrix : body.matrix);
        count++;
      });
      for (const { mesh } of parts) {
        mesh.count = count;
        mesh.instanceMatrix.needsUpdate = true;
      }
    },
  };
}
