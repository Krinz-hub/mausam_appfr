export const MAX_SINGLE_EVENT_DELTA = 0.06;
export const LEARNING_RATE = 0.65;

/**
 * Updates a trait or activity score safely with dampening and bounds.
 * Prevents a single accidental tap from overturning a persona.
 */
export function applyBoundedUpdate(
  currentScore: number,
  targetDirection: number, // 1 for increase, -1 for decrease
  decayWeight: number = 1.0,
  intensity: number = 1.0
): number {
  const rawDelta = targetDirection * MAX_SINGLE_EVENT_DELTA * intensity * decayWeight * LEARNING_RATE;
  const clampedDelta = Math.max(-MAX_SINGLE_EVENT_DELTA, Math.min(MAX_SINGLE_EVENT_DELTA, rawDelta));
  const newScore = currentScore + clampedDelta;

  // Bounded between 0.05 and 0.98
  return Number(Math.max(0.05, Math.min(0.98, newScore)).toFixed(3));
}
