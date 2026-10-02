import { SAFE_RADIUS } from './challenge.js';

export const BANANA_EDGE_MARGIN = 2;
export const BANANA_RESET_SECONDS = 6 * 60;

export function sizeForBananas(eaten) {
  // Every snack adds volume. There is no maximum size or per-round growth limit.
  return Math.cbrt(1 + eaten * 0.6);
}

export function createFood() {
  // A few easy first snacks, followed by a repeatable spread across the whole world.
  const items = [
    { x: 4, z: 0 }, { x: -4, z: -2 }, { x: 0, z: 5 }, { x: 2, z: -6 },
  ];
  let seed = 2026;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let x = -SAFE_RADIUS; x <= SAFE_RADIUS; x += 8) {
    for (let z = -SAFE_RADIUS; z <= SAFE_RADIUS; z += 8) {
      const point = { x: x + (random() - 0.5) * 4, z: z + (random() - 0.5) * 4 };
      const radius = Math.hypot(point.x, point.z);
      if (radius > 9 && radius <= SAFE_RADIUS - BANANA_EDGE_MARGIN) items.push(point);
    }
  }
  // Triple the original field, filling the gaps without stacking fruit or blocking spawn.
  const targetCount = items.length * 3;
  const outerRadius = SAFE_RADIUS - BANANA_EDGE_MARGIN;
  while (items.length < targetCount) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(9 + random() * (outerRadius ** 2 - 9));
    const point = { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    if (items.every(banana => (banana.x - point.x) ** 2 + (banana.z - point.z) ** 2 >= 2.5 ** 2)) {
      items.push(point);
    }
  }
  return {
    items: items.map(point => ({ ...point, rotation: random() * Math.PI * 2, eaten: false })),
    eaten: 0,
    size: 1,
    refillElapsed: 0,
  };
}

export function advanceFood(food, seconds) {
  food.refillElapsed += Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  // Keep a shared six-minute schedule, even when a frame crosses the deadline.
  const refills = Math.floor((food.refillElapsed + 1e-9) / BANANA_RESET_SECONDS);
  if (!refills) return false;
  food.refillElapsed = Math.max(0, food.refillElapsed - refills * BANANA_RESET_SECONDS);
  for (const banana of food.items) banana.eaten = false;
  return true;
}

export function eatBananas(food, position) {
  const pickupRadius = 1.2 * food.size + 0.5;
  let collected = 0;
  for (const banana of food.items) {
    if (!banana.eaten && Math.hypot(banana.x - position.x, banana.z - position.z) <= pickupRadius) {
      banana.eaten = true;
      collected++;
    }
  }
  if (collected) {
    food.eaten += collected;
    food.size = sizeForBananas(food.eaten);
  }
  return collected;
}
