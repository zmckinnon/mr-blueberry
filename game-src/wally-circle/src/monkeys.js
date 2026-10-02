import * as THREE from 'three';

export function createMonkeys(scene, capacity) {
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const fur = material('#794523');
  const tan = material('#efbe81');
  const pink = material('#d68b6a');
  const dark = material('#291b16');
  const white = material('#fffdf1');
  const yellow = material('#ffcf16');
  const stem = material('#655024');
  const tube = (points, radius) => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), 20, radius, 7, false,
  );
  const tailGeometry = tube([[0, 1.05, -0.3], [0, 1.1, -0.95], [0.35, 1.6, -1.2],
    [0.75, 1.9, -1], [0.85, 1.63, -0.8], [0.58, 1.48, -0.8]], 0.085);
  const smileGeometry = tube([[-0.18, 1.83, 0.63], [0, 1.77, 0.69], [0.18, 1.83, 0.63]], 0.018);
  const bananaGeometry = tube([[0, 0.35, 0], [0.19, 0.1, 0], [0.19, -0.2, 0], [0, -0.4, 0]], 0.105);

  function mesh(parent, geometry, mat, name) {
    const part = new THREE.Mesh(geometry, mat);
    part.name = name;
    part.castShadow = part.receiveShadow = true;
    parent.add(part);
    return part;
  }
  function ball(parent, mat, position, scale, name) {
    const part = mesh(parent, sphere, mat, name);
    part.position.set(...position);
    part.scale.set(...scale);
    return part;
  }
  function limb(parent, x, y, name, isArm) {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(x, y, 0);
    parent.add(pivot);
    ball(pivot, fur, [0, -0.3, 0], [0.16, 0.39, 0.17], `${name}-fur`);
    ball(pivot, tan, [0, -0.64, isArm ? 0 : 0.12],
      isArm ? [0.19, 0.19, 0.18] : [0.21, 0.14, 0.32], `${name}-${isArm ? 'hand' : 'foot'}`);
    return pivot;
  }

  const models = Array.from({ length: capacity }, (_, index) => {
    const model = new THREE.Group();
    model.name = `monkey-${index}`;
    scene.add(model);
    ball(model, fur, [0, 1.18, 0], [0.51, 0.61, 0.4], 'body');
    ball(model, tan, [0, 1.18, 0.3], [0.34, 0.45, 0.14], 'belly');
    ball(model, fur, [0, 2.04, 0], [0.59, 0.55, 0.49], 'head');
    ball(model, tan, [0, 2.03, 0.29], [0.46, 0.43, 0.3], 'face');
    ball(model, tan, [0, 1.9, 0.49], [0.32, 0.23, 0.22], 'muzzle');
    ball(model, dark, [0, 2.02, 0.68], [0.1, 0.065, 0.045], 'nose');
    for (const side of [-1, 1]) {
      ball(model, fur, [side * 0.62, 2.07, 0], [0.27, 0.29, 0.15], 'ear');
      ball(model, pink, [side * 0.65, 2.07, 0.12], [0.17, 0.19, 0.045], 'inner-ear');
      ball(model, white, [side * 0.19, 2.19, 0.5], [0.13, 0.16, 0.065], 'eye');
      ball(model, dark, [side * 0.19, 2.18, 0.558], [0.068, 0.09, 0.025], 'pupil');
      ball(model, white, [side * 0.19 - 0.018, 2.22, 0.58], [0.022, 0.025, 0.012], 'eye-glint');
    }
    mesh(model, smileGeometry, dark, 'smile');
    const tail = mesh(model, tailGeometry, fur, 'curled-tail');
    const leftArm = limb(model, -0.53, 1.61, 'left-arm', true);
    const rightArm = limb(model, 0.53, 1.61, 'right-arm', true);
    const legs = [-1, 1].map(side => limb(model, side * 0.26, 0.78, `${side === -1 ? 'left' : 'right'}-leg`, false));

    // Keep a bright bunch attached to the swinging hand, visible from both sides.
    const bunch = new THREE.Group();
    bunch.name = 'held-bananas';
    bunch.position.set(0.09, -0.74, 0.13);
    bunch.rotation.z = -0.35;
    rightArm.add(bunch);
    for (const offset of [-1, 0, 1]) {
      const banana = mesh(bunch, bananaGeometry, yellow, 'held-banana');
      banana.position.x = offset * 0.15;
      banana.position.z = Math.abs(offset) * 0.08;
      banana.rotation.z = offset * -0.18;
      const tip = ball(banana, stem, [0, -0.4, 0], [0.065, 0.065, 0.065], 'banana-tip');
      tip.castShadow = false;
    }
    ball(bunch, stem, [0, 0.38, 0], [0.1, 0.12, 0.1], 'banana-stem');
    return { model, leftArm, rightArm, legs, tail };
  });

  return {
    update(monkeys, player, viewRadius) {
      monkeys.items.forEach((monkey, index) => {
        const { model, leftArm, rightArm, legs, tail } = models[index];
        const x = monkey.x - player.x;
        const z = monkey.z - player.z;
        model.visible = !monkey.caught && Math.hypot(x, z) <= viewRadius;
        if (!model.visible) return;
        const swing = Math.sin(monkey.stride);
        model.position.set(x, Math.abs(Math.cos(monkey.stride)) * 0.12, z);
        model.rotation.set(0.08, monkey.heading, 0);
        leftArm.rotation.x = swing * 0.65;
        rightArm.rotation.x = -0.9 - swing * 0.18;
        legs[0].rotation.x = -swing * 0.75;
        legs[1].rotation.x = swing * 0.75;
        tail.rotation.z = swing * 0.12;
      });
    },
  };
}
