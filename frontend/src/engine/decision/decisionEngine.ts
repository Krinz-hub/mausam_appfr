import {
  PersonaProfile,
  WeatherDecision,
  ExperienceConfig,
  PrimaryInsight,
  SecondaryCard,
  WeatherFactor,
  SuggestionInsightItem,
} from '../types';
import { CanonicalWeatherData } from '../../services/weather/canonicalModel';
import { generateCandidateInsights, CandidateInsight } from './insightRules';
import { calculateRecommendationScore } from './scoring';
import { AstronomicalEngine } from '../astronomy/astronomicalEngine';
import { CharacterState } from '../../engines/weather/weatherCharacterTypes';

export class DecisionEngine {
  /**
   * Evaluates weather telemetry against user persona, forecast, and astronomical context
   * to select what matters right now. Generates a unique decisionId for explainability & feedback.
   */
  public static decide(
    weather: CanonicalWeatherData,
    persona: PersonaProfile,
    currentHour: number = new Date().getHours(),
    currentTime: Date = new Date()
  ): { decision: WeatherDecision; experience: ExperienceConfig } {
    const decisionId = `dec_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hour expiry

    // 1. Generate and score weather candidate insights
    const candidates = generateCandidateInsights(weather, persona, currentHour);

    const scoredCandidates = candidates.map((cand) => {
      let needPriority = 0.5;
      if (cand.factor === 'rain') needPriority = persona.traits.rain_sensitive;
      else if (cand.factor === 'feels_like' || cand.factor === 'temperature')
        needPriority = persona.traits.heat_sensitive;
      else if (cand.factor === 'wind') needPriority = persona.traits.wind_sensitive;
      else if (cand.factor === 'aqi') needPriority = persona.traits.aqi_sensitive;
      else if (cand.factor === 'uv') needPriority = persona.traits.uv_sensitive;
      else if (cand.factor === 'storm') needPriority = 1.0; // Universal safety priority

      const score = calculateRecommendationScore({
        needPriority,
        weatherSeverity: cand.baseSeverity,
        contextRelevance: cand.contextRelevance,
        temporalRelevance: cand.temporalRelevance,
        confidence: persona.confidence,
      });

      return { ...cand, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    // 2. Evaluate Astronomical Intelligence
    const astroResult = AstronomicalEngine.evaluate(weather, persona, currentTime);
    let astroInsight = astroResult.insight;

    // Check if severe weather takes absolute priority over astronomy
    const isSevere = scoredCandidates.some((c) => c.type === 'severe_storm');
    if (isSevere && astroInsight && astroInsight.activity) {
      // Suppress outdoor activity astronomy in severe storm
      astroInsight = null;
    }

    // Deduplication check: if a weather candidate already addresses the exact same activity/hazard
    if (astroInsight) {
      const coversSameActivity = scoredCandidates.some(
        (c) =>
          (c.type.includes('commute') && astroInsight?.activity === 'commute') ||
          (c.type.includes('fitness') && astroInsight?.activity === 'running' && c.factor === 'rain') ||
          (c.factor === 'rain' && (weather.current.rainProbability >= 60 || (weather.current.precipitation !== undefined && weather.current.precipitation > 2)))
      );
      if (coversSameActivity) {
        astroInsight = null;
      }
    }

    // 3. Primary Insight selection (Context Fusion)
    // Priority >= 90 from astronomy can become primary if weather permits and outranks others
    const astroNormScore = astroInsight ? astroInsight.priority / 100 : 0;
    const topWeather = scoredCandidates[0];

    let primaryInsight: PrimaryInsight;
    let isAstroPrimary = false;

    if (
      astroInsight &&
      astroInsight.priority >= 90 &&
      !isSevere &&
      (!topWeather || astroNormScore >= topWeather.score)
    ) {
      isAstroPrimary = true;
      primaryInsight = {
        type: astroInsight.type,
        title: astroInsight.title,
        shortMessage: astroInsight.message,
        priority: astroNormScore,
        reasonCodes: ['ASTRONOMICAL_WINDOW', astroInsight.relevanceReason.toUpperCase()],
        icon: astroInsight.type.includes('sunset') ? '🌇' : '☀️',
        characterState: astroInsight.characterState || 'sunny',
      };
    } else if (topWeather) {
      primaryInsight = {
        type: topWeather.type,
        title: topWeather.title,
        shortMessage: topWeather.shortMessage,
        priority: topWeather.score,
        reasonCodes: topWeather.reasonCodes,
        icon: topWeather.icon,
        characterState: topWeather.characterState,
      };
    } else {
      primaryInsight = {
        type: 'general_comfort',
        title: 'Your day looks comfortable',
        shortMessage: 'Mild temperatures and gentle breeze expected all day.',
        reasonCodes: ['GENERAL_COMFORT'],
        priority: 0.7,
        icon: '🌤️',
        characterState: 'sunny',
      };
    }

    // 4. Secondary Cards
    const secondaryCards: SecondaryCard[] = [];
    const coveredCardTitles = new Set<string>([primaryInsight.title]);

    // If astronomy is important (70-89) and not primary, add as top secondary card
    if (astroInsight && !isAstroPrimary && astroInsight.priority >= 60) {
      secondaryCards.push({
        type: astroInsight.type,
        title: astroInsight.title,
        shortMessage: astroInsight.message,
        priority: astroNormScore,
        icon: astroInsight.type.includes('sunset') ? '🌇' : '☀️',
        characterState: astroInsight.characterState || 'sunny',
      });
      coveredCardTitles.add(astroInsight.title);
    }

    for (const c of scoredCandidates) {
      if (secondaryCards.length >= 3) break;
      if (!coveredCardTitles.has(c.title)) {
        coveredCardTitles.add(c.title);
        secondaryCards.push({
          type: c.type,
          title: c.title,
          shortMessage: c.shortMessage,
          priority: c.score,
          icon: c.icon,
          characterState: c.characterState,
        });
      }
    }

    // 5. Centralized engine-generated Suggestion pool for Home Screen
    const suggestions: SuggestionInsightItem[] = [];
    const seenSuggestionKeys = new Set<string>();

    // Add Primary
    suggestions.push({
      id: isAstroPrimary ? 'primary_astro' : 'primary_decision',
      type: primaryInsight.type,
      message: primaryInsight.title,
      tip: primaryInsight.shortMessage,
      characterState: (primaryInsight.characterState as CharacterState) || 'sunny',
      badge: isAstroPrimary ? 'Astronomical Intelligence' : 'Primary Intelligence',
      isPrimary: true,
      priority: primaryInsight.priority,
    });
    seenSuggestionKeys.add(primaryInsight.title);

    // Add Astronomical Insight if not primary and approved
    if (astroInsight && !isAstroPrimary && !seenSuggestionKeys.has(astroInsight.title)) {
      suggestions.push({
        id: `astro_${astroInsight.type}`,
        type: astroInsight.type,
        message: astroInsight.title,
        tip: astroInsight.message,
        characterState: (astroInsight.characterState as CharacterState) || 'sunny',
        badge: 'Astronomical Intelligence',
        isPrimary: false,
        priority: astroNormScore,
      });
      seenSuggestionKeys.add(astroInsight.title);
    }

    // Add Secondary Cards
    for (const sc of secondaryCards) {
      if (!seenSuggestionKeys.has(sc.title)) {
        seenSuggestionKeys.add(sc.title);
        suggestions.push({
          id: `sec_${sc.type}`,
          type: sc.type,
          message: sc.title,
          tip: sc.shortMessage,
          characterState: (sc.characterState as CharacterState) || 'sunny',
          badge: 'Personalized Insight',
          isPrimary: false,
          priority: sc.priority,
        });
      }
    }

    // Add contextual alerts based on live weather if not already covered
    const cur = weather.current;
    if (cur.weatherCode >= 95 && !seenSuggestionKeys.has('Thunderstorm advisory')) {
      suggestions.unshift({
        id: 'ctx_storm',
        type: 'severe_storm',
        message: 'Thunderstorm Advisory ⛈️',
        tip: 'Strong squalls and lightning active in your area. Stay sheltered indoors.',
        characterState: 'thunderstorm',
        badge: 'Severe Alert',
        isPrimary: true,
        priority: 1.0,
      });
      seenSuggestionKeys.add('Thunderstorm advisory');
    }

    if (cur.rainProbability >= 40 && !seenSuggestionKeys.has('Carry an umbrella')) {
      suggestions.push({
        id: 'ctx_rain',
        type: 'rain',
        message: 'Umbrella Advisory ☔',
        tip: `Rain probability is ${cur.rainProbability}%. Keep rain gear handy!`,
        characterState: 'rain',
        badge: 'Rain Advisory',
        isPrimary: false,
        priority: 0.75,
      });
    }

    if (cur.uvIndex && cur.uvIndex >= 6 && currentHour >= 9 && currentHour <= 16) {
      suggestions.push({
        id: 'ctx_uv',
        type: 'uv',
        message: 'High UV Alert ☀️',
        tip: `UV index reaches ${cur.uvIndex}. Wear SPF 30+ sunscreen and sunglasses today.`,
        characterState: 'bright_sun',
        badge: 'UV Shield',
        isPrimary: false,
        priority: 0.7,
      });
    }

    // Add friendly companion tip
    suggestions.push({
      id: 'ctx_interactive',
      type: 'bulb',
      message: 'Always Keeping Watch 🌤️',
      tip: 'Swipe left or right anytime to explore your atmospheric intelligence!',
      characterState: 'sunny',
      badge: 'Daily Companion',
      isPrimary: false,
      priority: 0.3,
    });

    const weatherSnapshot = {
      temp: weather.current.temperature,
      feelsLike: weather.current.feelsLike,
      rainProb: weather.current.rainProbability,
      uvIndex: weather.current.uvIndex,
      windSpeed: weather.current.windSpeed,
      aqi: weather.current.aqi,
    };

    const decision: WeatherDecision = {
      decisionId,
      timestamp: new Date().toISOString(),
      primary: primaryInsight,
      secondary: secondaryCards,
      astronomicalInsight: isAstroPrimary ? null : astroInsight,
      confidence: persona.confidence,
      expiresAt,
      weatherSnapshot,
    };

    // Greeting based on time
    let greeting = 'Good morning';
    if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';
    else if (currentHour >= 17 && currentHour < 21) greeting = 'Good evening';
    else if (currentHour >= 21 || currentHour < 5) greeting = 'Good night';

    const visibleFeatures: WeatherFactor[] = [
      'rain',
      'feels_like',
      'wind',
      ...(weather.current.uvIndex ? (['uv'] as WeatherFactor[]) : []),
      ...(weather.current.aqi ? (['aqi'] as WeatherFactor[]) : []),
    ];

    const experience: ExperienceConfig = {
      decisionId,
      greeting,
      location: weather.locationName,
      characterState: primaryInsight.characterState || 'sunny',
      primaryInsight,
      cards: secondaryCards,
      astronomicalInsight: isAstroPrimary ? null : astroInsight,
      suggestions,
      visibleFeatures,
      action: {
        label: 'View Hourly Forecast',
        destination: '/forecast',
      },
    };

    return { decision, experience };
  }
}
