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
import { useOnboardingStore } from './useOnboardingStore';
import { CanonicalWeatherData } from '../services/weather/canonicalModel';

interface DecisionState {
  currentDecision: WeatherDecision | null;
  experience: ExperienceConfig | null;
  feedbackHistory: Record<string, { type: FeedbackType; reason?: FeedbackReasonCode }>;

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

  computeDecision: (weather: CanonicalWeatherData) => {
    const persona = useOnboardingStore.getState().personaProfile;
    if (!persona) return;

    const currentHour = new Date().getHours();
    const { decision, experience } = DecisionEngine.decide(weather, persona, currentHour);

    set({ currentDecision: decision, experience });
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
    set({ feedbackHistory: nextFeedback });
    await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback));
  },
}));
