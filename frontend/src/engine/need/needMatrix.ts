import { UserType, WeatherFactor } from '../types';

export const NEED_MATRIX: Record<UserType, Partial<Record<WeatherFactor, number>>> = {
  health: {
    aqi: 1.0,
    pollen: 1.0,
    uv: 0.9,
    humidity: 0.8,
    temperature: 0.7,
  },
  fitness: {
    temperature: 0.9,
    feels_like: 0.95,
    wind: 0.8,
    sunrise: 0.9,
    sunset: 0.9,
    uv: 0.7,
    rain: 0.85,
  },
  beach: {
    tide: 1.0,
    wave_height: 1.0,
    water_temperature: 0.9,
    wind: 0.8,
    uv: 0.95,
  },
  traveler: {
    rain: 0.8,
    temperature: 0.6,
    storm: 1.0,
    visibility: 0.9,
  },
  family: {
    rain: 0.9,
    storm: 1.0,
    visibility: 0.8,
    temperature: 0.75,
  },
  agriculture: {
    soil_moisture: 1.0,
    rain: 1.0,
    frost: 1.0,
    temperature: 0.7,
    wind: 0.6,
  },
  commuter: {
    rain: 0.85,
    visibility: 1.0,
    wind: 0.7,
    storm: 1.0,
    precipitation_probability: 0.9,
  },
  event_planner: {
    rain: 1.0,
    precipitation_probability: 1.0,
    comfort_index: 1.0,
    wind: 0.7,
    storm: 1.0,
  },
  curious: {
    temperature: 0.8,
    feels_like: 0.7,
    rain: 0.8,
    sunrise: 0.6,
    sunset: 0.6,
  },
};
