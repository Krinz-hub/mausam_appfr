import { WeatherFactor, UserType } from './types';

export const AUTHORITATIVE_WEATHER_FACTORS: Record<
  WeatherFactor,
  { label: string; icon: string; description: string }
> = {
  temperature: { label: 'Temperature', icon: '🌡️', description: 'Ambient air temperature' },
  feels_like: { label: 'Feels Like', icon: '☀️', description: 'Apparent heat/wind chill sensation' },
  rain: { label: 'Rain', icon: '🌧️', description: 'Precipitation volume and timing' },
  precipitation_probability: { label: 'Precipitation %', icon: '☔', description: 'Chance of rainfall' },
  wind: { label: 'Wind', icon: '💨', description: 'Speed and gust intensity' },
  humidity: { label: 'Humidity', icon: '💧', description: 'Relative moisture level' },
  uv: { label: 'UV Index', icon: '☀️', description: 'Solar ultraviolet exposure' },
  aqi: { label: 'Air Quality', icon: '🌫️', description: 'Respiratory particulate index' },
  pollen: { label: 'Pollen', icon: '🌸', description: 'Environmental allergen count' },
  visibility: { label: 'Visibility', icon: '👁️', description: 'Atmospheric optical clarity' },
  sunrise: { label: 'Sunrise', icon: '🌅', description: 'Dawn timing' },
  sunset: { label: 'Sunset', icon: '🌇', description: 'Dusk timing' },
  tide: { label: 'Tide', icon: '🌊', description: 'Ocean water levels' },
  wave_height: { label: 'Wave Height', icon: '🏄', description: 'Surf conditions' },
  water_temperature: { label: 'Water Temp', icon: '🏊', description: 'Sea surface temperature' },
  soil_moisture: { label: 'Soil Moisture', icon: '🌱', description: 'Planting bed moisture' },
  frost: { label: 'Frost', icon: '❄️', description: 'Ground freezing hazards' },
  comfort_index: { label: 'Comfort Index', icon: '🧘', description: 'General biometeorological comfort' },
  storm: { label: 'Storm & Squall', icon: '⛈️', description: 'Severe convective alerts' },
};

export const AUTHORITATIVE_USER_TYPES: Record<
  UserType,
  { label: string; icon: string; description: string }
> = {
  commuter: { label: 'Commute', icon: '🚗', description: 'Transit, driving, and road conditions' },
  fitness: { label: 'Exercise', icon: '🏃', description: 'Running, cycling, and outdoor workouts' },
  health: { label: 'Health / comfort', icon: '❤️', description: 'Respiratory, allergies, and temperature sensitivity' },
  traveler: { label: 'Travel', icon: '✈️', description: 'Flights, departures, and inter-city trips' },
  family: { label: 'Daily life & Family', icon: '🏠', description: 'School runs, parks, and errands' },
  agriculture: { label: 'Gardening & Outdoor Work', icon: '🌱', description: 'Farming, plants, and soil' },
  beach: { label: 'Beach & Water', icon: '🏖️', description: 'Surfing, swimming, and marine' },
  event_planner: { label: 'Outdoor Events', icon: '💼', description: 'Gatherings, sports, and logistics' },
  curious: { label: 'Just curious', icon: '🔭', description: 'Casual meteorological awareness' },
};

export function isValidWeatherFactor(factor: string): factor is WeatherFactor {
  return factor in AUTHORITATIVE_WEATHER_FACTORS;
}

export function isValidUserType(type: string): type is UserType {
  return type in AUTHORITATIVE_USER_TYPES;
}
