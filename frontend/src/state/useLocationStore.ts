import { create } from 'zustand';
import {
  LocationService,
  UserLocation,
  CitySearchResult,
} from '../services/location/locationService';
import { DEFAULT_INDIAN_LOCATIONS, LocationCoordinates } from '../services/weather/openMeteoProvider';

interface LocationState {
  location: UserLocation;
  isLocating: boolean;
  error: string | null;

  initLocation: () => Promise<UserLocation>;
  detectLocation: () => Promise<UserLocation>;
  detectIpLocation: () => Promise<UserLocation>;
  setLocation: (coords: LocationCoordinates, isPrecise?: boolean) => Promise<void>;
  searchCities: (query: string) => Promise<CitySearchResult[]>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: {
    ...DEFAULT_INDIAN_LOCATIONS.delhi,
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

  detectIpLocation: async () => {
    set({ isLocating: true, error: null });
    try {
      const loc = await LocationService.getIpLocation();
      set({ location: loc, isLocating: false });
      return loc;
    } catch (err: any) {
      set({
        isLocating: false,
        error: err.message || 'Could not acquire IP location',
      });
      return get().location;
    }
  },

  setLocation: async (coords: LocationCoordinates, isPrecise: boolean = false) => {
    set({ isLocating: true });
    const saved = await LocationService.saveCustomLocation(coords, isPrecise);
    set({ location: saved, isLocating: false });
  },

  searchCities: async (query: string) => {
    return await LocationService.searchCities(query);
  },
}));

