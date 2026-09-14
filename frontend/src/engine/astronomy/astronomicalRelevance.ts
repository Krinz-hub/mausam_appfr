import { PersonaProfile } from '../types';
import { CanonicalWeatherData, HourlyForecastItem } from '../../services/weather/canonicalModel';
import {
  AstronomicalContext,
  AstronomicalInsight,
  AstronomicalInsightType,
  AstronomicalRelevanceReason,
  AstronomicalSeverity,
  AstronomicalDiagnosticReport,
} from './astronomicalTypes';
import { resolveAstronomicalCharacterState } from './characterResolver';

export interface EvaluationOptions {
  currentDate?: Date;
  referenceHour?: number;
}

/**
 * Calculates temporal urgency score (0.0 to 1.0) based on minutes until event.
 */
export function calculateTemporalUrgency(minutesUntilEvent: number | null): number {
  if (minutesUntilEvent === null) return 0.1;
  const absMins = Math.abs(minutesUntilEvent);

  if (absMins <= 15) return 1.0;
  if (absMins <= 30) return 0.85;
  if (absMins <= 60) return 0.65;
  if (absMins <= 120) return 0.40;
  return 0.15;
}

/**
 * Formats a Date or time string into friendly 12-hour format e.g. "6:02 AM".
 */
export function formatAstronomicalTime(date: Date | null): string | null {
  if (!date || isNaN(date.getTime())) return null;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Formats date as YYYY-MM-DD for deterministic IDs.
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if severe weather conditions are present.
 */
export function isSevereWeatherActive(weather: CanonicalWeatherData): boolean {
  const cur = weather.current;
  const code = cur.weatherCode ?? 0;
  const cond = (cur.conditionText || '').toLowerCase();
  return (
    code >= 95 ||
    code === 96 ||
    code === 99 ||
    cond.includes('thunder') ||
    cond.includes('lightning') ||
    cur.windSpeed > 45
  );
}

/**
 * Main evaluation function that checks astronomical events against persona,
 * activities, weather conditions, and forecast.
 */
export function evaluateAstronomicalCandidates(
  context: AstronomicalContext,
  weather: CanonicalWeatherData,
  persona: PersonaProfile,
  options?: EvaluationOptions
): { candidates: AstronomicalInsight[]; diagnostics: AstronomicalDiagnosticReport[] } {
  const candidates: AstronomicalInsight[] = [];
  const diagnostics: AstronomicalDiagnosticReport[] = [];
  const now = options?.currentDate || new Date();
  const dateKey = formatDateKey(now);
  const cur = weather.current;
  const severe = isSevereWeatherActive(weather);

  // If astronomical data is unavailable, return empty gracefully
  if (!context.sunrise || !context.sunset) {
    diagnostics.push({
      event: null,
      minutesRemaining: null,
      userActivity: null,
      weatherSuitability: 0,
      activityRelevance: 0,
      urgency: 0,
      finalScore: 0,
      decision: 'SUPPRESS',
      reason: 'Astronomical data missing or incomplete',
    });
    return { candidates, diagnostics };
  }

  // Helper to compute final weighted priority score (0–100)
  const computeScore = (
    userRel: number,
    urgency: number,
    actImpact: number,
    weatherInt: number,
    conf: number
  ): number => {
    const raw =
      userRel * 0.30 +
      urgency * 0.25 +
      actImpact * 0.20 +
      weatherInt * 0.15 +
      conf * 0.10;
    return Math.round(Math.max(0, Math.min(1.0, raw)) * 100);
  };

  const confidence = persona.confidence || 0.85;

  // -------------------------------------------------------------
  // 1. RUNNER / FITNESS
  // -------------------------------------------------------------
  const fitnessRelevance = persona.activities['fitness'] || 0;
  const morningPreference = persona.activePeriods?.morning || 0.5;

  // 1A. Runner + Sunrise approaching
  if (
    context.minutesUntilSunrise !== null &&
    context.minutesUntilSunrise >= -30 &&
    context.minutesUntilSunrise <= 120
  ) {
    const userRel = fitnessRelevance * (morningPreference > 0.4 ? 1.0 : 0.7);
    const urgency = calculateTemporalUrgency(context.minutesUntilSunrise);

    // Weather suitability for outdoor run
    let weatherSuitability = 0.9;
    if (severe) {
      weatherSuitability = 0.0; // Severe weather blocks outdoor running
    } else if (cur.rainProbability > 45 || (cur.precipitation !== undefined && cur.precipitation > 0)) {
      weatherSuitability = 0.25;
    } else if (cur.temperature > 32 || cur.feelsLike > 34) {
      weatherSuitability = 0.4;
    } else if (cur.aqi && cur.aqi > 150) {
      weatherSuitability = 0.2;
    }

    const impact = morningPreference > 0.5 ? 0.9 : 0.65;
    const score = computeScore(userRel, urgency, impact, weatherSuitability, confidence);

    if (severe) {
      diagnostics.push({
        event: 'sunrise',
        minutesRemaining: context.minutesUntilSunrise,
        userActivity: 'running',
        weatherSuitability,
        activityRelevance: userRel,
        urgency,
        finalScore: score,
        decision: 'SUPPRESS',
        reason: 'Severe weather takes priority over running window',
      });
    } else if (score >= 50 && userRel >= 0.35 && weatherSuitability >= 0.5) {
      const minutesText =
        context.minutesUntilSunrise > 0
          ? `in ${context.minutesUntilSunrise} minutes`
          : 'just opening';
      const eventTimeStr = formatAstronomicalTime(context.sunrise);

      candidates.push({
        id: `astronomy:sunrise:runner:${dateKey}`,
        type: 'sunrise_activity_window',
        priority: score,
        title: 'Your morning run window is opening',
        message: `Sunrise is ${minutesText} and conditions are comfortable.`,
        eventTime: eventTimeStr,
        minutesUntilEvent: context.minutesUntilSunrise,
        relevanceReason: 'activity',
        activity: 'running',
        severity: score >= 85 ? 'important' : 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'sunrise_activity_window',
          activity: 'running',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunrise.getTime() + 90 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });

      diagnostics.push({
        event: 'sunrise',
        minutesRemaining: context.minutesUntilSunrise,
        userActivity: 'running',
        weatherSuitability,
        activityRelevance: userRel,
        urgency,
        finalScore: score,
        decision: 'SHOW',
      });
    } else {
      diagnostics.push({
        event: 'sunrise',
        minutesRemaining: context.minutesUntilSunrise,
        userActivity: 'running',
        weatherSuitability,
        activityRelevance: userRel,
        urgency,
        finalScore: score,
        decision: 'SUPPRESS',
        reason: weatherSuitability < 0.5 ? 'Weather unfavorable for running' : 'Score below threshold or insufficient user relevance',
      });
    }
  }

  // 1B. Runner / Fitness + Sunset approaching (fading daylight run window)
  if (
    context.minutesUntilSunset !== null &&
    context.minutesUntilSunset >= 0 &&
    context.minutesUntilSunset <= 90
  ) {
    const eveningPref = persona.activePeriods?.evening || 0.4;
    const userRel = fitnessRelevance * (eveningPref > 0.4 ? 0.9 : 0.6);
    const urgency = calculateTemporalUrgency(context.minutesUntilSunset);
    const weatherSuitability = severe ? 0 : cur.rainProbability > 50 ? 0.3 : 0.85;
    const impact = 0.75;
    const score = computeScore(userRel, urgency, impact, weatherSuitability, confidence);

    if (score >= 50 && userRel >= 0.4 && weatherSuitability >= 0.5) {
      candidates.push({
        id: `astronomy:sunset:runner:${dateKey}`,
        type: 'sunset_activity_window',
        priority: score,
        title: 'Daylight is fading',
        message: `Sunset in ${context.minutesUntilSunset} minutes. Your evening workout still has a daylight window.`,
        eventTime: formatAstronomicalTime(context.sunset),
        minutesUntilEvent: context.minutesUntilSunset,
        relevanceReason: 'activity',
        activity: 'running',
        severity: 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'sunset_activity_window',
          activity: 'running',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunset.getTime() + 30 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // -------------------------------------------------------------
  // 2. CYCLIST
  // -------------------------------------------------------------
  const cyclistRelevance = persona.activities['cyclist'] || 0;
  if (
    cyclistRelevance > 0.35 &&
    context.minutesUntilSunset !== null &&
    context.minutesUntilSunset >= 0 &&
    context.minutesUntilSunset <= 75
  ) {
    const urgency = calculateTemporalUrgency(context.minutesUntilSunset);
    let weatherSuitability = 0.9;
    if (severe || cur.windSpeed > 35) weatherSuitability = 0.1;
    else if (cur.rainProbability > 40) weatherSuitability = 0.3;

    const impact = 0.85; // Lights required if daylight ends
    const score = computeScore(cyclistRelevance, urgency, impact, weatherSuitability, confidence);

    if (score >= 50 && weatherSuitability >= 0.5) {
      candidates.push({
        id: `astronomy:sunset:cyclist:${dateKey}`,
        type: 'sunset_activity_window',
        priority: score,
        title: 'Daylight is ending soon',
        message: `Sunset in ${context.minutesUntilSunset} minutes. If you're riding later, consider leaving soon or using lights.`,
        eventTime: formatAstronomicalTime(context.sunset),
        minutesUntilEvent: context.minutesUntilSunset,
        relevanceReason: 'activity',
        activity: 'cycling',
        severity: score >= 80 ? 'important' : 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'sunset_activity_window',
          activity: 'cycling',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunset.getTime() + 45 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // -------------------------------------------------------------
  // 3. COMMUTER
  // -------------------------------------------------------------
  const commuterRelevance = persona.activities['commuter'] || 0;
  const isFoggyOrPoorVis =
    cur.weatherCode === 45 ||
    cur.weatherCode === 48 ||
    (cur.visibility !== undefined && cur.visibility <= 3);

  // 3A. Commuter before sunrise (pre-dawn or dawn commute)
  if (
    context.minutesUntilSunrise !== null &&
    context.minutesUntilSunrise > 0 &&
    context.minutesUntilSunrise <= 75 &&
    (now.getHours() >= 4 && now.getHours() <= 8)
  ) {
    const urgency = calculateTemporalUrgency(context.minutesUntilSunrise);
    const impact = isFoggyOrPoorVis ? 0.95 : 0.75;
    const weatherInt = isFoggyOrPoorVis ? 0.95 : 0.6;
    const score = computeScore(commuterRelevance, urgency, impact, weatherInt, confidence);

    if (score >= 50 && commuterRelevance >= 0.4) {
      const fogNote = isFoggyOrPoorVis
        ? ' Reduced visibility and low light ahead.'
        : ' Expect low-light conditions during the start of your trip.';

      candidates.push({
        id: `astronomy:sunrise:commute:${dateKey}`,
        type: 'low_light_commute',
        priority: score,
        title: "Heading out before sunrise",
        message: `Sunrise in ${context.minutesUntilSunrise} minutes.${fogNote}`,
        eventTime: formatAstronomicalTime(context.sunrise),
        minutesUntilEvent: context.minutesUntilSunrise,
        relevanceReason: 'commute',
        activity: 'commute',
        severity: isFoggyOrPoorVis ? 'important' : 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'low_light_commute',
          activity: 'commute',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunrise.getTime() + 30 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // 3B. Commuter after sunset / dusk
  if (
    context.minutesUntilSunset !== null &&
    context.minutesUntilSunset <= 30 &&
    context.minutesUntilSunset >= -60 &&
    (now.getHours() >= 16 && now.getHours() <= 21)
  ) {
    const urgency = calculateTemporalUrgency(context.minutesUntilSunset);
    const impact = 0.75;
    const weatherInt = isFoggyOrPoorVis ? 0.9 : 0.6;
    const score = computeScore(commuterRelevance, urgency, impact, weatherInt, confidence);

    if (score >= 50 && commuterRelevance >= 0.4) {
      candidates.push({
        id: `astronomy:sunset:commute:${dateKey}`,
        type: 'low_light_commute',
        priority: score,
        title: 'Commute into twilight',
        message: 'Your commute overlaps dusk. Natural light will decrease as daylight fades.',
        eventTime: formatAstronomicalTime(context.sunset),
        minutesUntilEvent: context.minutesUntilSunset,
        relevanceReason: 'commute',
        activity: 'commute',
        severity: 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'low_light_commute',
          activity: 'commute',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunset.getTime() + 60 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // -------------------------------------------------------------
  // 4. GARDENER / FARMER / AGRICULTURE
  // -------------------------------------------------------------
  const agriRelevance =
    persona.activities['agriculture'] ||
    persona.activities['gardening'] ||
    persona.activities['work'] ||
    0;

  if (
    agriRelevance > 0.35 &&
    context.minutesUntilSunrise !== null &&
    context.minutesUntilSunrise >= -20 &&
    context.minutesUntilSunrise <= 90
  ) {
    const urgency = calculateTemporalUrgency(context.minutesUntilSunrise);
    // Check if afternoon heat will rise
    const heatExpected = weather.daily[0]?.maxTemp >= 32 || cur.temperature >= 28;
    const weatherSuitability = severe ? 0 : cur.rainProbability > 50 ? 0.4 : 0.9;
    const impact = heatExpected ? 0.95 : 0.75;
    const score = computeScore(agriRelevance, urgency, impact, weatherSuitability, confidence);

    if (!severe && score >= 50 && weatherSuitability >= 0.5) {
      const msg = heatExpected
        ? 'The cooler morning period starts soon. Good time to tend your plants before temperatures rise.'
        : 'Sunrise is approaching. Good window for morning plant care and outdoor work.';

      candidates.push({
        id: `astronomy:sunrise:gardener:${dateKey}`,
        type: 'early_morning_outdoor_window',
        priority: score,
        title: 'Early garden window',
        message: msg,
        eventTime: formatAstronomicalTime(context.sunrise),
        minutesUntilEvent: context.minutesUntilSunrise,
        relevanceReason: 'agriculture',
        activity: 'gardening',
        severity: heatExpected ? 'important' : 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'early_morning_outdoor_window',
          activity: 'gardening',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunrise.getTime() + 120 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // -------------------------------------------------------------
  // 5. HEALTH & UV TRANSITION
  // -------------------------------------------------------------
  const uvSensitivity = persona.traits.uv_sensitive || 0.4;
  if (
    uvSensitivity > 0.5 &&
    context.minutesSinceSunrise !== null &&
    context.minutesSinceSunrise >= 0 &&
    context.minutesSinceSunrise <= 120 &&
    cur.uvIndex !== undefined &&
    cur.uvIndex >= 4
  ) {
    const urgency = 0.75;
    const impact = 0.8;
    const score = computeScore(uvSensitivity, urgency, impact, 0.8, confidence);

    if (score >= 55) {
      candidates.push({
        id: `astronomy:uv:transition:${dateKey}`,
        type: 'uv_daylight_transition',
        priority: score,
        title: 'UV exposure rising',
        message: `UV levels are increasing with morning sun (index ${cur.uvIndex}). Plan sun protection for outdoor activities.`,
        eventTime: formatAstronomicalTime(context.sunrise),
        minutesUntilEvent: -context.minutesSinceSunrise,
        relevanceReason: 'health',
        activity: 'health',
        severity: 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'uv_daylight_transition',
          activity: 'health',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(now.getTime() + 2 * 60 * 60000).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // -------------------------------------------------------------
  // 6. TRAVELER
  // -------------------------------------------------------------
  const travelerRelevance = persona.activities['traveler'] || persona.activities['travel'] || 0;
  if (travelerRelevance > 0.4) {
    // Sunset crossing travel
    if (
      context.minutesUntilSunset !== null &&
      context.minutesUntilSunset >= 0 &&
      context.minutesUntilSunset <= 60
    ) {
      const urgency = calculateTemporalUrgency(context.minutesUntilSunset);
      const score = computeScore(travelerRelevance, urgency, 0.75, 0.7, confidence);
      if (score >= 50) {
        candidates.push({
          id: `astronomy:sunset:traveler:${dateKey}`,
          type: 'daylight_remaining',
          priority: score,
          title: 'Travel daylight window',
          message: `Your journey overlaps sunset in ${context.minutesUntilSunset} minutes. Expect lower natural light ahead.`,
          eventTime: formatAstronomicalTime(context.sunset),
          minutesUntilEvent: context.minutesUntilSunset,
          relevanceReason: 'travel',
          activity: 'travel',
          severity: 'useful',
          actionable: true,
          characterState: resolveAstronomicalCharacterState({
            insightType: 'daylight_remaining',
            activity: 'travel',
            weather: cur,
            isSevereWeather: severe,
          }),
          expiresAt: new Date(context.sunset.getTime() + 45 * 60000).toISOString(),
          source: 'astronomical_weather_combined',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 7. BEACH / LEISURE
  // -------------------------------------------------------------
  const beachRelevance = persona.activities['beach'] || 0;
  if (
    beachRelevance > 0.4 &&
    context.minutesUntilSunset !== null &&
    context.minutesUntilSunset >= 15 &&
    context.minutesUntilSunset <= 75
  ) {
    const weatherSuitability = severe || cur.rainProbability > 40 ? 0.1 : 0.9;
    const urgency = calculateTemporalUrgency(context.minutesUntilSunset);
    const score = computeScore(beachRelevance, urgency, 0.8, weatherSuitability, confidence);

    if (!severe && score >= 50 && weatherSuitability >= 0.5) {
      candidates.push({
        id: `astronomy:sunset:beach:${dateKey}`,
        type: 'evening_outdoor_window',
        priority: score,
        title: 'Evening beach window',
        message: `You have about ${context.minutesUntilSunset} minutes of daylight left under comfortable conditions.`,
        eventTime: formatAstronomicalTime(context.sunset),
        minutesUntilEvent: context.minutesUntilSunset,
        relevanceReason: 'leisure',
        activity: 'beach',
        severity: 'useful',
        actionable: true,
        characterState: resolveAstronomicalCharacterState({
          insightType: 'evening_outdoor_window',
          activity: 'beach',
          weather: cur,
          isSevereWeather: severe,
        }),
        expiresAt: new Date(context.sunset.getTime()).toISOString(),
        source: 'astronomical_weather_combined',
      });
    }
  }

  // Sort candidates by priority score descending
  candidates.sort((a, b) => b.priority - a.priority);

  return { candidates, diagnostics };
}
