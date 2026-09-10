export type UserType =
  | 'commuter'
  | 'fitness'
  | 'health'
  | 'traveler'
  | 'family'
  | 'agriculture'
  | 'beach'
  | 'event_planner'
  | 'curious';

export type WeatherFactor =
  | 'temperature'
  | 'feels_like'
  | 'rain'
  | 'precipitation_probability'
  | 'wind'
  | 'humidity'
  | 'uv'
  | 'aqi'
  | 'pollen'
  | 'visibility'
  | 'sunrise'
  | 'sunset'
  | 'tide'
  | 'wave_height'
  | 'water_temperature'
  | 'soil_moisture'
  | 'frost'
  | 'comfort_index'
  | 'storm';

export type NeedSource = 'selection' | 'ai' | 'behavior';

export interface NeedFactorPriority {
  factor: WeatherFactor;
  priority: number; // 0 to 1
  confidence: number; // 0 to 1
  source: NeedSource;
}

export interface UserTypeScore {
  type: UserType;
  score: number; // 0 to 1
}

export interface UserNeedProfile {
  userTypes: UserTypeScore[];
  needs: NeedFactorPriority[];
  activePeriods?: ('morning' | 'afternoon' | 'evening' | 'night')[];
  version: number;
  updatedAt: string;
}

export interface PersonaTraits {
  rain_sensitive: number;
  heat_sensitive: number;
  cold_sensitive: number;
  wind_sensitive: number;
  aqi_sensitive: number;
  uv_sensitive: number;
}

export interface PersonaProfile {
  userId: string;
  version: number;
  traits: PersonaTraits;
  activities: Record<string, number>;
  activePeriods: Record<'morning' | 'afternoon' | 'evening' | 'night', number>;
  confidence: number;
  lastUpdated: string;
}

export interface DecisionReason {
  code: string;
  label: string;
}

export interface PrimaryInsight {
  type: string;
  title: string;
  shortMessage: string;
  priority: number;
  reasonCodes: string[];
  icon: string;
}

export interface SecondaryCard {
  type: string;
  title: string;
  shortMessage: string;
  priority: number;
  icon: string;
}

export interface WeatherDecision {
  decisionId: string;
  timestamp: string;
  primary: PrimaryInsight;
  secondary: SecondaryCard[];
  confidence: number;
  expiresAt: string;
  weatherSnapshot: {
    temp: number;
    feelsLike: number;
    rainProb: number;
    uvIndex?: number;
    windSpeed: number;
    aqi?: number;
  };
}

export interface ExperienceConfig {
  decisionId: string;
  greeting: string;
  location: string;
  characterState: string;
  primaryInsight: PrimaryInsight;
  cards: SecondaryCard[];
  visibleFeatures: WeatherFactor[];
  action: {
    label: string;
    destination?: string;
  };
}

export type FeedbackType = 'positive' | 'negative';
export type FeedbackReasonCode =
  | 'too_early'
  | 'too_late'
  | 'not_relevant'
  | 'forecast_changed'
  | 'other';

export interface FeedbackRecord {
  id: string;
  userId: string;
  decisionId: string;
  type: FeedbackType;
  reason?: FeedbackReasonCode;
  timestamp: string;
  weatherSnapshot: any;
}
