export interface DecayPolicy {
  days0: number; // today
  days7: number; // 7 days
  days30: number; // 30 days
  days90: number; // 90 days
}

export const DEFAULT_DECAY_POLICY: DecayPolicy = {
  days0: 1.0,
  days7: 0.85,
  days30: 0.5,
  days90: 0.2,
};

export function calculateTimeDecayWeight(
  eventTimestamp: string | number,
  now: number = Date.now(),
  policy: DecayPolicy = DEFAULT_DECAY_POLICY
): number {
  const eventTime = typeof eventTimestamp === 'string' ? new Date(eventTimestamp).getTime() : eventTimestamp;
  const diffDays = Math.max(0, (now - eventTime) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return policy.days0;
  if (diffDays <= 7) {
    const factor = (diffDays - 1) / 6;
    return policy.days0 - factor * (policy.days0 - policy.days7);
  }
  if (diffDays <= 30) {
    const factor = (diffDays - 7) / 23;
    return policy.days7 - factor * (policy.days7 - policy.days30);
  }
  if (diffDays <= 90) {
    const factor = (diffDays - 30) / 60;
    return policy.days30 - factor * (policy.days30 - policy.days90);
  }
  return policy.days90;
}
