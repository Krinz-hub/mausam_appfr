import { PersonaProfile, WeatherFactor } from '../types';
import { CanonicalWeatherData } from '../../services/weather/canonicalModel';
import { calculateRecommendationScore } from './scoring';

export interface CandidateInsight {
  type: string;
  title: string;
  shortMessage: string;
  factor: WeatherFactor;
  baseSeverity: number;
  contextRelevance: number;
  temporalRelevance: number;
  reasonCodes: string[];
  icon: string;
  characterState: string;
}

export function generateCandidateInsights(
  weather: CanonicalWeatherData,
  persona: PersonaProfile,
  currentHour: number = new Date().getHours()
): CandidateInsight[] {
  const candidates: CandidateInsight[] = [];
  const current = weather.current;
  const isMorning = currentHour >= 5 && currentHour < 12;
  const isEvening = currentHour >= 17 && currentHour < 21;
  const isNight = currentHour >= 21 || currentHour < 5;

  // 0. Night-Time Tomorrow-Focused Insight (Section 17: Tomorrow-focused recommendations at night)
  if (isNight) {
    const tomorrow = weather.daily[1] || weather.daily[0];
    if (tomorrow && tomorrow.rainProb >= 55) {
      candidates.push({
        type: 'tomorrow_rain',
        title: 'Rain in store tomorrow',
        shortMessage: `Showers expected tomorrow with ${tomorrow.rainProb}% rain chance. Plan your morning trip accordingly.`,
        factor: 'rain',
        baseSeverity: 0.85,
        contextRelevance: 0.9,
        temporalRelevance: 1.0,
        reasonCodes: ['TOMORROW_FORECAST', 'RAIN_EXPECTED'],
        icon: '🌧️',
        characterState: 'sleeping',
      });
    } else if (tomorrow && tomorrow.maxTemp >= 34) {
      candidates.push({
        type: 'tomorrow_heat',
        title: 'Warm afternoon tomorrow',
        shortMessage: `Peak heat reaching ${tomorrow.maxTemp}°C tomorrow. Best outdoor workout window: 6:00–7:30 AM.`,
        factor: 'feels_like',
        baseSeverity: 0.8,
        contextRelevance: 0.85,
        temporalRelevance: 1.0,
        reasonCodes: ['TOMORROW_HEAT_INDEX', 'OPTIMAL_MORNING_WINDOW'],
        icon: '🌤️',
        characterState: 'sleeping',
      });
    } else {
      candidates.push({
        type: 'night_rest',
        title: 'Calm night ahead',
        shortMessage: `Rest well tonight. Tomorrow begins around ${tomorrow?.minTemp ?? Math.round(current.temperature)}°C with ${tomorrow?.conditionText?.toLowerCase() || 'pleasant skies'}.`,
        factor: 'temperature',
        baseSeverity: 0.65,
        contextRelevance: 0.8,
        temporalRelevance: 1.0,
        reasonCodes: ['OVERNIGHT_CALM', 'FAVORABLE_TOMORROW'],
        icon: '🌙',
        characterState: 'sleeping',
      });
    }
  }

  // 1. Storm / Severe Weather Alert (Top severity if present)
  if (current.weatherCode >= 95 || current.windSpeed > 45) {
    candidates.push({
      type: 'severe_storm',
      title: 'Thunderstorm advisory',
      shortMessage: 'Strong squalls and lightning active in your area. Stay sheltered.',
      factor: 'storm',
      baseSeverity: 1.0,
      contextRelevance: 1.0,
      temporalRelevance: 1.0,
      reasonCodes: ['SEVERE_CONVECTIVE_ALERT', 'HIGH_WIND_RISK'],
      icon: '⛈️',
      characterState: 'storm',
    });
  }

  // 2. Commute Window Insight
  const commuterRelevance = persona.activities['commuter'] || 0.5;
  if (commuterRelevance > 0.4) {
    const rainInNextHours = weather.hourly
      .slice(0, 4)
      .some((h) => h.rainProb >= 50);

    if (rainInNextHours) {
      candidates.push({
        type: 'commute_rain',
        title: 'Wet commute ahead',
        shortMessage: 'Rain likely on your transit route within the next few hours.',
        factor: 'rain',
        baseSeverity: 0.85,
        contextRelevance: commuterRelevance,
        temporalRelevance: isMorning || isEvening ? 0.95 : 0.6,
        reasonCodes: ['OUTDOOR_COMMUTE', 'RAIN_INCOMING'],
        icon: '🚗',
        characterState: 'concerned',
      });
    } else {
      candidates.push({
        type: 'commute_clear',
        title: 'Smooth commute conditions',
        shortMessage: 'Clear roads and comfortable temperatures for your trip.',
        factor: 'visibility',
        baseSeverity: 0.5,
        contextRelevance: commuterRelevance,
        temporalRelevance: isMorning || isEvening ? 0.9 : 0.5,
        reasonCodes: ['CLEAR_TRANSIT_WINDOW'],
        icon: '🚗',
        characterState: 'happy',
      });
    }
  }

  // 3. Cycling & Fitness Window Insight
  const fitnessRelevance = persona.activities['fitness'] || 0.4;
  if (fitnessRelevance > 0.4) {
    // Find best 2-hour window in the next 12 hours with lowest rain & moderate temp
    const next12 = weather.hourly.slice(0, 12);
    const goodHour = next12.find((h) => h.rainProb < 20 && h.temp < 32 && h.windSpeed < 20);

    if (goodHour) {
      candidates.push({
        type: 'fitness_window',
        title: 'Best outdoor workout window',
        shortMessage: `Ideal riding & running window around ${goodHour.time} with low wind.`,
        factor: 'temperature',
        baseSeverity: 0.65,
        contextRelevance: fitnessRelevance,
        temporalRelevance: 0.95,
        reasonCodes: ['OPTIMAL_TEMP_WINDOW', 'LOW_PRECIPITATION'],
        icon: '🏃',
        characterState: 'energetic',
      });
    } else if (current.rainProbability > 50) {
      candidates.push({
        type: 'fitness_rain_warning',
        title: 'Rain during workout hours',
        shortMessage: 'Wet pavement and shower chance. Consider indoor training today.',
        factor: 'rain',
        baseSeverity: 0.8,
        contextRelevance: fitnessRelevance,
        temporalRelevance: 0.85,
        reasonCodes: ['SLIPPERY_ROADS', 'RAIN_ACTIVE'],
        icon: '🚴',
        characterState: 'concerned',
      });
    }
  }

  // 4. Heat & Feels-Like Warning (Daytime only)
  if (!isNight && (current.feelsLike >= 33 || current.temperature >= 32)) {
    candidates.push({
      type: 'heat_advisory',
      title: "It'll feel warmer today",
      shortMessage: `Feels like ${Math.round(current.feelsLike)}° with high humidity. Stay hydrated.`,
      factor: 'feels_like',
      baseSeverity: Math.min(1.0, (current.feelsLike - 30) / 10),
      contextRelevance: persona.traits.heat_sensitive,
      temporalRelevance: currentHour >= 11 && currentHour <= 16 ? 0.95 : 0.7,
      reasonCodes: ['HIGH_HEAT_INDEX', 'HUMIDITY_DISCOMFORT'],
      icon: '☀️',
      characterState: 'heat',
    });
  }

  // 5. Carry an Umbrella
  const eveningRain = weather.hourly.slice(2, 8).find((h) => h.rainProb >= 60);
  if (eveningRain) {
    const isCommuter = (persona.activities['commuter'] || 0) > 0.4;
    candidates.push({
      type: 'carry_umbrella',
      title: 'Carry an umbrella',
      shortMessage: `Rain chance climbs to ${eveningRain.rainProb}% around ${eveningRain.time}.`,
      factor: 'rain',
      baseSeverity: 0.75,
      contextRelevance: persona.traits.rain_sensitive,
      temporalRelevance: 0.9,
      reasonCodes: isCommuter
        ? ['AFTERNOON_RAIN_SURGE', 'COMMUTE_RAIN_PREP']
        : ['AFTERNOON_RAIN_SURGE'],
      icon: '☂️',
      characterState: 'rain',
    });
  }

  // 6. Air Quality & Respiratory
  const aqiSensitivity = persona.traits.aqi_sensitive;
  if (current.aqi && current.aqi > 100) {
    candidates.push({
      type: 'aqi_warning',
      title: 'Air quality is poor',
      shortMessage: `AQI index is ${current.aqi}. Sensitive groups should limit outdoor exertion.`,
      factor: 'aqi',
      baseSeverity: 0.85,
      contextRelevance: aqiSensitivity,
      temporalRelevance: 0.9,
      reasonCodes: ['RESPIRATORY_CONCERN', 'HIGH_AQI'],
      icon: '🌫️',
      characterState: 'concerned',
    });
  } else {
    candidates.push({
      type: 'aqi_good',
      title: 'Air quality is crisp',
      shortMessage: 'Healthy breathing conditions outdoors right now.',
      factor: 'aqi',
      baseSeverity: 0.4,
      contextRelevance: aqiSensitivity,
      temporalRelevance: 0.7,
      reasonCodes: ['GOOD_AQI'],
      icon: '🌱',
      characterState: 'happy',
    });
  }

  // 7. UV Index (Daylight hours only)
  if (!isNight && current.uvIndex && current.uvIndex >= 6 && currentHour >= 9 && currentHour <= 17) {
    candidates.push({
      type: 'uv_peak',
      title: 'High UV exposure today',
      shortMessage: `UV index reaches ${current.uvIndex}. Wear sun protection if out at midday.`,
      factor: 'uv',
      baseSeverity: 0.7,
      contextRelevance: persona.traits.uv_sensitive,
      temporalRelevance: currentHour >= 10 && currentHour <= 15 ? 0.95 : 0.5,
      reasonCodes: ['HIGH_SOLAR_RADIATION'],
      icon: '☀️',
      characterState: 'heat',
    });
  }

  return candidates;
}
