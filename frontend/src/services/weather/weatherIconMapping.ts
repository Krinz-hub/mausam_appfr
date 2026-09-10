import { Ionicons } from '@expo/vector-icons';

export interface WeatherIconLookupParams {
  condition?: string;
  hour?: number; // 0 - 23
  time?: string | Date; // e.g. "12 AM", "2026-09-08T01:00:00", or ISO timestamp
  isNight?: boolean; // Explicit override if provided
  sunrise?: string | Date; // e.g. "2026-09-08T06:08" or "06:08"
  sunset?: string | Date; // e.g. "2026-09-08T18:26" or "18:26"
  color?: string; // Optional custom color override
}

export interface WeatherIconResult {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  isNight: boolean;
  category: 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow' | 'other';
}

/**
 * Parses time into minutes from midnight (0 - 1439).
 */
function parseTimeToMinutes(timeVal?: string | Date, hourVal?: number): number {
  if (hourVal !== undefined && hourVal >= 0 && hourVal <= 23) {
    return hourVal * 60 + 30; // Mid-hour point
  }

  if (!timeVal) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  if (timeVal instanceof Date) {
    return timeVal.getHours() * 60 + timeVal.getMinutes();
  }

  const str = timeVal.trim();

  // Handle "12 AM", "1 AM", "2 PM", etc.
  const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 30;
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h * 60 + m;
  }

  // Handle ISO string or date parseable string (e.g. "2026-09-08T04:00" or "04:00")
  const colonMatch = str.match(/(?:T|\s|^)(\d{1,2}):(\d{2})/);
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10);
    const m = parseInt(colonMatch[2], 10);
    return h * 60 + m;
  }

  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.getHours() * 60 + parsedDate.getMinutes();
  }

  // Fallback to current time
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Parses sunrise/sunset strings into minutes from midnight.
 */
function parseSunEventToMinutes(event?: string | Date, defaultMinutes: number = 360): number {
  if (!event) return defaultMinutes;
  if (event instanceof Date) {
    return event.getHours() * 60 + event.getMinutes();
  }

  const str = event.trim();
  const colonMatch = str.match(/(?:T|\s|^)(\d{1,2}):(\d{2})/);
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10);
    const m = parseInt(colonMatch[2], 10);
    return h * 60 + m;
  }

  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.getHours() * 60 + parsedDate.getMinutes();
  }

  return defaultMinutes;
}

/**
 * Dynamically computes whether a specific hour/time is night,
 * based on actual local sunrise and sunset data.
 */
export function determineIsNight(
  timeVal?: string | Date,
  hourVal?: number,
  sunrise?: string | Date,
  sunset?: string | Date,
  explicitIsNight?: boolean
): boolean {
  if (explicitIsNight !== undefined) {
    return explicitIsNight;
  }

  const targetMinutes = parseTimeToMinutes(timeVal, hourVal);
  // Default sunrise: ~6:08 AM (368 min), sunset: ~6:26 PM (1106 min) if not provided
  const sunriseMinutes = parseSunEventToMinutes(sunrise, 368);
  const sunsetMinutes = parseSunEventToMinutes(sunset, 1106);

  // If time is before sunrise or at/after sunset, it is night!
  const isDay = targetMinutes >= sunriseMinutes && targetMinutes < sunsetMinutes;
  return !isDay;
}

/**
 * Centralized mapping for weather conditions to real Ionicons glyphs and color palettes.
 * Distinguishes day vs night appropriately (no daytime sun at night!).
 */
export function resolveWeatherIcon(params: WeatherIconLookupParams): WeatherIconResult {
  const {
    condition = '',
    hour,
    time,
    isNight: explicitIsNight,
    sunrise,
    sunset,
    color,
  } = params;

  const isNight = determineIsNight(time, hour, sunrise, sunset, explicitIsNight);
  const c = condition.toLowerCase();

  // Theme-tailored icon colors
  const nightAccent = '#35B7F2'; // Cyan/Blue night accent
  const nightMoon = '#93C5FD';   // Soft celestial moon blue
  const daySun = '#F59E0B';      // Amber daytime sun
  const rainBlue = '#35B7F2';    // Vivid rain
  const stormAmber = '#F2A93B';  // Thunderstorm warning amber
  const cloudMuted = '#94A3B8';  // Calm cloud grey
  const snowCyan = '#BAE6FD';    // Frost cyan

  // 1. Storm / Thunderstorm
  if (c.includes('thunder') || c.includes('storm')) {
    return {
      name: 'thunderstorm-outline',
      color: color || stormAmber,
      isNight,
      category: 'storm',
    };
  }

  // 2. Snow / Ice / Blizzard / Sleet
  if (c.includes('snow') || c.includes('blizzard') || c.includes('ice') || c.includes('sleet')) {
    return {
      name: 'snow-outline',
      color: color || snowCyan,
      isNight,
      category: 'snow',
    };
  }

  // 3. Rain / Showers / Downpour / Drizzle
  if (
    c.includes('rain') ||
    c.includes('shower') ||
    c.includes('drizzle') ||
    c.includes('downpour')
  ) {
    return {
      name: 'rainy-outline',
      color: color || rainBlue,
      isNight,
      category: 'rain',
    };
  }

  // 4. Fog / Mist / Haze
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) {
    return {
      name: 'cloud-outline',
      color: color || cloudMuted,
      isNight,
      category: 'fog',
    };
  }

  // 5. Overcast
  if (c.includes('overcast')) {
    return {
      name: 'cloudy-outline',
      color: color || cloudMuted,
      isNight,
      category: 'cloudy',
    };
  }

  // 6. Partly cloudy
  if (c.includes('partly') || (c.includes('cloud') && !c.includes('overcast'))) {
    return {
      name: isNight ? 'cloudy-night-outline' : 'partly-sunny-outline',
      color: color || (isNight ? nightMoon : daySun),
      isNight,
      category: 'partly_cloudy',
    };
  }

  // 7. Clear skies / mainly clear / night / default
  if (isNight || c.includes('night') || c.includes('moon')) {
    return {
      name: 'moon-outline',
      color: color || nightAccent,
      isNight,
      category: 'clear',
    };
  }

  // Clear day
  return {
    name: 'sunny-outline',
    color: color || daySun,
    isNight,
    category: 'clear',
  };
}
