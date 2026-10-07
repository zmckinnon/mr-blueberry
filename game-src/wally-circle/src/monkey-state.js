import { grantBananas } from './food.js';

export const MONKEY_REWARD = 20;

import { SAFE_RADIUS } from './challenge.js';

export const MONKEY_COUNT = 11;
const RUN_SPEED = 4.5;

function nextDestination(monkey) {
  // Each monkey has its own repeatable random stream for roaming the whole field.
  const random = () => {
    monkey.seed = (Math.imul(monkey.seed, 1664525) + 1013904223) >>> 0;
    return monkey.seed / 4294967296;
  };
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random()) * (SAFE_RADIUS - 4);
  monkey.targetX = Math.cos(angle) * radius;
  monkey.targetZ = Math.sin(angle) * radius;
}

export function createMonkeyState() {
  return {
    items: Array.from({ length: MONKEY_COUNT }, (_, index) => {
      const angle = index * Math.PI * 2 / MONKEY_COUNT;
      const radius = 24 + (index % 3) * 28;
      const monkey = {
        x: Math.cos(angle) * radius, z: Math.sin(angle) * radius,
        heading: 0, stride: 0, caught: false, seed: 12345 + index * 7919,
      };
      nextDestination(monkey);
      monkey.heading = Math.atan2(monkey.targetX - monkey.x, monkey.targetZ - monkey.z);
      return monkey;
    }),
  };
}

export function advanceMonkeys(monkeys, seconds) {
  const dt = Number.isFinite(seconds) ? Math.max(0, Math.min(seconds, 0.05)) : 0;
  if (!dt) return;
  for (const monkey of monkeys.items) {
    if (monkey.caught) continue;
    let remaining = RUN_SPEED * dt;
    while (remaining > 0) {
      const dx = monkey.targetX - monkey.x;
      const dz = monkey.targetZ - monkey.z;
      const distance = Math.hypot(dx, dz);
      if (distance <= remaining) {
        monkey.x = monkey.targetX;
        monkey.z = monkey.targetZ;
        remaining -= distance;
        nextDestination(monkey);
      } else {
        monkey.x += dx / distance * remaining;
        monkey.z += dz / distance * remaining;
        remaining = 0;
      }
    }
    monkey.heading = Math.atan2(monkey.targetX - monkey.x, monkey.targetZ - monkey.z);
    monkey.stride = (monkey.stride + dt * 11) % (Math.PI * 2);
  }
}

export function catchMonkeys(monkeys, food, player) {
  const reach = 1.2 * food.size + 0.65;
  let caught = 0;
  for (const monkey of monkeys.items) {
    if (!monkey.caught && Math.hypot(monkey.x - player.x, monkey.z - player.z) <= reach) {
      monkey.caught = true;
      caught++;
    }
  }
  if (caught) grantBananas(food, caught * MONKEY_REWARD);
  return caught;
}
