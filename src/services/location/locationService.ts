import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationCoordinates, DEFAULT_INDIAN_LOCATIONS } from '../weather/openMeteoProvider';

export interface UserLocation extends LocationCoordinates {
  isPrecise: boolean;
  city?: string;
  region?: string;
  country?: string;
}

const STORAGE_KEY = '@mausam_cached_location';

export class LocationService {
  /**
   * Attempts to obtain device GPS location with balanced battery consumption.
   * Resolves reverse geocoded city name or falls back to cached/default.
   */
  public static async getPreciseLocation(): Promise<UserLocation> {
    try {
      // 1. Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Location permission denied, using cached or fallback location');
        return await this.getCachedOrFallbackLocation();
      }

      // 2. Fetch current GPS coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Reverse geocode to find friendly name
      let resolvedName = 'Local Weather';
      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const place = reverse[0];
          const cityPart = place.city || place.subregion || place.district || place.name;
          const regionPart = place.region || place.country;
          resolvedName = cityPart ? `${cityPart}` : `${resolvedName}`;
        }
      } catch (err) {
        // Fallback to open-meteo reverse geocode
        resolvedName = await this.reverseGeocodeOnline(latitude, longitude);
      }

      const userLoc: UserLocation = {
        name: resolvedName,
        latitude,
        longitude,
        isPrecise: true,
      };

      // Cache for instant next load
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userLoc));
      return userLoc;
    } catch (error) {
      console.warn('Failed to acquire precise GPS location', error);
      return await this.getCachedOrFallbackLocation();
    }
  }

  public static async getCachedOrFallbackLocation(): Promise<UserLocation> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Ignore cache read error
    }
    return {
      ...DEFAULT_INDIAN_LOCATIONS.bengaluru,
      isPrecise: false,
    };
  }

  public static async saveCustomLocation(loc: LocationCoordinates): Promise<UserLocation> {
    const userLoc: UserLocation = {
      ...loc,
      isPrecise: true,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userLoc));
    return userLoc;
  }

  private static async reverseGeocodeOnline(lat: number, lon: number): Promise<string> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        return data.city || data.locality || data.principalSubdivision || 'Local Area';
      }
    } catch (e) {
      // Ignore
    }
    return 'Your Location';
  }
}
