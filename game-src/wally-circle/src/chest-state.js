import { SAFE_RADIUS } from './challenge.js';
import { grantBananas } from './food.js';

export const CHEST_REWARD = 9;
const CHEST_COUNT = 24;

export function createChestState(bananas) {
  const items = [];
  let seed = 9281;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function place(x, z, rotation) {
    if (bananas.some(banana => Math.hypot(banana.x - x, banana.z - z) < 2.2)) return false;
    if (items.some(chest => Math.hypot(chest.x - x, chest.z - z) < 16)) return false;
    items.push({ x, z, rotation, opened: false });
    return true;
  }
  // Keep one chest within sight of the start, in a clear space between bananas.
  for (let step = 0; step < 24; step++) {
    const angle = -Math.PI / 6 + step * Math.PI / 12;
    if (place(Math.cos(angle) * 8, Math.sin(angle) * 8, 0)) break;
  }
  while (items.length < CHEST_COUNT) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(18 ** 2 + random() * ((SAFE_RADIUS - 3) ** 2 - 18 ** 2));
    place(Math.cos(angle) * radius, Math.sin(angle) * radius, random() * Math.PI * 2);
  }
  return { items };
}

export function openChests(chests, food, position) {
  const reach = 1.2 * food.size + 0.85;
  let opened = 0;
  for (const chest of chests.items) {
    if (!chest.opened && Math.hypot(chest.x - position.x, chest.z - position.z) <= reach) {
      chest.opened = true;
      opened++;
    }
  }
  if (opened) grantBananas(food, opened * CHEST_REWARD);
  return opened;
}
