const BASE_DISTANCE = Math.hypot(10.2, 15);
const ELEVATION_SIN = 10.2 / BASE_DISTANCE;
const ELEVATION_COS = 15 / BASE_DISTANCE;
const TAN_HALF_FOV = Math.tan(20 * Math.PI / 180);

export function getGrowthView(size, aspect) {
  const targetHeight = 0.8 * size;
  const horizontalSlope = TAN_HALF_FOV * aspect * 0.86;
  const verticalSlope = TAN_HALF_FOV * 0.86;
  let distance = BASE_DISTANCE * (1 + (size - 1) * 0.3);

  // Fit Wally's whole body at any heading, including his hat, tusks, tail, and sway.
  // This changes camera distance, never his size in the world.
  for (const x of [-2.4 * size, 2.4 * size]) {
    for (const y of [-0.1 * size - targetHeight, 2.9 * size - targetHeight]) {
      for (const z of [-2.4 * size, 2.4 * size]) {
        const towardCamera = y * ELEVATION_SIN + z * ELEVATION_COS;
        const screenY = y * ELEVATION_COS - z * ELEVATION_SIN;
        distance = Math.max(distance,
          Math.abs(x) / horizontalSlope + towardCamera,
          Math.abs(screenY) / verticalSlope + towardCamera);
      }
    }
  }
  const scale = distance / BASE_DISTANCE;
  return {
    scale,
    targetHeight,
    cameraHeight: targetHeight + distance * ELEVATION_SIN,
    cameraDepth: distance * ELEVATION_COS,
    near: 0.1 * scale,
    far: 150 * scale,
    fogNear: 25 * scale,
    fogFar: 46 * scale,
  };
}
