export const SAFE_RADIUS = 120;
export const OUTSIDE_SECONDS = 12;

export function createChallenge() {
  return { elapsed: 0, leftAt: null, outside: false, remaining: OUTSIDE_SECONDS, gameOver: false };
}

export function updateChallenge(challenge, position, seconds) {
  if (challenge.gameOver) return;
  // Use real active-play time, independently of the movement step's safety cap.
  challenge.elapsed += Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  if (challenge.outside) {
    challenge.remaining = Math.max(0, OUTSIDE_SECONDS - (challenge.elapsed - challenge.leftAt));
    // Check the deadline before accepting a return: late arrivals cannot revive a round.
    if (challenge.remaining < 1e-9) {
      challenge.remaining = 0;
      challenge.gameOver = true;
      return;
    }
  }

  const outside = Math.hypot(position.x, position.z) > SAFE_RADIUS;
  if (!outside) {
    challenge.leftAt = null;
    challenge.remaining = OUTSIDE_SECONDS;
  } else if (!challenge.outside) {
    challenge.leftAt = challenge.elapsed;
    challenge.remaining = OUTSIDE_SECONDS;
  }
  challenge.outside = outside;
}
