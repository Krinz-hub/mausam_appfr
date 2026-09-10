import { UserType, WeatherFactor } from '../types';
import { isValidUserType, isValidWeatherFactor } from '../vocabulary';

export interface AIParsedUserType {
  type: UserType;
  score: number;
}

export interface AIParsedNeed {
  factor: WeatherFactor;
  priority: number;
}

export interface AIParsedOutput {
  userTypes: AIParsedUserType[];
  needs: AIParsedNeed[];
  activePeriods: ('morning' | 'afternoon' | 'evening' | 'night')[];
}

export function validateAIParsedOutput(raw: any): AIParsedOutput {
  const result: AIParsedOutput = {
    userTypes: [],
    needs: [],
    activePeriods: [],
  };

  if (!raw || typeof raw !== 'object') {
    return result;
  }

  // Validate userTypes
  if (Array.isArray(raw.userTypes)) {
    for (const item of raw.userTypes) {
      if (item && typeof item.type === 'string' && isValidUserType(item.type)) {
        const score = typeof item.score === 'number' ? Math.max(0.1, Math.min(1.0, item.score)) : 0.75;
        result.userTypes.push({ type: item.type, score });
      }
    }
  }

  // Validate needs
  if (Array.isArray(raw.needs)) {
    for (const item of raw.needs) {
      if (item && typeof item.factor === 'string' && isValidWeatherFactor(item.factor)) {
        const priority = typeof item.priority === 'number' ? Math.max(0.1, Math.min(1.0, item.priority)) : 0.8;
        result.needs.push({ factor: item.factor, priority });
      }
    }
  }

  // Validate activePeriods
  const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
  if (Array.isArray(raw.activePeriods)) {
    for (const p of raw.activePeriods) {
      if (typeof p === 'string' && validPeriods.includes(p.toLowerCase())) {
        result.activePeriods.push(p.toLowerCase() as any);
      }
    }
  }

  return result;
}
