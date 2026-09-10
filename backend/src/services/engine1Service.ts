/**
 * Engine 1 (User Personalization) Server-Side Processing Service.
 * Validates onboarding answers, generates structured NeedProfile,
 * and initializes baseline PersonaProfile for MongoDB persistence.
 */

export interface OnboardingInput {
  userTypeKeys: string[];
  weatherFactorKeys: string[];
  activePeriods: ('morning' | 'afternoon' | 'evening' | 'night')[];
  explanation?: string;
}

export interface UserTypeScore {
  type: string;
  score: number;
}

export interface FactorPriority {
  factor: string;
  priority: number;
}

export interface UserNeedProfile {
  userTypes: UserTypeScore[];
  needs: FactorPriority[];
  activePeriods: string[];
  explanation?: string;
  version: number;
  computedAt: string;
}

export interface PersonaTraits {
  rain_sensitive: number;
  heat_sensitive: number;
  wind_sensitive: number;
  cold_sensitive: number;
  aqi_sensitive: number;
  uv_sensitive: number;
}

export interface PersonaProfile {
  userId: string;
  traits: PersonaTraits;
  confidence: number;
  activities: Record<string, boolean>;
  lastUpdated: string;
}

// Correlation coefficients mapping user types to factor priorities
const BASE_TYPE_WEIGHTS: Record<string, Record<string, number>> = {
  commuter: { rain: 0.9, feels_like: 0.8, wind: 0.6, aqi: 0.8, uv: 0.4 },
  fitness: { rain: 0.85, feels_like: 0.9, wind: 0.7, aqi: 0.95, uv: 0.8 },
  outdoor: { rain: 0.95, feels_like: 0.85, wind: 0.9, aqi: 0.7, uv: 0.75 },
  health: { aqi: 0.95, feels_like: 0.85, uv: 0.85, rain: 0.6, wind: 0.5 },
  travel: { rain: 0.8, feels_like: 0.7, wind: 0.6, aqi: 0.6, uv: 0.6 },
  daily: { rain: 0.75, feels_like: 0.75, wind: 0.5, aqi: 0.6, uv: 0.5 },
  exercise: { rain: 0.85, feels_like: 0.9, wind: 0.7, aqi: 0.95, uv: 0.8 },
  work: { rain: 0.9, feels_like: 0.85, wind: 0.85, aqi: 0.75, uv: 0.8 },
  gardening: { rain: 0.95, feels_like: 0.7, wind: 0.8, aqi: 0.5, uv: 0.7 },
  curious: { rain: 0.5, feels_like: 0.5, wind: 0.5, aqi: 0.5, uv: 0.5 },
};

export class Engine1Service {
  public static processOnboarding(input: OnboardingInput, userId: string): {
    needProfile: UserNeedProfile;
    personaProfile: PersonaProfile;
    userProfileData: {
      userTypes: UserTypeScore[];
      interests: string[];
      activities: string[];
    };
  } {
    const userTypes: UserTypeScore[] = input.userTypeKeys.map((key, idx) => ({
      type: key,
      score: Math.max(0.4, Number((0.95 - idx * 0.1).toFixed(2))),
    }));

    // Calculate aggregated factor weights
    const factorScores: Record<string, number> = {
      rain: 0.5,
      heat: 0.5,
      wind: 0.4,
      cold: 0.4,
      aqi: 0.5,
      uv: 0.4,
    };

    // Boost scores based on explicit factor selection
    input.weatherFactorKeys.forEach((k) => {
      const key = k === 'air_quality' ? 'aqi' : k;
      if (key in factorScores) {
        factorScores[key] = Math.min(1.0, factorScores[key] + 0.35);
      }
    });

    // Incorporate user type matrices
    input.userTypeKeys.forEach((t) => {
      const weights = BASE_TYPE_WEIGHTS[t.toLowerCase()];
      if (weights) {
        Object.entries(weights).forEach(([factor, val]) => {
          const mappedKey = factor === 'feels_like' ? 'heat' : factor;
          if (mappedKey in factorScores) {
            factorScores[mappedKey] = Math.max(factorScores[mappedKey], val);
          }
        });
      }
    });

    const needs: FactorPriority[] = Object.entries(factorScores)
      .map(([factor, priority]) => ({ factor, priority: Number(priority.toFixed(2)) }))
      .sort((a, b) => b.priority - a.priority);

    const nowIso = new Date().toISOString();

    const needProfile: UserNeedProfile = {
      userTypes,
      needs,
      activePeriods: input.activePeriods,
      explanation: input.explanation,
      version: 1,
      computedAt: nowIso,
    };

    const traits: PersonaTraits = {
      rain_sensitive: factorScores.rain || 0.5,
      heat_sensitive: factorScores.heat || 0.5,
      wind_sensitive: factorScores.wind || 0.4,
      cold_sensitive: factorScores.cold || 0.4,
      aqi_sensitive: factorScores.aqi || 0.5,
      uv_sensitive: factorScores.uv || 0.4,
    };

    const activities: Record<string, boolean> = {};
    input.userTypeKeys.forEach((k) => {
      activities[k] = true;
    });

    const personaProfile: PersonaProfile = {
      userId,
      traits,
      confidence: 0.5, // Baseline confidence on cold start
      activities,
      lastUpdated: nowIso,
    };

    const interests = input.weatherFactorKeys;
    const activitiesList = input.userTypeKeys;

    return {
      needProfile,
      personaProfile,
      userProfileData: {
        userTypes,
        interests,
        activities: activitiesList,
      },
    };
  }
}
