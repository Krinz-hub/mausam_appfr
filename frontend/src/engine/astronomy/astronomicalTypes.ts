import { CharacterState } from '../../engines/weather/weatherCharacterTypes';

export type AstronomicalEvent =
  | 'sunrise'
  | 'sunset'
  | 'dawn'
  | 'dusk'
  | 'daylight_start'
  | 'daylight_end'
  | 'night_start'
  | 'night_end';

export type AstronomicalPhase =
  | 'pre_dawn'
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'dusk'
  | 'night';

export interface AstronomicalContext {
  sunrise: Date | null;
  sunset: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  currentPhase: AstronomicalPhase;
  minutesUntilSunrise: number | null;
  minutesSinceSunrise: number | null;
  minutesUntilSunset: number | null;
  minutesSinceSunset: number | null;
  daylightRemainingMinutes: number | null;
  daylightElapsedMinutes: number | null;
  isDaylight: boolean;
  isNight: boolean;
  nextRelevantEvent: 'sunrise' | 'sunset' | 'dawn' | 'dusk' | null;
}

export type AstronomicalInsightType =
  | 'sunrise_activity_window'
  | 'sunset_activity_window'
  | 'pre_dawn_activity'
  | 'low_light_commute'
  | 'daylight_remaining'
  | 'early_morning_outdoor_window'
  | 'evening_outdoor_window'
  | 'uv_daylight_transition'
  | 'night_transition';

export type AstronomicalRelevanceReason =
  | 'activity'
  | 'commute'
  | 'health'
  | 'agriculture'
  | 'travel'
  | 'leisure'
  | 'time_transition';

export type AstronomicalSeverity =
  | 'info'
  | 'useful'
  | 'important'
  | 'critical';

export interface AstronomicalInsight {
  id: string;
  type: AstronomicalInsightType;
  priority: number; // 0 to 100
  title: string;
  message: string;
  eventTime: string | null;
  minutesUntilEvent: number | null;
  relevanceReason: AstronomicalRelevanceReason;
  activity: string | null;
  severity: AstronomicalSeverity;
  actionable: boolean;
  characterState?: CharacterState;
  expiresAt?: string;
  source: 'astronomical' | 'astronomical_weather_combined';
}

export interface AstronomicalDiagnosticReport {
  event: AstronomicalEvent | null;
  minutesRemaining: number | null;
  userActivity: string | null;
  weatherSuitability: number;
  activityRelevance: number;
  urgency: number;
  finalScore: number;
  decision: 'SHOW' | 'SUPPRESS';
  reason?: string;
}
