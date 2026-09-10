import { CharacterState, CharacterAssetMeta } from './weatherCharacterTypes';

// Node.js test runtime shim: prevent Node from parsing binary PNG as JavaScript
if (
  typeof require !== 'undefined' &&
  (require as any).extensions &&
  !(require as any).extensions['.png']
) {
  (require as any).extensions['.png'] = (module: any, filename: string) => {
    module.exports = filename;
  };
}

export const WEATHER_CHARACTER_ASSETS: Record<CharacterState, CharacterAssetMeta> = {
  sunny: {
    source: require('../../../assets/weather-characters/01_sunny_happy.png'),
    fileName: '01_sunny_happy.png',
    width: 266,
    height: 305,
    aspectRatio: 266 / 305,
  },
  bright_sun: {
    source: require('../../../assets/weather-characters/02_sunny_sunglasses.png'),
    fileName: '02_sunny_sunglasses.png',
    width: 240,
    height: 302,
    aspectRatio: 240 / 302,
  },
  cloudy: {
    source: require('../../../assets/weather-characters/03_cloudy_happy.png'),
    fileName: '03_cloudy_happy.png',
    width: 264,
    height: 296,
    aspectRatio: 264 / 296,
  },
  overcast: {
    source: require('../../../assets/weather-characters/04_overcast_cloudy.png'),
    fileName: '04_overcast_cloudy.png',
    width: 224,
    height: 276,
    aspectRatio: 224 / 276,
  },
  rain: {
    source: require('../../../assets/weather-characters/05_rainy_umbrella.png'),
    fileName: '05_rainy_umbrella.png',
    width: 241,
    height: 348,
    aspectRatio: 241 / 348,
  },
  heavy_rain: {
    source: require('../../../assets/weather-characters/06_heavy_rain_sad.png'),
    fileName: '06_heavy_rain_sad.png',
    width: 238,
    height: 340,
    aspectRatio: 238 / 340,
  },
  thunderstorm: {
    source: require('../../../assets/weather-characters/07_thunderstorm_angry.png'),
    fileName: '07_thunderstorm_angry.png',
    width: 236,
    height: 319,
    aspectRatio: 236 / 319,
  },
  snow: {
    source: require('../../../assets/weather-characters/08_snowy_freezing.png'),
    fileName: '08_snowy_freezing.png',
    width: 251,
    height: 297,
    aspectRatio: 251 / 297,
  },
  windy: {
    source: require('../../../assets/weather-characters/09_windy.png'),
    fileName: '09_windy.png',
    width: 286,
    height: 282,
    aspectRatio: 286 / 282,
  },
  fog: {
    source: require('../../../assets/weather-characters/10_foggy_sleepy.png'),
    fileName: '10_foggy_sleepy.png',
    width: 263,
    height: 279,
    aspectRatio: 263 / 279,
  },
  hail: {
    source: require('../../../assets/weather-characters/11_hail_surprised.png'),
    fileName: '11_hail_surprised.png',
    width: 254,
    height: 301,
    aspectRatio: 254 / 301,
  },
  rainbow: {
    source: require('../../../assets/weather-characters/12_rainbow_happy.png'),
    fileName: '12_rainbow_happy.png',
    width: 265,
    height: 294,
    aspectRatio: 265 / 294,
  },
  extreme_heat: {
    source: require('../../../assets/weather-characters/13_extreme_heat.png'),
    fileName: '13_extreme_heat.png',
    width: 274,
    height: 286,
    aspectRatio: 274 / 286,
  },
  extreme_cold: {
    source: require('../../../assets/weather-characters/14_cold_freezing.png'),
    fileName: '14_cold_freezing.png',
    width: 247,
    height: 277,
    aspectRatio: 247 / 277,
  },
  stormy_rain: {
    source: require('../../../assets/weather-characters/15_stormy_rain.png'),
    fileName: '15_stormy_rain.png',
    width: 240,
    height: 292,
    aspectRatio: 240 / 292,
  },
  strong_wind: {
    source: require('../../../assets/weather-characters/16_strong_wind.png'),
    fileName: '16_strong_wind.png',
    width: 272,
    height: 279,
    aspectRatio: 272 / 279,
  },
  bad_air_quality: {
    source: require('../../../assets/weather-characters/17_bad_air_quality.png'),
    fileName: '17_bad_air_quality.png',
    width: 252,
    height: 277,
    aspectRatio: 252 / 277,
  },
  lightning: {
    source: require('../../../assets/weather-characters/18_lightning_surprised.png'),
    fileName: '18_lightning_surprised.png',
    width: 256,
    height: 283,
    aspectRatio: 256 / 283,
  },
};

/**
 * Preload character assets to eliminate layout shifts or spinners
 */
export async function preloadWeatherCharacterAssets(): Promise<void> {
  return Promise.resolve();
}
