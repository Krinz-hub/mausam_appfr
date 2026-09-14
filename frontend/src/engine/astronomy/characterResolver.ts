import { CharacterState } from '../../engines/weather/weatherCharacterTypes';
import { AstronomicalInsightType } from './astronomicalTypes';
import { WeatherSnapshot } from '../../services/weather/canonicalModel';

export interface CharacterResolutionInput {
  insightType: AstronomicalInsightType;
  activity?: string | null;
  weather?: WeatherSnapshot;
  isSevereWeather?: boolean;
  fallbackState?: CharacterState;
}

/**
 * Resolves the companion CharacterState from structured astronomical insight metadata.
 * Does NOT rely on generic regex matching or default blindly to 'sunny'.
 */
export function resolveAstronomicalCharacterState(
  input: CharacterResolutionInput
): CharacterState {
  const { insightType, activity, weather, isSevereWeather, fallbackState = 'sunny' } = input;

  // 1. Strict Safety Override (Severe weather / lightning / storms)
  if (isSevereWeather || (weather && (weather.weatherCode >= 95 || (weather.windSpeed && weather.windSpeed > 45)))) {
    return weather?.weatherCode === 99 ? 'lightning' : 'thunderstorm';
  }

  // 2. High AQI / Respiratory concern
  if (weather?.aqi && weather.aqi >= 100) {
    return 'bad_air_quality';
  }

  // 3. Heavy Rain or Active Rain
  if (weather && (weather.weatherCode === 65 || weather.weatherCode === 82 || (weather.precipitation && weather.precipitation > 2))) {
    return 'heavy_rain';
  }
  if (weather && (weather.rainProbability > 50 || (weather.precipitation && weather.precipitation > 0))) {
    return 'rain';
  }

  // 4. Activity & Insight-specific structured mapping
  switch (insightType) {
    case 'sunrise_activity_window':
      if (weather && weather.feelsLike >= 30) {
        return 'extreme_heat';
      }
      return 'sunny';

    case 'sunset_activity_window':
      if (activity === 'cycling' || activity === 'fitness') {
        return 'windy';
      }
      return 'sunny';

    case 'early_morning_outdoor_window':
      if (weather && weather.temperature >= 28) {
        return 'extreme_heat';
      }
      if (weather && weather.aqi && weather.aqi <= 35) {
        return 'rainbow';
      }
      return 'sunny';

    case 'evening_outdoor_window':
      return 'sunny';

    case 'low_light_commute':
      if (weather && (weather.weatherCode === 45 || weather.weatherCode === 48 || (weather.visibility && weather.visibility < 3))) {
        return 'fog';
      }
      return 'fog';

    case 'pre_dawn_activity':
      return 'fog'; // Calm sleepy dawn twilight

    case 'daylight_remaining':
      if (activity === 'cycling') {
        return 'windy';
      }
      return 'sunny';

    case 'uv_daylight_transition':
      return 'bright_sun'; // Character wearing sunglasses

    case 'night_transition':
      return 'fog'; // Night rest / sleepy cloud

    default:
      return fallbackState;
  }
}
