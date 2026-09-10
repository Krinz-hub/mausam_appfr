import {
  WeatherContext,
  CharacterState,
  ResolvedCharacterState,
  TimeOfDay,
  HapticIntensity,
} from './weatherCharacterTypes';
import { WEATHER_THRESHOLDS, WeatherThresholds } from './weatherThresholds';
import { WEATHER_CHARACTER_ASSETS } from './weatherCharacterAssets';
import { WEATHER_CHARACTER_CONFIGS } from './weatherCharacterConfig';
import { CanonicalWeatherData } from '../../services/weather/canonicalModel';

export class WeatherCharacterEngine {
  /**
   * Evaluates astronomical sunrise/sunset or fallback clock time into standard TimeOfDay
   */
  public static getTimeOfDay(
    currentTimeInput?: Date | string,
    sunriseInput?: Date | string,
    sunsetInput?: Date | string
  ): TimeOfDay {
    const curDate = currentTimeInput
      ? typeof currentTimeInput === 'string'
        ? new Date(currentTimeInput)
        : currentTimeInput
      : new Date();

    if (sunriseInput && sunsetInput) {
      const srDate =
        typeof sunriseInput === 'string' ? new Date(sunriseInput) : sunriseInput;
      const ssDate =
        typeof sunsetInput === 'string' ? new Date(sunsetInput) : sunsetInput;

      if (!isNaN(srDate.getTime()) && !isNaN(ssDate.getTime())) {
        const curMins = curDate.getHours() * 60 + curDate.getMinutes();
        const srMins = srDate.getHours() * 60 + srDate.getMinutes();
        const ssMins = ssDate.getHours() * 60 + ssDate.getMinutes();

        // Dawn: 45 min before sunrise until 45 min after sunrise
        if (curMins >= srMins - 45 && curMins < srMins + 45) {
          return 'dawn';
        }
        // Morning: after dawn until solar midpoint
        const solarMidpoint = Math.round((srMins + ssMins) / 2);
        if (curMins >= srMins + 45 && curMins < solarMidpoint) {
          return 'morning';
        }
        // Afternoon: from solar midpoint until 60 mins before sunset
        if (curMins >= solarMidpoint && curMins < ssMins - 60) {
          return 'afternoon';
        }
        // Evening: 60 mins before sunset until 45 mins after sunset
        if (curMins >= ssMins - 60 && curMins < ssMins + 45) {
          return 'evening';
        }
        // Night: outside daylight / twilight envelope
        return 'night';
      }
    }

    // Fallback based on local clock hours
    const hour = curDate.getHours();
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  }

  /**
   * Converts a CanonicalWeatherData payload into a standardized WeatherContext
   */
  public static normalizeContext(
    weather: CanonicalWeatherData,
    currentTime: Date = new Date()
  ): WeatherContext {
    const current = weather.current;
    return {
      condition: current.conditionText,
      temperature: current.temperature,
      feelsLike: current.feelsLike,
      precipitationProbability: current.rainProbability ?? 0,
      precipitationAmount: current.precipitation ?? 0,
      windSpeed: current.windSpeed ?? 0,
      visibility: current.visibility,
      humidity: current.humidity,
      aqi: current.aqi,
      uvIndex: current.uvIndex,
      sunrise: current.sunrise,
      sunset: current.sunset,
      currentTime,
      weatherCode: current.weatherCode,
    };
  }

  /**
   * Resolves the companion character state by evaluating condition priority rules
   */
  public static resolve(
    context: WeatherContext,
    thresholdOverrides?: Partial<WeatherThresholds>
  ): ResolvedCharacterState {
    const thresholds: WeatherThresholds = {
      ...WEATHER_THRESHOLDS,
      ...thresholdOverrides,
    };

    const condLower = (context.condition || '').toLowerCase().trim();
    const code = context.weatherCode ?? -1;

    // Detect helper flags
    const isLightning =
      condLower.includes('lightning') ||
      code === 99;

    const isThunderstorm =
      condLower.includes('thunder') ||
      (condLower.includes('storm') && !condLower.includes('stormy rain')) ||
      code === 95 ||
      code === 96;

    const isHail =
      condLower.includes('hail') ||
      code === 96 ||
      code === 99;

    const isBadAqi =
      context.aqi !== undefined && context.aqi >= thresholds.unhealthyAQI;

    const isExtremeHeat =
      context.temperature >= thresholds.extremeHeat ||
      context.feelsLike >= thresholds.extremeHeat;

    const isSnow =
      condLower.includes('snow') ||
      condLower.includes('blizzard') ||
      code === 71 ||
      code === 73 ||
      code === 75 ||
      code === 85 ||
      code === 86;

    const isExtremeCold =
      !isSnow &&
      (context.temperature <= thresholds.cold ||
        (context.feelsLike !== undefined && context.feelsLike <= thresholds.cold));

    const isHeavyRain =
      context.precipitationAmount >= thresholds.heavyRainPrecip ||
      condLower.includes('heavy rain') ||
      condLower.includes('violent') ||
      condLower.includes('heavy shower') ||
      code === 65 ||
      code === 82 ||
      (context.precipitationProbability >= thresholds.heavyRainProb &&
        (condLower.includes('rain') || code === 61 || code === 63));

    const isRain =
      condLower.includes('rain') ||
      condLower.includes('drizzle') ||
      condLower.includes('shower') ||
      code === 51 ||
      code === 53 ||
      code === 55 ||
      code === 61 ||
      code === 63 ||
      code === 80 ||
      context.precipitationAmount > 0;

    const isStrongWind = context.windSpeed >= thresholds.strongWind;

    const isStormyRain =
      condLower.includes('stormy rain') ||
      (isRain &&
        context.windSpeed >= thresholds.windy &&
        (context.precipitationAmount >= 2 || context.precipitationProbability >= 50));

    const isWindy = !isRain && context.windSpeed >= thresholds.windy;

    const isFog =
      condLower.includes('fog') ||
      condLower.includes('mist') ||
      code === 45 ||
      code === 48 ||
      (context.visibility !== undefined &&
        (context.visibility <= thresholds.fogVisibility ||
          (context.visibility <= thresholds.fogVisibility / 1000 &&
            thresholds.fogVisibility >= 100)));

    const timeOfDay = this.getTimeOfDay(
      context.currentTime,
      context.sunrise,
      context.sunset
    );

    const isDaytime = timeOfDay !== 'night';
    const isRainbow =
      context.recentRain === true &&
      !isRain &&
      (context.precipitationAmount === 0 || context.precipitationAmount === undefined) &&
      isDaytime;

    const isOvercast =
      condLower.includes('overcast') || code === 3;

    const isCloudy =
      (condLower.includes('cloud') && !condLower.includes('clear')) ||
      code === 2;

    const isHighUv =
      context.uvIndex !== undefined && context.uvIndex >= thresholds.highUV;

    // Evaluate in strict priority order (100 -> 20)
    let selectedState: CharacterState;

    if (isLightning) {
      selectedState = 'lightning'; // 100
    } else if (isThunderstorm) {
      selectedState = 'thunderstorm'; // 95
    } else if (isHail) {
      selectedState = 'hail'; // 94
    } else if (isBadAqi) {
      selectedState = 'bad_air_quality'; // 90
    } else if (isExtremeHeat) {
      selectedState = 'extreme_heat'; // 85
    } else if (isExtremeCold) {
      selectedState = 'extreme_cold'; // 84
    } else if (isHeavyRain) {
      selectedState = 'heavy_rain'; // 80
    } else if (isSnow) {
      selectedState = 'snow'; // 78
    } else if (isStrongWind) {
      selectedState = 'strong_wind'; // 75
    } else if (isWindy) {
      selectedState = 'windy'; // 70
    } else if (isFog) {
      selectedState = 'fog'; // 65
    } else if (isStormyRain) {
      selectedState = 'stormy_rain'; // 60
    } else if (isRainbow) {
      selectedState = 'rainbow'; // 55
    } else if (isRain) {
      selectedState = 'rain'; // 50
    } else if (isOvercast) {
      selectedState = 'overcast'; // 40
    } else if (isCloudy) {
      selectedState = 'cloudy'; // 30
    } else if (isHighUv) {
      selectedState = 'bright_sun'; // 20
    } else {
      selectedState = 'sunny'; // 20
    }

    const config = WEATHER_CHARACTER_CONFIGS[selectedState];
    const assetMeta = WEATHER_CHARACTER_ASSETS[selectedState];

    // Determine contextual message and tip using time-of-day variations
    const message =
      config.timeOfDayMessages?.[timeOfDay] || config.defaultMessage;
    const tip =
      config.timeOfDayTips?.[timeOfDay] || config.defaultTip;

    return {
      assetKey: assetMeta.fileName,
      asset: assetMeta.source,
      assetMeta,
      state: selectedState,
      mood: config.mood,
      message,
      tip,
      haptic: config.haptic,
      accessibilityLabel: config.accessibilityLabel,
      priority: config.priority,
      timeOfDay,
    };
  }

  public static getCharacter(context: WeatherContext): any {
    return this.resolve(context).asset;
  }

  public static getReaction(context: WeatherContext): string {
    return this.resolve(context).message;
  }

  public static getTip(context: WeatherContext): string {
    return this.resolve(context).tip;
  }

  public static getHaptic(context: WeatherContext): HapticIntensity {
    return this.resolve(context).haptic;
  }
}
