import { UserType, WeatherFactor } from '../types';
import { isValidUserType, isValidWeatherFactor } from '../vocabulary';

export const USER_TYPE_SELECTION_MAP: Record<string, UserType> = {
  daily: 'family',
  commute: 'commuter',
  exercise: 'fitness',
  travel: 'traveler',
  work: 'agriculture',
  health: 'health',
  gardening: 'agriculture',
  curious: 'curious',
  events: 'event_planner',
  beach: 'beach',
};

export const WEATHER_FACTOR_SELECTION_MAP: Record<string, WeatherFactor> = {
  rain: 'rain',
  heat: 'feels_like',
  cold: 'temperature',
  wind: 'wind',
  humidity: 'humidity',
  air_quality: 'aqi',
  aqi: 'aqi',
  uv: 'uv',
  snow: 'frost',
  storm: 'storm',
  pollen: 'pollen',
  visibility: 'visibility',
};

export function parseUserTypeSelections(keys: string[]): UserType[] {
  const result: UserType[] = [];
  for (const k of keys) {
    const mapped = USER_TYPE_SELECTION_MAP[k.toLowerCase()] || (k as UserType);
    if (mapped && isValidUserType(mapped) && !result.includes(mapped)) {
      result.push(mapped);
    }
  }
  return result;
}

export function parseWeatherFactorSelections(keys: string[]): WeatherFactor[] {
  const result: WeatherFactor[] = [];
  for (const k of keys) {
    const mapped = WEATHER_FACTOR_SELECTION_MAP[k.toLowerCase()] || (k as WeatherFactor);
    if (mapped && isValidWeatherFactor(mapped) && !result.includes(mapped)) {
      result.push(mapped);
    }
  }
  return result;
}
