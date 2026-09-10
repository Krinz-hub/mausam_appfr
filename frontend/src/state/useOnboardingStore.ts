import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserNeedProfile, PersonaProfile } from '../engine/types';
import { NeedEngine } from '../engine/need/needEngine';
import { ExplanationParser } from '../engine/ai/explanationParser';
import { PersonaEngine } from '../engine/persona/personaEngine';
import { useAuthStore } from './useAuthStore';

interface OnboardingState {
  currentStep: number;
  userTypeKeys: string[];
  explanation: string;
  weatherFactorKeys: string[];
  activePeriods: ('morning' | 'afternoon' | 'evening' | 'night')[];

  needProfile: UserNeedProfile | null;
  personaProfile: PersonaProfile | null;

  setStep: (step: number) => void;
  toggleUserType: (key: string) => void;
  setExplanation: (text: string) => void;
  toggleWeatherFactor: (key: string) => void;
  toggleActivePeriod: (period: 'morning' | 'afternoon' | 'evening' | 'night') => void;
  resetOnboarding: () => void;
  finishOnboarding: () => Promise<{ needProfile: UserNeedProfile; personaProfile: PersonaProfile }>;
  loadPersistedPersonalization: () => Promise<void>;
}

const NEED_PROFILE_KEY = '@mausam_need_profile';
const PERSONA_PROFILE_KEY = '@mausam_persona_profile';

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  userTypeKeys: ['daily', 'commute'],
  explanation: '',
  weatherFactorKeys: ['rain', 'heat'],
  activePeriods: ['morning', 'evening'],

  needProfile: null,
  personaProfile: null,

  setStep: (step: number) => set({ currentStep: step }),

  toggleUserType: (key: string) => {
    const current = get().userTypeKeys;
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    set({ userTypeKeys: next });
  },

  setExplanation: (text: string) => set({ explanation: text }),

  toggleWeatherFactor: (key: string) => {
    const current = get().weatherFactorKeys;
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    set({ weatherFactorKeys: next });
  },

  toggleActivePeriod: (period) => {
    const current = get().activePeriods;
    const next = current.includes(period)
      ? current.filter((p) => p !== period)
      : [...current, period];
    set({ activePeriods: next.length > 0 ? next : ['morning'] });
  },

  resetOnboarding: () => {
    set({
      currentStep: 1,
      userTypeKeys: ['daily'],
      explanation: '',
      weatherFactorKeys: ['rain', 'heat'],
      activePeriods: ['morning'],
    });
  },

  finishOnboarding: async () => {
    const { userTypeKeys, explanation, weatherFactorKeys, activePeriods } = get();
    const userId = useAuthStore.getState().user?.id || 'usr_default';

    // 1. Parse optional explanation with AI/NLP
    const aiExtracted = explanation ? ExplanationParser.parse(explanation) : undefined;

    // 2. Compute structured NeedProfile via Need Engine
    const needProfile = NeedEngine.computeProfile({
      userTypeKeys,
      weatherFactorKeys,
      activePeriods,
      aiExtractedNeeds: aiExtracted,
    });

    // 3. Initialize baseline PersonaProfile via Persona Engine
    const personaProfile = PersonaEngine.initializeFromNeedProfile(needProfile, userId);

    // 4. Persist to storage
    await AsyncStorage.setItem(NEED_PROFILE_KEY, JSON.stringify(needProfile));
    await AsyncStorage.setItem(PERSONA_PROFILE_KEY, JSON.stringify(personaProfile));
    await useAuthStore.getState().setOnboardingCompleted(true);

    set({ needProfile, personaProfile });
    return { needProfile, personaProfile };
  },

  loadPersistedPersonalization: async () => {
    try {
      const [needRaw, personaRaw] = await Promise.all([
        AsyncStorage.getItem(NEED_PROFILE_KEY),
        AsyncStorage.getItem(PERSONA_PROFILE_KEY),
      ]);

      if (needRaw && personaRaw) {
        set({
          needProfile: JSON.parse(needRaw),
          personaProfile: JSON.parse(personaRaw),
        });
      }
    } catch (e) {
      console.warn('Failed to load persisted personalization', e);
    }
  },
}));
