export interface IUserTypeScore {
  type: string;
  score: number;
}

export interface IUserProfileData {
  userTypes: IUserTypeScore[];
  interests: string[];
  activities: string[];
}

export interface IUserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  rainAlerts: boolean;
  severeWeatherAlerts: boolean;
}

export interface ISavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  isPrecise: boolean;
  city?: string;
  region?: string;
  country?: string;
}

export interface IPersonalizationData {
  needProfile: any | null;
  personaProfile: any | null;
}

export interface IUserDocument {
  _id?: any;
  name: string;
  email: string;
  password?: string;
  displayName?: string;
  avatar?: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  profile: IUserProfileData;
  preferences: IUserPreferences;
  personalization: IPersonalizationData;
  savedLocations: ISavedLocation[];
  learning: {
    feedbackHistory: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}
