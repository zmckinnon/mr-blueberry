import { grantBananas } from './food.js';

export const MONKEY_REWARD = 20;

function positionMonkey(monkey) {
  monkey.x = monkey.centerX + Math.cos(monkey.phase) * monkey.radiusX;
  monkey.z = monkey.centerZ + Math.sin(monkey.phase) * monkey.radiusZ;
  monkey.heading = Math.atan2(
    -Math.sin(monkey.phase) * monkey.radiusX * monkey.pace,
    Math.cos(monkey.phase) * monkey.radiusZ * monkey.pace,
  );
}

export function createMonkeyState() {
  // Three looping routes inside the circle. Small Wally can outrun them;
  // big Wally can intercept them with his wider reach.
  const routes = [
    { centerX: -9, centerZ: -6, radiusX: 6, radiusZ: 4, phase: 0, pace: 0.65 },
    { centerX: 15, centerZ: -14, radiusX: 9, radiusZ: 7, phase: Math.PI, pace: -0.5 },
    { centerX: -20, centerZ: -29, radiusX: 11, radiusZ: 8, phase: Math.PI / 2, pace: 0.4 },
  ];
  return {
    items: routes.map(route => {
      const monkey = { ...route, stride: 0, caught: false };
      positionMonkey(monkey);
      return monkey;
    }),
  };
}

export function advanceMonkeys(monkeys, seconds) {
  // Match Wally's movement cap so a delayed frame cannot teleport a monkey.
  const dt = Number.isFinite(seconds) ? Math.max(0, Math.min(seconds, 0.05)) : 0;
  for (const monkey of monkeys.items) {
    if (monkey.caught) continue;
    monkey.phase = (monkey.phase + monkey.pace * dt) % (Math.PI * 2);
    monkey.stride = (monkey.stride + dt * 11) % (Math.PI * 2);
    positionMonkey(monkey);
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
