import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WeatherDecision,
  ExperienceConfig,
  FeedbackRecord,
  FeedbackType,
  FeedbackReasonCode,
} from '../engine/types';
import { DecisionEngine } from '../engine/decision/decisionEngine';
import { LearningEngine } from '../engine/learning/learningEngine';
import { NeedEngine } from '../engine/need/needEngine';
import { PersonaEngine } from '../engine/persona/personaEngine';
import { useOnboardingStore } from './useOnboardingStore';
import { CanonicalWeatherData } from '../services/weather/canonicalModel';

interface DecisionState {
  currentDecision: WeatherDecision | null;
  experience: ExperienceConfig | null;
  feedbackHistory: Record<string, { type: FeedbackType; reason?: FeedbackReasonCode }>;

  lastWeatherSignature: string | null;

  computeDecision: (weather: CanonicalWeatherData) => void;
  submitFeedback: (
    decisionId: string,
    type: FeedbackType,
    reason?: FeedbackReasonCode
  ) => Promise<void>;
}

const FEEDBACK_STORAGE_KEY = '@mausam_feedback_history';

export const useDecisionStore = create<DecisionState>((set, get) => ({
  currentDecision: null,
  experience: null,
  feedbackHistory: {},
  lastWeatherSignature: null,

  computeDecision: (weather: CanonicalWeatherData) => {
    let persona = useOnboardingStore.getState().personaProfile;
    if (!persona) {
      const defaultNeed = NeedEngine.computeProfile({
        userTypeKeys: ['daily', 'commute'],
        weatherFactorKeys: ['rain', 'heat'],
        activePeriods: ['morning', 'evening'],
      });
      persona = PersonaEngine.initializeFromNeedProfile(defaultNeed, 'usr_default');
    }

    const currentHour = new Date().getHours();
    const weatherKey = `${weather.locationName}_${weather.current.temperature}_${weather.current.conditionText}_${weather.current.weatherCode}_${weather.current.humidity}_${weather.current.windSpeed}_${weather.current.uvIndex}`;
    const personaKey = `${persona.userId}_${persona.version}_${persona.confidence}_${persona.traits.rain_sensitive}_${persona.traits.heat_sensitive}_${persona.lastUpdated || ''}`;
    const signature = `${weatherKey}__${personaKey}__${currentHour}`;

    const state = get();
    if (state.lastWeatherSignature === signature && state.currentDecision) {
      return;
    }

    const { decision, experience } = DecisionEngine.decide(weather, persona, currentHour);

    set({ currentDecision: decision, experience, lastWeatherSignature: signature });
  },

  submitFeedback: async (
    decisionId: string,
    type: FeedbackType,
    reason?: FeedbackReasonCode
  ) => {
    const { currentDecision, feedbackHistory } = get();
    const persona = useOnboardingStore.getState().personaProfile;

    if (!currentDecision || !persona) return;

    const feedbackRecord: FeedbackRecord = {
      id: `fb_${Date.now()}`,
      userId: persona.userId,
      decisionId,
      type,
      reason,
      timestamp: new Date().toISOString(),
      weatherSnapshot: currentDecision.weatherSnapshot,
    };

    // Run Learning Engine calibration
    const updatedPersona = LearningEngine.processFeedback(
      persona,
      currentDecision,
      feedbackRecord
    );

    // Save updated persona
    useOnboardingStore.setState({ personaProfile: updatedPersona });
    await AsyncStorage.setItem(
      '@mausam_persona_profile',
      JSON.stringify(updatedPersona)
    );

    // Record feedback locally
    const nextFeedback = {
      ...feedbackHistory,
      [decisionId]: { type, reason },
    };
    set({ feedbackHistory: nextFeedback, lastWeatherSignature: null });
    await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback));
  },
}));
