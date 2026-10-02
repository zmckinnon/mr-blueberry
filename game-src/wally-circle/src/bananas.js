import * as THREE from 'three';

export function createBananas(scene, capacity) {
  // A curved, tapered yellow fruit lying on the grass, with brown tips at both ends.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.8, 0.23, -0.22),
    new THREE.Vector3(-0.45, 0.18, 0.22),
    new THREE.Vector3(0, 0.18, 0.38),
    new THREE.Vector3(0.45, 0.18, 0.22),
    new THREE.Vector3(0.8, 0.23, -0.22),
  ]);
  const rings = 20;
  const sides = 8;
  const geometry = new THREE.TubeGeometry(curve, rings, 0.18, sides, false);
  const positions = geometry.attributes.position;
  const point = new THREE.Vector3();
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const center = curve.getPointAt(t);
    const taper = 0.22 + 0.78 * Math.pow(Math.sin(Math.PI * t), 0.5);
    for (let side = 0; side <= sides; side++) {
      const index = ring * (sides + 1) + side;
      point.fromBufferAttribute(positions, index).sub(center).multiplyScalar(taper).add(center);
      positions.setXYZ(index, point.x, point.y, point.z);
    }
  }
  geometry.computeVertexNormals();
  const fruit = new THREE.InstancedMesh(geometry,
    new THREE.MeshStandardMaterial({ color: '#ffcc08', roughness: 0.65, emissive: '#8f6200', emissiveIntensity: 0.12 }), capacity);
  const tips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 8, 6),
    new THREE.MeshStandardMaterial({ color: '#70441e', roughness: 1 }), capacity * 2);
  for (const mesh of [fruit, tips]) {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.count = 0;
    scene.add(mesh);
  }
  const dummy = new THREE.Object3D();
  const tip = new THREE.Object3D();
  const ends = [curve.getPointAt(0), curve.getPointAt(1)];
  return {
    update(food, player, viewRadius) {
      let count = 0;
      for (const banana of food.items) {
        const x = banana.x - player.x;
        const z = banana.z - player.z;
        if (banana.eaten || Math.hypot(x, z) > viewRadius) continue;
        dummy.position.set(x, 0.02, z);
        dummy.rotation.y = banana.rotation;
        dummy.updateMatrix();
        fruit.setMatrixAt(count, dummy.matrix);
        ends.forEach((end, side) => {
          tip.position.copy(end).applyMatrix4(dummy.matrix);
          tip.updateMatrix();
          tips.setMatrixAt(count * 2 + side, tip.matrix);
        });
        count++;
      }
      fruit.count = count;
      tips.count = count * 2;
      fruit.instanceMatrix.needsUpdate = true;
      tips.instanceMatrix.needsUpdate = true;
    },
  };
}
