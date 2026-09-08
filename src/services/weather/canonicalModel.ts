export interface WeatherSnapshot {
  timestamp: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  uvIndex?: number;
  aqi?: number;
  visibility?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;
  isDay?: boolean;
  weatherCode: number;
  conditionText: string;
  conditionEmoji: string;
}

export interface HourlyForecastItem {
  time: string; // e.g. "8 AM"
  hour: number; // 0-23
  temp: number;
  feelsLike: number;
  rainProb: number; // 0-100
  windSpeed: number;
  uvIndex: number;
  icon: string;
  conditionText: string;
  isNight?: boolean;
  timestamp?: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string; // e.g. "Today", "Tomorrow", "Wed"
  minTemp: number;
  maxTemp: number;
  rainProb: number;
  icon: string;
  conditionText: string;
  personalizedSignal?: string;
}

export interface CanonicalWeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  current: WeatherSnapshot;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  lastUpdated: string;
}
