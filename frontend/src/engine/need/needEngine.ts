import {
  UserType,
  WeatherFactor,
  UserNeedProfile,
  NeedFactorPriority,
  UserTypeScore,
} from '../types';
import { NEED_MATRIX } from './needMatrix';
import {
  parseUserTypeSelections,
  parseWeatherFactorSelections,
} from './selectionParser';

export interface NeedEngineInput {
  userTypeKeys: string[];
  weatherFactorKeys?: string[];
  activePeriods?: ('morning' | 'afternoon' | 'evening' | 'night')[];
  aiExtractedNeeds?: {
    userTypes?: { type: UserType; score: number }[];
    needs?: { factor: WeatherFactor; priority: number }[];
    activePeriods?: ('morning' | 'afternoon' | 'evening' | 'night')[];
  };
}

export class NeedEngine {
  /**
   * Deterministically builds a UserNeedProfile from explicit choices + optional AI extraction.
   * Direct selection strictly takes precedence over AI inference.
   */
  public static computeProfile(input: NeedEngineInput): UserNeedProfile {
    const directUserTypes = parseUserTypeSelections(input.userTypeKeys || []);
    const directFactors = parseWeatherFactorSelections(input.weatherFactorKeys || []);

    // 1. Calculate multi-type user scores
    const userTypesMap: Map<UserType, number> = new Map();

    // Direct selections receive high scores based on order/relevance
    directUserTypes.forEach((ut, index) => {
      // Primary selection gets 0.95, secondary gets 0.85, tertiary 0.75, etc.
      const score = Math.max(0.6, 0.95 - index * 0.1);
      userTypesMap.set(ut, score);
    });

    // Blend AI extracted user types (if any, with lower weight than direct selection)
    if (input.aiExtractedNeeds?.userTypes) {
      for (const item of input.aiExtractedNeeds.userTypes) {
        if (!userTypesMap.has(item.type)) {
          userTypesMap.set(item.type, Math.min(0.85, item.score * 0.9));
        } else {
          // Reinforce existing type
          const current = userTypesMap.get(item.type)!;
          userTypesMap.set(item.type, Math.min(1.0, current + 0.05));
        }
      }
    }

    const userTypes: UserTypeScore[] = Array.from(userTypesMap.entries())
      .map(([type, score]) => ({ type, score: Number(score.toFixed(2)) }))
      .sort((a, b) => b.score - a.score);

    // 2. Compute Factor Priorities
    const factorMap: Map<WeatherFactor, NeedFactorPriority> = new Map();

    // A. Matrix Inferences from User Types
    for (const utScore of userTypes) {
      const matrixWeights = NEED_MATRIX[utScore.type] || {};
      for (const [factorKey, baseWeight] of Object.entries(matrixWeights)) {
        const factor = factorKey as WeatherFactor;
        const weightedPriority = (baseWeight || 0.5) * utScore.score;
        const existing = factorMap.get(factor);
        if (!existing || existing.priority < weightedPriority) {
          factorMap.set(factor, {
            factor,
            priority: Number(weightedPriority.toFixed(2)),
            confidence: 0.82,
            source: 'selection',
          });
        }
      }
    }

    // B. AI Extracted Factors (Source: 'ai')
    if (input.aiExtractedNeeds?.needs) {
      for (const item of input.aiExtractedNeeds.needs) {
        const existing = factorMap.get(item.factor);
        if (!existing || existing.priority < item.priority) {
          factorMap.set(item.factor, {
            factor: item.factor,
            priority: Number(item.priority.toFixed(2)),
            confidence: 0.88,
            source: 'ai',
          });
        }
      }
    }

    // C. Direct Factor Selections (Source: 'selection' -> Highest precedence)
    for (const factor of directFactors) {
      factorMap.set(factor, {
        factor,
        priority: 0.98,
        confidence: 1.0,
        source: 'selection',
      });
    }

    const needs: NeedFactorPriority[] = Array.from(factorMap.values()).sort(
      (a, b) => b.priority - a.priority
    );

    // 3. Active Periods (Direct selection or AI parsed)
    const activePeriods =
      input.activePeriods && input.activePeriods.length > 0
        ? input.activePeriods
        : input.aiExtractedNeeds?.activePeriods || ['morning', 'afternoon'];

    return {
      userTypes,
      needs,
      activePeriods,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
  }
}
