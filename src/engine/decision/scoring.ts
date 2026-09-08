export interface ScoringParams {
  needPriority: number; // 0 to 1
  weatherSeverity: number; // 0 to 1
  contextRelevance: number; // 0 to 1
  temporalRelevance: number; // 0 to 1
  confidence: number; // 0 to 1
}

/**
 * Deterministic recommendation scoring formula:
 * score = needPriority * weatherSeverity * contextRelevance * temporalRelevance * confidence
 */
export function calculateRecommendationScore(params: ScoringParams): number {
  const {
    needPriority,
    weatherSeverity,
    contextRelevance,
    temporalRelevance,
    confidence,
  } = params;

  const raw =
    needPriority *
    (0.3 + 0.7 * weatherSeverity) *
    contextRelevance *
    temporalRelevance *
    confidence;

  return Number(Math.max(0, Math.min(1.0, raw)).toFixed(3));
}
