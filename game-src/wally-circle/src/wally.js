import * as THREE from 'three';

export function createWally() {
  const model = new THREE.Group();
  const sphere = new THREE.SphereGeometry(1, 28, 18);
  const material = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness });
  const fur = material('#ad602d');
  const face = material('#ba723b');
  const muzzle = material('#edb477');
  const black = material('#25201b', 0.45);
  const ivory = material('#fff2d5', 0.55);
  const white = material('#fffcf1');
  const red = material('#e13b28');
  const green = material('#276b3a');

  function ellipsoid(parent, mat, position, scale) {
    const mesh = new THREE.Mesh(sphere, mat);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function stroke(parent, points, radius, mat) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, radius, 6, false), mat);
    parent.add(mesh);
    return mesh;
  }

  ellipsoid(model, fur, [0, 0.73, -0.4], [0.91, 0.69, 1.2]);
  ellipsoid(model, face, [0, 1.4, 0.48], [0.79, 0.78, 0.7]);

  const flippers = [-1, 1].map(side => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.76, 0.4, 0.13);
    pivot.rotation.z = side * -0.18;
    model.add(pivot);
    const fin = ellipsoid(pivot, fur, [side * 0.25, 0, 0], [0.46, 0.14, 0.61]);
    fin.rotation.y = side * -0.4;
    return pivot;
  });

  for (const side of [-1, 1]) {
    const tail = ellipsoid(model, fur, [side * 0.28, 0.25, -1.5], [0.36, 0.13, 0.57]);
    tail.rotation.y = side * -0.45;
    ellipsoid(model, white, [side * 0.29, 1.73, 1.08], [0.185, 0.21, 0.095]);
    ellipsoid(model, black, [side * 0.27, 1.72, 1.167], [0.098, 0.133, 0.04]);
    ellipsoid(model, white, [side * 0.27 - 0.025, 1.77, 1.203], [0.031, 0.037, 0.014]);
    stroke(model, [
      [side * 0.12, 1.92, 1.15],
      [side * 0.28, 1.96, 1.14],
      [side * 0.47, 2.04, 1.08],
    ], 0.035, black);
    ellipsoid(model, muzzle, [side * 0.31, 1.26, 1.12], [0.38, 0.31, 0.28]);

    // Tapered, curved tusks are actual geometry, visible from every direction.
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(side * 0.4, 1.12, 1.26),
      new THREE.Vector3(side * 0.42, 0.78, 1.47),
      new THREE.Vector3(side * 0.39, 0.36, 1.51),
      new THREE.Vector3(side * 0.3, 0.3, 1.57),
    );
    const vertices = [];
    const indices = [];
    const rings = 20;
    const segments = 12;
    for (let ring = 0; ring <= rings; ring++) {
      const t = ring / rings;
      const center = curve.getPoint(t);
      const normal = new THREE.Vector3().crossVectors(curve.getTangent(t), new THREE.Vector3(1, 0, 0)).normalize();
      const radius = 0.117 * Math.pow(1 - t, 0.65) + 0.002;
      for (let segment = 0; segment <= segments; segment++) {
        const angle = segment / segments * Math.PI * 2;
        vertices.push(
          center.x + Math.cos(angle) * radius,
          center.y + normal.y * Math.sin(angle) * radius,
          center.z + normal.z * Math.sin(angle) * radius,
        );
        if (ring < rings && segment < segments) {
          const a = ring * (segments + 1) + segment;
          const b = a + segments + 1;
          indices.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const tusk = new THREE.Mesh(geometry, ivory);
    tusk.castShadow = true;
    model.add(tusk);

    for (let whisker = 0; whisker < 3; whisker++) {
      const y = 1.32 - whisker * 0.12;
      stroke(model, [
        [side * 0.47, y, 1.35],
        [side * 0.74, y + 0.07, 1.4],
        [side * 1.02, y + 0.14 - whisker * 0.07, 1.32],
      ], 0.012, black);
    }
    for (const [x, y] of [[0.29, 1.34], [0.43, 1.27], [0.34, 1.16]]) {
      ellipsoid(model, black, [side * x, y, 1.394], [0.018, 0.018, 0.011]);
    }
  }

  ellipsoid(model, black, [0, 1.46, 1.36], [0.18, 0.12, 0.13]);
  stroke(model, [[-0.18, 0.96, 1.18], [0, 0.91, 1.23], [0.19, 0.99, 1.19]], 0.023, black);

  const hat = new THREE.Group();
  hat.position.set(0, 2.04, 0.5);
  hat.rotation.z = -0.1;
  model.add(hat);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), red);
  cap.scale.set(0.83, 0.58, 0.72);
  cap.castShadow = true;
  hat.add(cap);
  ellipsoid(hat, green, [0, 0.025, 0.69], [0.83, 0.063, 0.58]);
  ellipsoid(hat, green, [0, 0.59, 0], [0.12, 0.08, 0.12]);
  const seam = material('#bd3021');
  for (const angle of [-1.2, 0, 1.2]) {
    const points = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8 * Math.PI / 2;
      points.push([Math.sin(angle) * Math.sin(t) * 0.837, Math.cos(t) * 0.585, Math.cos(angle) * Math.sin(t) * 0.726]);
    }
    stroke(hat, points, 0.014, seam);
  }

  return {
    model,
    animate(state, speed) {
      model.rotation.y = state.heading;
      model.position.y = Math.sin(state.distance * 5) * 0.035 * speed;
      model.rotation.z = Math.sin(state.distance * 4) * 0.035 * speed;
      flippers.forEach((fin, index) => {
        fin.rotation.x = Math.sin(state.distance * 5 + index * Math.PI) * 0.25 * speed;
      });
    },
  };
}
