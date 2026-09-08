import {
  WeatherSnapshot,
  HourlyForecastItem,
  DailyForecastItem,
  CanonicalWeatherData,
} from './canonicalModel';
import { determineIsNight } from './weatherIconMapping';

export function getWmoCondition(code: number): { text: string; emoji: string } {
  switch (code) {
    case 0:
      return { text: 'Clear skies', emoji: '☀️' };
    case 1:
      return { text: 'Mainly clear', emoji: '🌤️' };
    case 2:
      return { text: 'Partly cloudy', emoji: '⛅' };
    case 3:
      return { text: 'Overcast', emoji: '☁️' };
    case 45:
    case 48:
      return { text: 'Foggy', emoji: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { text: 'Drizzle', emoji: '🌦️' };
    case 61:
    case 63:
    case 65:
      return { text: 'Rain', emoji: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { text: 'Snow', emoji: '❄️' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain showers', emoji: '🌧️' };
    case 95:
    case 96:
    case 99:
      return { text: 'Thunderstorm', emoji: '⛈️' };
    default:
      return { text: 'Mild', emoji: '🌤️' };
  }
}

export function formatHourLabel(isoString: string): { label: string; hour: number } {
  let hour = 0;
  if (isoString.includes('T')) {
    const timePart = isoString.split('T')[1];
    const hourStr = timePart.split(':')[0];
    const parsed = parseInt(hourStr, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) {
      hour = parsed;
    } else {
      const date = new Date(isoString);
      hour = date.getHours();
    }
  } else {
    const date = new Date(isoString);
    hour = date.getHours();
  }
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return { label: `${displayHour} ${ampm}`, hour };
}

export function formatDayLabel(isoString: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function normalizeOpenMeteoResponse(
  raw: any,
  locationName: string = 'Bengaluru',
  rawAqi?: any
): CanonicalWeatherData {
  const current = raw.current || {};
  const hourly = raw.hourly || {};
  const daily = raw.daily || {};

  const currentWmo = current.weather_code ?? 0;
  const condition = getWmoCondition(currentWmo);

  const sunrise = daily.sunrise ? daily.sunrise[0] : undefined;
  const sunset = daily.sunset ? daily.sunset[0] : undefined;
  const isDay =
    current.is_day !== undefined
      ? current.is_day === 1
      : sunrise && sunset
      ? !determineIsNight(current.time, undefined, sunrise, sunset)
      : undefined;

  // Determine current hour start index in hourly timeline (so timeline starts with upcoming hours)
  const times: string[] = hourly.time || [];
  let startIndex = 0;
  if (current.time && times.length > 0) {
    const currentHourPrefix = current.time.slice(0, 13);
    const found = times.findIndex((t) => t.startsWith(currentHourPrefix));
    if (found !== -1) {
      startIndex = found;
    } else {
      const foundLater = times.findIndex((t) => t >= current.time);
      if (foundLater !== -1) {
        startIndex = foundLater;
      }
    }
  }

  const safeProbIndex = startIndex < (hourly.precipitation_probability?.length || 0) ? startIndex : 0;
  const safeUvIndex = startIndex < (hourly.uv_index?.length || 0) ? startIndex : 0;
  const safeVisIndex = startIndex < (hourly.visibility?.length || 0) ? startIndex : 0;

  const aqiVal =
    rawAqi?.current?.us_aqi ??
    rawAqi?.current?.european_aqi ??
    raw?.current?.aqi;

  const normalizedCurrent: WeatherSnapshot = {
    timestamp: current.time || new Date().toISOString(),
    temperature: current.temperature_2m ?? 26,
    feelsLike: current.apparent_temperature ?? current.temperature_2m ?? 28,
    humidity: current.relative_humidity_2m ?? 60,
    rainProbability: hourly.precipitation_probability ? hourly.precipitation_probability[safeProbIndex] ?? 0 : 0,
    windSpeed: current.wind_speed_10m ?? 12,
    uvIndex: hourly.uv_index ? hourly.uv_index[safeUvIndex] : undefined,
    aqi: aqiVal,
    visibility: hourly.visibility ? Math.round((hourly.visibility[safeVisIndex] || 10000) / 1000) : undefined,
    precipitation: current.precipitation ?? 0,
    sunrise,
    sunset,
    isDay,
    weatherCode: currentWmo,
    conditionText: condition.text,
    conditionEmoji: isDay === false ? '🌙' : condition.emoji,
  };

  // Build Hourly Timeline (next 24 hours starting from current hour)
  const normalizedHourly: HourlyForecastItem[] = [];
  const count = Math.min(24, times.length - startIndex);

  for (let offset = 0; offset < count; offset++) {
    const i = startIndex + offset;
    const timeStr = times[i];
    const { label, hour } = formatHourLabel(timeStr);
    const code = hourly.weather_code ? hourly.weather_code[i] ?? 0 : 0;
    const cond = getWmoCondition(code);

    const isNight =
      hourly.is_day && hourly.is_day[i] !== undefined
        ? hourly.is_day[i] === 0
        : determineIsNight(timeStr, hour, sunrise, sunset);

    normalizedHourly.push({
      time: offset === 0 ? 'Now' : label,
      hour,
      temp: hourly.temperature_2m ? Math.round(hourly.temperature_2m[i]) : 25,
      feelsLike: hourly.apparent_temperature ? Math.round(hourly.apparent_temperature[i]) : 27,
      rainProb: hourly.precipitation_probability ? hourly.precipitation_probability[i] ?? 0 : 0,
      windSpeed: hourly.wind_speed_10m ? Math.round(hourly.wind_speed_10m[i]) : 10,
      uvIndex: hourly.uv_index ? hourly.uv_index[i] ?? 0 : 0,
      icon: isNight && (cond.emoji === '☀️' || cond.emoji === '🌤️') ? '🌙' : cond.emoji,
      conditionText: cond.text,
      isNight,
      timestamp: timeStr,
    });
  }

  // Build Daily Forecast (7 days)
  const normalizedDaily: DailyForecastItem[] = [];
  const dailyTimes: string[] = daily.time || [];
  const dailyCount = Math.min(7, dailyTimes.length);

  for (let i = 0; i < dailyCount; i++) {
    const dTime = dailyTimes[i];
    const code = daily.weather_code ? daily.weather_code[i] ?? 0 : 0;
    const cond = getWmoCondition(code);

    normalizedDaily.push({
      date: dTime,
      dayName: formatDayLabel(dTime, i),
      minTemp: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[i]) : 22,
      maxTemp: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[i]) : 32,
      rainProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 10,
      icon: cond.emoji,
      conditionText: cond.text,
    });
  }

  return {
    locationName,
    latitude: raw.latitude ?? 12.9716,
    longitude: raw.longitude ?? 77.5946,
    current: normalizedCurrent,
    hourly: normalizedHourly,
    daily: normalizedDaily,
    lastUpdated: new Date().toISOString(),
  };
}
