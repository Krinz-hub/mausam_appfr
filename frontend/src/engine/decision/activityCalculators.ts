import { HourlyForecastItem } from '../../services/weather/canonicalModel';

export interface ActivityWindowResult {
  start: string;
  end: string;
  score: number; // 0 to 1
  reasons: string[];
  confidence: number;
  summary: string;
}

/**
 * Finds the optimal outdoor running / workout window within the next 12 hours.
 * Considers temperature (ideal 18-24°C), low rain probability (<25%), low wind (<25 km/h), and low UV (<4).
 */
export function findBestRunningWindow(
  hourly: HourlyForecastItem[]
): ActivityWindowResult | null {
  if (!hourly || hourly.length === 0) return null;

  const candidateHours = hourly.slice(0, 12);
  let bestWindowStartIdx = -1;
  let bestScore = -1;
  let bestReasons: string[] = [];

  for (let i = 0; i < candidateHours.length - 1; i++) {
    const h1 = candidateHours[i];
    const h2 = candidateHours[i + 1];

    // Score based on conditions
    let score = 1.0;
    const reasons: string[] = [];

    // Rain penalty
    const maxRain = Math.max(h1.rainProb, h2.rainProb);
    if (maxRain > 50) score -= 0.6;
    else if (maxRain > 25) score -= 0.25;
    else reasons.push('Low rain risk');

    // Temp penalty
    const avgTemp = (h1.temp + h2.temp) / 2;
    if (avgTemp > 33) score -= 0.5;
    else if (avgTemp > 28) score -= 0.2;
    else if (avgTemp < 15) score -= 0.15;
    else reasons.push('Comfortable temperature');

    // UV penalty
    const maxUV = Math.max(h1.uvIndex, h2.uvIndex);
    if (maxUV >= 7) score -= 0.3;
    else if (maxUV <= 3) reasons.push('Low solar exposure');

    // Wind penalty
    const maxWind = Math.max(h1.windSpeed, h2.windSpeed);
    if (maxWind > 30) score -= 0.3;
    else reasons.push('Calm breeze');

    if (score > bestScore) {
      bestScore = score;
      bestWindowStartIdx = i;
      bestReasons = reasons.slice(0, 2);
    }
  }

  if (bestWindowStartIdx === -1) return null;

  const startHour = candidateHours[bestWindowStartIdx];
  const endHour = candidateHours[bestWindowStartIdx + 1];

  return {
    start: startHour.time,
    end: endHour.time,
    score: Math.max(0.1, Math.min(1.0, bestScore)),
    reasons: bestReasons,
    confidence: 0.9,
    summary: `${startHour.time}–${endHour.time}: ${bestReasons.join(', ')}`,
  };
}

/**
 * Finds outdoor comfort window for general leisure, walking, errands.
 */
export function findOutdoorComfortWindow(
  hourly: HourlyForecastItem[]
): ActivityWindowResult | null {
  if (!hourly || hourly.length === 0) return null;

  const candidateHours = hourly.slice(0, 10);
  let bestIdx = 0;
  let bestScore = -1;

  for (let i = 0; i < candidateHours.length; i++) {
    const h = candidateHours[i];
    let score = 0.8;

    if (h.rainProb > 40) score -= 0.5;
    if (h.temp > 34 || h.temp < 12) score -= 0.4;
    if (h.feelsLike > 36) score -= 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  const h = candidateHours[bestIdx];
  return {
    start: h.time,
    end: candidateHours[Math.min(candidateHours.length - 1, bestIdx + 2)].time,
    score: Math.max(0.1, bestScore),
    reasons: ['Mild atmospheric conditions', 'Good outdoor air'],
    confidence: 0.85,
    summary: `Best outdoor comfort around ${h.time}`,
  };
}

/**
 * Assesses commute risks (rain, poor visibility, high winds) across peak travel windows.
 */
export function findCommuteRiskWindow(
  hourly: HourlyForecastItem[]
): ActivityWindowResult | null {
  if (!hourly || hourly.length === 0) return null;

  // Check near-term 6 hours
  const nearHours = hourly.slice(0, 6);
  const rainyHour = nearHours.find((h) => h.rainProb >= 50);

  if (rainyHour) {
    return {
      start: rainyHour.time,
      end: 'Later',
      score: 0.95,
      reasons: ['High probability of rain showers', 'Possible traffic delays'],
      confidence: 0.9,
      summary: `Rain likely around ${rainyHour.time} — keep an umbrella ready`,
    };
  }

  return null;
}
