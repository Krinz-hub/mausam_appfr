import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioManager } from '../services/audio/audioManager';

interface SettingsState {
  soundEnabled: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  notificationsEnabled: boolean;
  reducedMotion: boolean;

  initialize: () => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleUnit: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
}

const SETTINGS_KEY = '@mausam_user_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  temperatureUnit: 'celsius',
  notificationsEnabled: true,
  reducedMotion: false,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        audioManager.setMuted(!parsed.soundEnabled);
        set(parsed);
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  },

  toggleSound: async () => {
    const next = !get().soundEnabled;
    audioManager.setMuted(!next);
    set({ soundEnabled: next });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), soundEnabled: next }));
  },

  toggleUnit: async () => {
    const next = get().temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    set({ temperatureUnit: next });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), temperatureUnit: next }));
  },

  toggleNotifications: async () => {
    const next = !get().notificationsEnabled;
    set({ notificationsEnabled: next });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), notificationsEnabled: next }));
  },

  toggleReducedMotion: async () => {
    const next = !get().reducedMotion;
    set({ reducedMotion: next });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), reducedMotion: next }));
  },
}));
