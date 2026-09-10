import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserNeedProfile, PersonaProfile } from '../engine/types';
import { NeedEngine } from '../engine/need/needEngine';
import { ExplanationParser } from '../engine/ai/explanationParser';
import { PersonaEngine } from '../engine/persona/personaEngine';
import { useAuthStore } from './useAuthStore';
import { ApiClient } from '../services/api/apiClient';

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

    // 1. Compute local structured NeedProfile & PersonaProfile for instant response
    const aiExtracted = explanation ? ExplanationParser.parse(explanation) : undefined;
    let needProfile = NeedEngine.computeProfile({
      userTypeKeys,
      weatherFactorKeys,
      activePeriods,
      aiExtractedNeeds: aiExtracted,
    });
    let personaProfile = PersonaEngine.initializeFromNeedProfile(needProfile, userId);

    // 2. Submit to trusted backend to validate & persist in MongoDB
    try {
      const backendRes = await ApiClient.submitOnboarding({
        userTypeKeys,
        weatherFactorKeys,
        activePeriods,
        explanation,
      });

      if (backendRes && backendRes.user?.personalization) {
        if (backendRes.user.personalization.needProfile) {
          needProfile = backendRes.user.personalization.needProfile;
        }
        if (backendRes.user.personalization.personaProfile) {
          personaProfile = backendRes.user.personalization.personaProfile;
        }
      }
    } catch (backendErr: any) {
      console.warn('Backend onboarding sync failed (offline/fallback mode):', backendErr.message);
    }

    // 3. Persist to local storage
    await AsyncStorage.setItem(NEED_PROFILE_KEY, JSON.stringify(needProfile));
    await AsyncStorage.setItem(PERSONA_PROFILE_KEY, JSON.stringify(personaProfile));
    await useAuthStore.getState().setOnboardingCompleted(true);

    set({ needProfile, personaProfile });
    return { needProfile, personaProfile };
  },

  loadPersistedPersonalization: async () => {
    try {
      // 1. Instant local restore
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

      // 2. Background sync from MongoDB if user is authenticated
      if (useAuthStore.getState().isAuthenticated) {
        try {
          const res = await ApiClient.getPersonalization();
          if (res && res.personalization) {
            const { needProfile, personaProfile } = res.personalization;
            if (needProfile && personaProfile) {
              await AsyncStorage.setItem(NEED_PROFILE_KEY, JSON.stringify(needProfile));
              await AsyncStorage.setItem(PERSONA_PROFILE_KEY, JSON.stringify(personaProfile));
              set({ needProfile, personaProfile });
            }
          }
        } catch {
          // Continue with local data if offline
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted personalization', e);
    }
  },
}));
