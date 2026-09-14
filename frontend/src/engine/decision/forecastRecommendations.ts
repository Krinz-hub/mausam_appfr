import { DailyForecastItem } from '../../services/weather/canonicalModel';
import { PersonaProfile } from '../types';

/**
 * Evaluates conditions and user persona to generate a concise, condition-driven
 * personalized daily recommendation.
 */
export function getDailyPersonalizedRecommendation(
  day: DailyForecastItem,
  persona?: PersonaProfile | null,
  aqi?: number
): string {
  const c = day.conditionText.toLowerCase();

  // 1. Severe Weather / Storm
  if (c.includes('thunder') || c.includes('storm')) {
    return 'Avoid exposed outdoor areas';
  }

  // 2. Rain Likelihood
  if (day.rainProb >= 50 || c.includes('rain') || c.includes('shower') || c.includes('drizzle')) {
    return 'Carry an umbrella';
  }

  // 3. Air Quality Warning
  if (aqi !== undefined && aqi >= 150) {
    return 'Consider a mask outdoors';
  }

  // 4. Extreme Heat
  if (day.maxTemp >= 35) {
    return 'Keep outdoor plans earlier';
  }

  // 5. Cold Weather
  if (day.maxTemp <= 17 || day.minTemp <= 12) {
    return 'Layer up before heading out';
  }

  // 6. High UV / Bright Sun
  if (day.maxTemp >= 31 && day.rainProb < 20) {
    return 'Use sunscreen & stay shaded';
  }

  // 7. Activity Persona (Fitness / Commuter)
  if (persona?.activities['fitness'] && day.rainProb < 25) {
    return 'Ideal workout morning';
  }
  if (persona?.activities['commuter'] && day.rainProb < 30) {
    return 'Clear commute route';
  }

  // 8. Comfortable default
  return 'Comfortable day ahead';
}
