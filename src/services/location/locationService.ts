import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationCoordinates, DEFAULT_INDIAN_LOCATIONS } from '../weather/openMeteoProvider';

export interface UserLocation extends LocationCoordinates {
  isPrecise: boolean;
  city?: string;
  region?: string;
  country?: string;
}

export interface CitySearchResult {
  id: number;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = '@mausam_cached_location';

export class LocationService {
  /**
   * Attempts to obtain device GPS location with high precision and safe timeout.
   * Resolves reverse geocoded city name, falls back to IP geolocation or cache.
   */
  public static async getPreciseLocation(): Promise<UserLocation> {
    try {
      // 1. Request foreground permissions
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        console.warn('Location permission denied, attempting IP geolocation');
        return await this.getIpLocation();
      }

      // 2. Try fast cached OS position first
      let coords: { latitude: number; longitude: number } | null = null;
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown?.coords) {
          coords = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
        }
      } catch (e) {
        // Continue to active GPS lock
      }

      // 3. Acquire live GPS coordinates with 7s timeout to prevent hanging
      try {
        const livePromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 7000)
        );
        const live = await Promise.race([livePromise, timeoutPromise]);
        if (live && 'coords' in live) {
          coords = {
            latitude: live.coords.latitude,
            longitude: live.coords.longitude,
          };
        }
      } catch (err) {
        console.warn('Live GPS query failed, using last known if available', err);
      }

      // If no GPS coordinates obtained, fallback to IP
      if (!coords) {
        return await this.getIpLocation();
      }

      const { latitude, longitude } = coords;

      // 4. Reverse geocode coordinates to human-friendly city/town
      let resolvedName = 'Local Weather';
      let resolvedCity = '';
      let resolvedRegion = '';

      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const place = reverse[0];
          resolvedCity = place.city || place.subregion || place.district || place.name || '';
          resolvedRegion = place.region || place.country || '';
          resolvedName = resolvedCity
            ? resolvedRegion
              ? `${resolvedCity}, ${resolvedRegion}`
              : resolvedCity
            : 'Local Area';
        }
      } catch (err) {
        // Location.reverseGeocodeAsync is unsupported on web; use online reverse geocoder
        const onlineName = await this.reverseGeocodeOnline(latitude, longitude);
        if (onlineName) {
          resolvedName = onlineName.name;
          resolvedCity = onlineName.city;
          resolvedRegion = onlineName.region;
        }
      }

      const userLoc: UserLocation = {
        name: resolvedName,
        latitude,
        longitude,
        isPrecise: true,
        city: resolvedCity,
        region: resolvedRegion,
      };

      // Cache for instant next load
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userLoc));
      return userLoc;
    } catch (error) {
      console.warn('Failed to acquire precise GPS location', error);
      return await this.getIpLocation();
    }
  }

  /**
   * Fetches approximate location from network IP when GPS is unavailable.
   */
  public static async getIpLocation(): Promise<UserLocation> {
    try {
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const cityPart = data.city || data.locality || data.principalSubdivision || 'Your Area';
          const regionPart = data.principalSubdivision ? `, ${data.principalSubdivision}` : '';
          const ipLoc: UserLocation = {
            name: `${cityPart}${regionPart}`,
            latitude: data.latitude,
            longitude: data.longitude,
            isPrecise: false,
            city: data.city || data.locality,
            region: data.principalSubdivision,
            country: data.countryName,
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ipLoc));
          return ipLoc;
        }
      }
    } catch (e) {
      console.warn('IP geolocation lookup failed', e);
    }

    return await this.getCachedOrFallbackLocation();
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
      ...DEFAULT_INDIAN_LOCATIONS.delhi,
      isPrecise: false,
    };
  }

  public static async saveCustomLocation(
    loc: LocationCoordinates,
    isPrecise: boolean = false
  ): Promise<UserLocation> {
    const userLoc: UserLocation = {
      ...loc,
      isPrecise,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userLoc));
    return userLoc;
  }

  /**
   * Searches cities using Open-Meteo Geocoding API.
   */
  public static async searchCities(query: string): Promise<CitySearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=6&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            region: item.admin1 || item.admin2,
            country: item.country,
            latitude: item.latitude,
            longitude: item.longitude,
          }));
        }
      }
    } catch (e) {
      console.warn('City geocode search failed', e);
    }
    return [];
  }

  private static async reverseGeocodeOnline(
    lat: number,
    lon: number
  ): Promise<{ name: string; city: string; region: string } | null> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Local Area';
        const region = data.principalSubdivision || data.countryName || '';
        const name = region ? `${city}, ${region}` : city;
        return { name, city, region };
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}
