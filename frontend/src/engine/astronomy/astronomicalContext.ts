import { CanonicalWeatherData } from '../../services/weather/canonicalModel';
import {
  AstronomicalContext,
  AstronomicalPhase,
  AstronomicalEvent,
} from './astronomicalTypes';

/**
 * Safely parses a Date from ISO string, timestamp, or Date object.
 * Returns null if invalid or missing.
 */
export function parseAstronomicalDate(
  input?: Date | string | null,
  referenceDate: Date = new Date()
): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle "HH:mm" format by attaching to referenceDate
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [hStr, mStr] = trimmed.split(':');
    const d = new Date(referenceDate);
    d.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
    return d;
  }

  // Parse ISO string (e.g. "2026-09-14T06:02" or with timezone)
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Normalizes astronomical context from weather data and current time.
 * Fully timezone-aware and handles missing values without throwing.
 */
export function computeAstronomicalContext(
  weather?: CanonicalWeatherData | null,
  currentTimeInput?: Date | string | null
): AstronomicalContext {
  const now = parseAstronomicalDate(currentTimeInput) || new Date();

  // Fallback defaults for missing data
  const fallbackClockHour = now.getHours();
  let fallbackPhase: AstronomicalPhase = 'morning';
  if (fallbackClockHour < 5) fallbackPhase = 'night';
  else if (fallbackClockHour < 7) fallbackPhase = 'dawn';
  else if (fallbackClockHour < 12) fallbackPhase = 'morning';
  else if (fallbackClockHour < 17) fallbackPhase = 'afternoon';
  else if (fallbackClockHour < 21) fallbackPhase = 'evening';
  else fallbackPhase = 'night';

  if (!weather || !weather.current) {
    return {
      sunrise: null,
      sunset: null,
      dawn: null,
      dusk: null,
      currentPhase: fallbackPhase,
      minutesUntilSunrise: null,
      minutesSinceSunrise: null,
      minutesUntilSunset: null,
      minutesSinceSunset: null,
      daylightRemainingMinutes: null,
      daylightElapsedMinutes: null,
      isDaylight: fallbackClockHour >= 6 && fallbackClockHour < 18,
      isNight: fallbackClockHour < 6 || fallbackClockHour >= 18,
      nextRelevantEvent: null,
    };
  }

  const sunriseDate = parseAstronomicalDate(weather.current.sunrise, now);
  const sunsetDate = parseAstronomicalDate(weather.current.sunset, now);

  if (!sunriseDate || !sunsetDate) {
    return {
      sunrise: null,
      sunset: null,
      dawn: null,
      dusk: null,
      currentPhase: fallbackPhase,
      minutesUntilSunrise: null,
      minutesSinceSunrise: null,
      minutesUntilSunset: null,
      minutesSinceSunset: null,
      daylightRemainingMinutes: null,
      daylightElapsedMinutes: null,
      isDaylight: fallbackClockHour >= 6 && fallbackClockHour < 18,
      isNight: fallbackClockHour < 6 || fallbackClockHour >= 18,
      nextRelevantEvent: null,
    };
  }

  // Calculate dawn (45 min before sunrise) and dusk (45 min after sunset)
  const dawnDate = new Date(sunriseDate.getTime() - 45 * 60 * 1000);
  const duskDate = new Date(sunsetDate.getTime() + 45 * 60 * 1000);

  const nowMs = now.getTime();
  const srMs = sunriseDate.getTime();
  const ssMs = sunsetDate.getTime();
  const dawnMs = dawnDate.getTime();
  const duskMs = duskDate.getTime();

  // Minute deltas
  const minutesUntilSunrise = Math.round((srMs - nowMs) / 60000);
  const minutesSinceSunrise = Math.round((nowMs - srMs) / 60000);
  const minutesUntilSunset = Math.round((ssMs - nowMs) / 60000);
  const minutesSinceSunset = Math.round((nowMs - ssMs) / 60000);

  const isDaylight = nowMs >= srMs && nowMs < ssMs;
  const isNight = !isDaylight && (nowMs < dawnMs || nowMs >= duskMs);

  // Daylight remaining / elapsed
  const totalDaylightMinutes = Math.max(0, Math.round((ssMs - srMs) / 60000));
  let daylightRemainingMinutes: number = 0;
  let daylightElapsedMinutes: number = 0;

  if (nowMs < srMs) {
    daylightRemainingMinutes = totalDaylightMinutes;
    daylightElapsedMinutes = 0;
  } else if (nowMs >= ssMs) {
    daylightRemainingMinutes = 0;
    daylightElapsedMinutes = totalDaylightMinutes;
  } else {
    daylightRemainingMinutes = Math.max(0, minutesUntilSunset);
    daylightElapsedMinutes = Math.max(0, minutesSinceSunrise);
  }

  // Solar midpoint
  const solarMidpointMs = Math.round((srMs + ssMs) / 2);

  // Determine standard AstronomicalPhase
  let currentPhase: AstronomicalPhase;
  if (nowMs < dawnMs) {
    currentPhase = 'pre_dawn';
  } else if (nowMs >= dawnMs && nowMs < srMs + 45 * 60 * 1000) {
    currentPhase = 'dawn';
  } else if (nowMs >= srMs + 45 * 60 * 1000 && nowMs < solarMidpointMs) {
    currentPhase = 'morning';
  } else if (nowMs >= solarMidpointMs && nowMs < ssMs - 60 * 60 * 1000) {
    currentPhase = 'afternoon';
  } else if (nowMs >= ssMs - 60 * 60 * 1000 && nowMs < ssMs) {
    currentPhase = 'evening';
  } else if (nowMs >= ssMs && nowMs < duskMs) {
    currentPhase = 'dusk';
  } else {
    currentPhase = 'night';
  }

  // Next relevant event
  let nextRelevantEvent: 'sunrise' | 'sunset' | 'dawn' | 'dusk' | null = null;
  if (nowMs < dawnMs) {
    nextRelevantEvent = 'dawn';
  } else if (nowMs < srMs) {
    nextRelevantEvent = 'sunrise';
  } else if (nowMs < ssMs) {
    nextRelevantEvent = 'sunset';
  } else if (nowMs < duskMs) {
    nextRelevantEvent = 'dusk';
  } else {
    nextRelevantEvent = 'sunrise'; // Next day's sunrise
  }

  return {
    sunrise: sunriseDate,
    sunset: sunsetDate,
    dawn: dawnDate,
    dusk: duskDate,
    currentPhase,
    minutesUntilSunrise,
    minutesSinceSunrise,
    minutesUntilSunset,
    minutesSinceSunset,
    daylightRemainingMinutes,
    daylightElapsedMinutes,
    isDaylight,
    isNight,
    nextRelevantEvent,
  };
}
