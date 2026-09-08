import { create } from 'zustand';
import { LocationService, UserLocation } from '../services/location/locationService';
import { DEFAULT_INDIAN_LOCATIONS, LocationCoordinates } from '../services/weather/openMeteoProvider';

interface LocationState {
  location: UserLocation;
  isLocating: boolean;
  error: string | null;

  initLocation: () => Promise<UserLocation>;
  detectLocation: () => Promise<UserLocation>;
  setLocation: (coords: LocationCoordinates) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: {
    ...DEFAULT_INDIAN_LOCATIONS.bengaluru,
    isPrecise: false,
  },
  isLocating: false,
  error: null,

  initLocation: async () => {
    // Fast load from cache first
    const cached = await LocationService.getCachedOrFallbackLocation();
    set({ location: cached });

    // Then attempt background precise detection
    return get().detectLocation();
  },

  detectLocation: async () => {
    set({ isLocating: true, error: null });
    try {
      const loc = await LocationService.getPreciseLocation();
      set({ location: loc, isLocating: false });
      return loc;
    } catch (err: any) {
      set({
        isLocating: false,
        error: err.message || 'Could not acquire precise location',
      });
      return get().location;
    }
  },

  setLocation: async (coords: LocationCoordinates) => {
    set({ isLocating: true });
    const saved = await LocationService.saveCustomLocation(coords);
    set({ location: saved, isLocating: false });
  },
}));
