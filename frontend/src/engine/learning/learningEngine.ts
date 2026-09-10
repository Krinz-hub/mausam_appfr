import {
  PersonaProfile,
  WeatherDecision,
  FeedbackRecord,
  WeatherFactor,
} from '../types';
import { applyBoundedUpdate } from '../persona/boundedUpdate';
import { calculateTimeDecayWeight } from '../persona/decay';

export type DiagnosticClassification =
  | 'forecast_inaccurate'
  | 'recommendation_irrelevant'
  | 'timing_off'
  | 'forecast_and_recommendation_useful'
  | 'neutral_dismissal';

export class LearningEngine {
  /**
   * Evaluates the feedback against the original decision and weather snapshot
   * to categorize the root cause and calibrate the user's persona weights safely.
   */
  public static diagnose(
    decision: WeatherDecision,
    feedback: FeedbackRecord
  ): DiagnosticClassification {
    if (feedback.type === 'positive') {
      return 'forecast_and_recommendation_useful';
    }

    switch (feedback.reason) {
      case 'forecast_changed':
        return 'forecast_inaccurate';
      case 'too_early':
      case 'too_late':
        return 'timing_off';
      case 'not_relevant':
        return 'recommendation_irrelevant';
      default:
        return 'neutral_dismissal';
    }
  }

  /**
   * Applies bounded calibration to the persona without drastic swings.
   */
  public static processFeedback(
    persona: PersonaProfile,
    decision: WeatherDecision,
    feedback: FeedbackRecord
  ): PersonaProfile {
    const diagnostic = this.diagnose(decision, feedback);
    const decayWeight = calculateTimeDecayWeight(feedback.timestamp);

    const updatedTraits = { ...persona.traits };
    const updatedActivities = { ...persona.activities };

    // Determine target factor from decision primary insight
    const primaryType = decision.primary.type;

    if (diagnostic === 'forecast_and_recommendation_useful') {
      // Reinforce the sensitivity and active activity
      if (primaryType.includes('rain')) {
        updatedTraits.rain_sensitive = applyBoundedUpdate(
          updatedTraits.rain_sensitive,
          1,
          decayWeight,
          0.8
        );
      } else if (primaryType.includes('heat')) {
        updatedTraits.heat_sensitive = applyBoundedUpdate(
          updatedTraits.heat_sensitive,
          1,
          decayWeight,
          0.8
        );
      } else if (primaryType.includes('aqi')) {
        updatedTraits.aqi_sensitive = applyBoundedUpdate(
          updatedTraits.aqi_sensitive,
          1,
          decayWeight,
          0.8
        );
      }

      if (primaryType.includes('commute')) {
        updatedActivities['commuter'] = applyBoundedUpdate(
          updatedActivities['commuter'] || 0.5,
          1,
          decayWeight,
          0.8
        );
      } else if (primaryType.includes('fitness')) {
        updatedActivities['fitness'] = applyBoundedUpdate(
          updatedActivities['fitness'] || 0.5,
          1,
          decayWeight,
          0.8
        );
      }
    } else if (diagnostic === 'recommendation_irrelevant') {
      // User said "Not relevant to me" -> slightly lower activity/factor weight
      if (primaryType.includes('commute')) {
        updatedActivities['commuter'] = applyBoundedUpdate(
          updatedActivities['commuter'] || 0.5,
          -1,
          decayWeight,
          0.7
        );
      } else if (primaryType.includes('fitness')) {
        updatedActivities['fitness'] = applyBoundedUpdate(
          updatedActivities['fitness'] || 0.5,
          -1,
          decayWeight,
          0.7
        );
      }
    } else if (diagnostic === 'forecast_inaccurate') {
      // The forecast was wrong, NOT the user's preference!
      // Keep persona trait intact, but log forecast discrepancy signal.
    }

    return {
      ...persona,
      traits: updatedTraits,
      activities: updatedActivities,
      lastUpdated: new Date().toISOString(),
    };
  }
}
