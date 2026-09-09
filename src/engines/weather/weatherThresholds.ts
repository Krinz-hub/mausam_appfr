export interface WeatherThresholds {
  extremeHeat: number;
  cold: number;
  windy: number;
  strongWind: number;
  unhealthyAQI: number;
  fogVisibility: number;
  highUV: number;
  heavyRainPrecip: number;
  heavyRainProb: number;
}

export const WEATHER_THRESHOLDS: WeatherThresholds = {
  extremeHeat: 40,
  cold: 10,
  windy: 25,
  strongWind: 40,
  unhealthyAQI: 150,
  fogVisibility: 1000,
  highUV: 7,
  heavyRainPrecip: 7.6,
  heavyRainProb: 80,
};
