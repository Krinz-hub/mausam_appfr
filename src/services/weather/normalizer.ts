import {
  WeatherSnapshot,
  HourlyForecastItem,
  DailyForecastItem,
  CanonicalWeatherData,
} from './canonicalModel';

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
  const date = new Date(isoString);
  const hour = date.getHours();
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
  locationName: string = 'Bengaluru'
): CanonicalWeatherData {
  const current = raw.current || {};
  const hourly = raw.hourly || {};
  const daily = raw.daily || {};

  const currentWmo = current.weather_code ?? 0;
  const condition = getWmoCondition(currentWmo);

  const normalizedCurrent: WeatherSnapshot = {
    timestamp: current.time || new Date().toISOString(),
    temperature: current.temperature_2m ?? 26,
    feelsLike: current.apparent_temperature ?? current.temperature_2m ?? 28,
    humidity: current.relative_humidity_2m ?? 60,
    rainProbability: hourly.precipitation_probability ? hourly.precipitation_probability[0] ?? 0 : 0,
    windSpeed: current.wind_speed_10m ?? 12,
    uvIndex: hourly.uv_index ? hourly.uv_index[0] : undefined,
    visibility: hourly.visibility ? Math.round((hourly.visibility[0] || 10000) / 1000) : undefined,
    precipitation: current.precipitation ?? 0,
    weatherCode: currentWmo,
    conditionText: condition.text,
    conditionEmoji: condition.emoji,
  };

  // Build Hourly Timeline (next 24 hours)
  const normalizedHourly: HourlyForecastItem[] = [];
  const times: string[] = hourly.time || [];
  const count = Math.min(24, times.length);

  for (let i = 0; i < count; i++) {
    const timeStr = times[i];
    const { label, hour } = formatHourLabel(timeStr);
    const code = hourly.weather_code ? hourly.weather_code[i] ?? 0 : 0;
    const cond = getWmoCondition(code);

    normalizedHourly.push({
      time: label,
      hour,
      temp: hourly.temperature_2m ? hourly.temperature_2m[i] ?? 25 : 25,
      feelsLike: hourly.apparent_temperature ? hourly.apparent_temperature[i] ?? 27 : 27,
      rainProb: hourly.precipitation_probability ? hourly.precipitation_probability[i] ?? 0 : 0,
      windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] ?? 10 : 10,
      uvIndex: hourly.uv_index ? hourly.uv_index[i] ?? 0 : 0,
      icon: cond.emoji,
      conditionText: cond.text,
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
