export type WeatherCondition =
  | 'clear'
  | 'sunny'
  | 'mainly_clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'mist'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'rain_showers'
  | 'stormy_rain'
  | 'thunderstorm'
  | 'lightning'
  | 'snow'
  | 'hail'
  | 'windy'
  | 'strong_wind'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'bad_air_quality'
  | 'rainbow'
  | (string & {});

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface WeatherContext {
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  precipitationProbability: number;
  precipitationAmount: number;
  windSpeed: number;
  visibility?: number; // in meters or km
  humidity?: number;
  aqi?: number;
  uvIndex?: number;
  sunrise?: Date | string;
  sunset?: Date | string;
  currentTime?: Date | string;
  recentRain?: boolean;
  weatherCode?: number;
}

export type CharacterState =
  | 'sunny'
  | 'bright_sun'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'windy'
  | 'fog'
  | 'hail'
  | 'rainbow'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'stormy_rain'
  | 'strong_wind'
  | 'bad_air_quality'
  | 'lightning';

export type CharacterMood =
  | 'happy'
  | 'cool'
  | 'bright'
  | 'playful'
  | 'relaxed'
  | 'neutral'
  | 'concerned'
  | 'sad'
  | 'angry'
  | 'freezing'
  | 'breezy'
  | 'sleepy'
  | 'surprised'
  | 'overheated'
  | 'cautious';

export type HapticIntensity = 'light' | 'medium' | 'heavy';

export interface CharacterAssetMeta {
  source: any;
  fileName: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ResolvedCharacterState {
  assetKey: string;
  asset: any;
  assetMeta: CharacterAssetMeta;
  state: CharacterState;
  mood: CharacterMood;
  message: string;
  tip: string;
  haptic: HapticIntensity;
  accessibilityLabel: string;
  priority: number;
  timeOfDay: TimeOfDay;
}
