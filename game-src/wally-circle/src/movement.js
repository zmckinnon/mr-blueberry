export const MOVE_SPEED = 15;
export const CHUNK_SIZE = 12;

export function createMovement() {
  return { x: 0, z: 0, heading: 0, distance: 0 };
}

export function normalizeInput(x, z) {
  const divisor = Math.max(1, Math.hypot(x, z));
  return { x: x / divisor, z: z / divisor };
}

export function speedForSize() {
  return MOVE_SPEED;
}

export function moveWally(state, input, elapsed, size = 1) {
  // Discard long gaps after a suspended tab instead of teleporting the player.
  const dt = Number.isFinite(elapsed) ? Math.max(0, Math.min(elapsed, 0.05)) : 0;
  const direction = normalizeInput(input.x, input.z);
  const distance = speedForSize(size) * dt;
  state.x += direction.x * distance;
  state.z += direction.z * distance;
  const speed = Math.hypot(direction.x, direction.z);
  state.distance += distance * speed;

  if (speed > 0.001) {
    const target = Math.atan2(direction.x, direction.z);
    const turn = Math.atan2(Math.sin(target - state.heading), Math.cos(target - state.heading));
    state.heading += turn * (1 - Math.exp(-18 * dt));
    state.heading = Math.atan2(Math.sin(state.heading), Math.cos(state.heading));
  }
  return speed;
}

export function chunkAnchor(position) {
  const index = Math.floor(position / CHUNK_SIZE);
  return { index, offset: index * CHUNK_SIZE - position };
}
