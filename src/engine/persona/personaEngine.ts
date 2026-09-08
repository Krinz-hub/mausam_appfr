import {
  PersonaProfile,
  UserNeedProfile,
  WeatherFactor,
  PersonaTraits,
} from '../types';
import { applyBoundedUpdate } from './boundedUpdate';
import { calculateTimeDecayWeight } from './decay';

export class PersonaEngine {
  /**
   * Initializes a cold-start PersonaProfile from explicit UserNeedProfile choices.
   */
  public static initializeFromNeedProfile(
    profile: UserNeedProfile,
    userId: string
  ): PersonaProfile {
    const traits: PersonaTraits = {
      rain_sensitive: 0.5,
      heat_sensitive: 0.5,
      cold_sensitive: 0.5,
      wind_sensitive: 0.4,
      aqi_sensitive: 0.4,
      uv_sensitive: 0.4,
    };

    // Calibrate baseline traits based on explicit stated needs
    for (const need of profile.needs) {
      if (need.factor === 'rain' || need.factor === 'precipitation_probability') {
        traits.rain_sensitive = Math.max(traits.rain_sensitive, need.priority * 0.95);
      }
      if (need.factor === 'feels_like' || need.factor === 'temperature') {
        traits.heat_sensitive = Math.max(traits.heat_sensitive, need.priority * 0.9);
      }
      if (need.factor === 'wind') {
        traits.wind_sensitive = Math.max(traits.wind_sensitive, need.priority * 0.88);
      }
      if (need.factor === 'aqi' || need.factor === 'pollen') {
        traits.aqi_sensitive = Math.max(traits.aqi_sensitive, need.priority * 0.92);
      }
      if (need.factor === 'uv') {
        traits.uv_sensitive = Math.max(traits.uv_sensitive, need.priority * 0.88);
      }
    }

    const activities: Record<string, number> = {};
    for (const ut of profile.userTypes) {
      activities[ut.type] = ut.score;
    }

    const activePeriods: Record<
      'morning' | 'afternoon' | 'evening' | 'night',
      number
    > = {
      morning: 0.2,
      afternoon: 0.2,
      evening: 0.2,
      night: 0.2,
    };

    if (profile.activePeriods) {
      for (const p of profile.activePeriods) {
        activePeriods[p] = 0.85;
      }
    }

    return {
      userId,
      version: 1,
      traits,
      activities,
      activePeriods,
      confidence: 0.8,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Applies an incremental, bounded behavioral event to the persona.
   */
  public static recordBehaviorEvent(
    persona: PersonaProfile,
    event: {
      type: string;
      factor?: WeatherFactor;
      activity?: string;
      timestamp?: string;
      isPositive?: boolean;
    }
  ): PersonaProfile {
    const timestamp = event.timestamp || new Date().toISOString();
    const decayWeight = calculateTimeDecayWeight(timestamp);

    const updatedTraits = { ...persona.traits };
    const updatedActivities = { ...persona.activities };

    const direction = event.isPositive !== false ? 1 : -1;

    // Factor sensitivity updates
    if (event.factor) {
      if (event.factor === 'rain' || event.factor === 'precipitation_probability') {
        updatedTraits.rain_sensitive = applyBoundedUpdate(
          updatedTraits.rain_sensitive,
          direction,
          decayWeight
        );
      } else if (event.factor === 'feels_like' || event.factor === 'temperature') {
        updatedTraits.heat_sensitive = applyBoundedUpdate(
          updatedTraits.heat_sensitive,
          direction,
          decayWeight
        );
      } else if (event.factor === 'wind') {
        updatedTraits.wind_sensitive = applyBoundedUpdate(
          updatedTraits.wind_sensitive,
          direction,
          decayWeight
        );
      } else if (event.factor === 'aqi') {
        updatedTraits.aqi_sensitive = applyBoundedUpdate(
          updatedTraits.aqi_sensitive,
          direction,
          decayWeight
        );
      } else if (event.factor === 'uv') {
        updatedTraits.uv_sensitive = applyBoundedUpdate(
          updatedTraits.uv_sensitive,
          direction,
          decayWeight
        );
      }
    }

    // Activity relevance updates
    if (event.activity) {
      const current = updatedActivities[event.activity] || 0.5;
      updatedActivities[event.activity] = applyBoundedUpdate(
        current,
        direction,
        decayWeight
      );
    }

    // Gentle confidence increase with sample count
    const updatedConfidence = Math.min(0.98, persona.confidence + 0.005);

    return {
      ...persona,
      traits: updatedTraits,
      activities: updatedActivities,
      confidence: updatedConfidence,
      lastUpdated: new Date().toISOString(),
    };
  }
}
