import {
  PersonaProfile,
  WeatherDecision,
  ExperienceConfig,
  PrimaryInsight,
  SecondaryCard,
  WeatherFactor,
} from '../types';
import { CanonicalWeatherData } from '../../services/weather/canonicalModel';
import { generateCandidateInsights } from './insightRules';
import { calculateRecommendationScore } from './scoring';

export class DecisionEngine {
  /**
   * Evaluates weather telemetry against user persona and context to select
   * what matters right now. Generates a unique decisionId for explainability & feedback.
   */
  public static decide(
    weather: CanonicalWeatherData,
    persona: PersonaProfile,
    currentHour: number = new Date().getHours()
  ): { decision: WeatherDecision; experience: ExperienceConfig } {
    const decisionId = `dec_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hour expiry

    const candidates = generateCandidateInsights(weather, persona, currentHour);

    // Score every candidate using deterministic formula
    const scoredCandidates = candidates.map((cand) => {
      // Need priority maps from persona sensitivity for that factor
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

    // Sort descending by calculated score
    scoredCandidates.sort((a, b) => b.score - a.score);

    const primaryCand = scoredCandidates[0] || {
      type: 'general_comfort',
      title: 'Your day looks comfortable',
      shortMessage: 'Mild temperatures and gentle breeze expected all day.',
      reasonCodes: ['GENERAL_COMFORT'],
      score: 0.7,
      icon: '🌤️',
      characterState: 'happy',
      factor: 'temperature' as WeatherFactor,
    };

    const primaryInsight: PrimaryInsight = {
      type: primaryCand.type,
      title: primaryCand.title,
      shortMessage: primaryCand.shortMessage,
      priority: primaryCand.score,
      reasonCodes: primaryCand.reasonCodes,
      icon: primaryCand.icon,
    };

    const secondaryCards: SecondaryCard[] = scoredCandidates
      .slice(1, 4)
      .map((c) => ({
        type: c.type,
        title: c.title,
        shortMessage: c.shortMessage,
        priority: c.score,
        icon: c.icon,
      }));

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
      characterState: primaryCand.characterState,
      primaryInsight,
      cards: secondaryCards,
      visibleFeatures,
      action: {
        label: 'View Hourly Forecast',
        destination: '/forecast',
      },
    };

    return { decision, experience };
  }
}
