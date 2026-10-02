import * as THREE from 'three';
import { chunkAnchor, CHUNK_SIZE } from './movement.js';
import { SAFE_RADIUS } from './challenge.js';

function randomFor(x, z) {
  let seed = (Math.imul(x, 374761393) ^ Math.imul(z, 668265263)) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorld(scene) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 256;
  const context = textureCanvas.getContext('2d');
  context.fillStyle = '#b6d988';
  context.fillRect(0, 0, 256, 256);
  context.fillStyle = '#b2d583';
  context.fillRect(0, 0, 128, 128);
  context.fillRect(128, 128, 128, 128);
  const random = randomFor(12, 34);
  for (let i = 0; i < 150; i++) {
    const x = random() * 256;
    const y = random() * 256;
    context.strokeStyle = i % 2 ? '#9ac473' : '#c6e399';
    context.lineWidth = 1.6;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 2, y - 3);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(40, 40);
  texture.anisotropy = 4;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 320),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const safeCircle = new THREE.Mesh(
    new THREE.RingGeometry(SAFE_RADIUS, SAFE_RADIUS + 0.75, 512),
    new THREE.MeshBasicMaterial({ color: '#781c2b', side: THREE.DoubleSide, toneMapped: false }),
  );
  safeCircle.rotation.x = -Math.PI / 2;
  scene.add(safeCircle);

  const scenery = new THREE.Group();
  scene.add(scenery);
  const tileCount = 81;
  const flowersPerTile = 3;
  const flowerCount = tileCount * flowersPerTile;
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: 1 });
  function instances(geometry, material, count) {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // The fixed recycled window is small; its instances change at tile boundaries.
    mesh.frustumCulled = false;
    scenery.add(mesh);
    return mesh;
  }
  const stems = instances(new THREE.CylinderGeometry(0.022, 0.035, 1, 5), mat('#658b40'), flowerCount);
  const petals = instances(new THREE.SphereGeometry(1, 8, 6), mat('#fff9e7'), flowerCount * 5);
  const centers = instances(new THREE.SphereGeometry(1, 10, 6), mat('#f6c742'), flowerCount);
  const rocks = instances(new THREE.IcosahedronGeometry(1, 0), mat('#a4ad8f'), tileCount);
  const bushes = instances(new THREE.SphereGeometry(1, 8, 6), mat('#86b15e'), tileCount * 2);
  const dummy = new THREE.Object3D();
  function place(mesh, index, x, y, z, sx, sy, sz, rotation = 0) {
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, rotation, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }

  let previousX;
  let previousZ;
  function update(x, z, viewScale = 1) {
    // Expand the ground with the camera so huge Wally never exposes its edges.
    ground.scale.set(viewScale, viewScale, 1);
    texture.repeat.set(40 * viewScale, 40 * viewScale);
    // Keep the world boundary fixed around the starting point as Wally explores.
    safeCircle.position.set(-x, 0.025, -z);
    const anchorX = chunkAnchor(x);
    const anchorZ = chunkAnchor(z);
    // Keep all GPU coordinates near zero, even after hours of wandering.
    scenery.position.set(anchorX.offset, 0, anchorZ.offset);
    const textureOrigin = (40 - texture.repeat.x) / 2;
    texture.offset.set(((x / 8 + textureOrigin) % 1 + 1) % 1, ((-z / 8 + textureOrigin) % 1 + 1) % 1);
    if (anchorX.index === previousX && anchorZ.index === previousZ) return;
    previousX = anchorX.index;
    previousZ = anchorZ.index;
    let tile = 0;
    for (let dx = -4; dx <= 4; dx++) {
      for (let dz = -4; dz <= 4; dz++) {
        const rand = randomFor(anchorX.index + dx, anchorZ.index + dz);
        const point = () => [(dx + rand()) * CHUNK_SIZE, (dz + rand()) * CHUNK_SIZE];
        for (let f = 0; f < flowersPerTile; f++) {
          const [px, pz] = point();
          const height = 0.22 + rand() * 0.18;
          const index = tile * flowersPerTile + f;
          place(stems, index, px, height / 2, pz, 1, height, 1);
          place(centers, index, px, height, pz, 0.09, 0.06, 0.09);
          for (let petal = 0; petal < 5; petal++) {
            const angle = petal / 5 * Math.PI * 2;
            place(petals, index * 5 + petal, px + Math.cos(angle) * 0.11, height - 0.02,
              pz + Math.sin(angle) * 0.11, 0.13, 0.035, 0.07, -angle);
          }
        }
        const [rx, rz] = point();
        place(rocks, tile, rx, 0.09, rz, 0.2 + rand() * 0.2, 0.15, 0.22, rand() * 6);
        for (let bush = 0; bush < 2; bush++) {
          const [bx, bz] = point();
          place(bushes, tile * 2 + bush, bx, 0.035, bz, 0.18, 0.085, 0.32, rand() * 6);
        }
        tile++;
      }
    }
    for (const mesh of [stems, petals, centers, rocks, bushes]) mesh.instanceMatrix.needsUpdate = true;
  }
  update(0, 0);
  return { update };
}
