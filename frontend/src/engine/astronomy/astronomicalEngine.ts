import { CanonicalWeatherData } from '../../services/weather/canonicalModel';
import { PersonaProfile } from '../types';
import {
  AstronomicalContext,
  AstronomicalInsight,
  AstronomicalDiagnosticReport,
} from './astronomicalTypes';
import { computeAstronomicalContext } from './astronomicalContext';
import {
  evaluateAstronomicalCandidates,
  isSevereWeatherActive,
} from './astronomicalRelevance';

export interface AstronomicalEvaluationOutput {
  context: AstronomicalContext;
  insight: AstronomicalInsight | null;
  candidates: AstronomicalInsight[];
  diagnostics: AstronomicalDiagnosticReport[];
}

export class AstronomicalEngine {
  /**
   * Evaluates atmospheric & astronomical telemetry against user persona
   * to determine if an astronomical insight is worth showing.
   */
  public static evaluate(
    weather: CanonicalWeatherData,
    persona: PersonaProfile,
    currentTimeInput: Date | string = new Date()
  ): AstronomicalEvaluationOutput {
    const currentTime =
      typeof currentTimeInput === 'string'
        ? new Date(currentTimeInput)
        : currentTimeInput;

    const context = computeAstronomicalContext(weather, currentTime);
    const { candidates, diagnostics } = evaluateAstronomicalCandidates(
      context,
      weather,
      persona,
      { currentDate: currentTime }
    );

    // Filter out expired candidates
    const validCandidates = candidates.filter((c) => {
      if (!c.expiresAt) return true;
      const expiry = new Date(c.expiresAt);
      return !isNaN(expiry.getTime()) && expiry.getTime() > currentTime.getTime();
    });

    // Deduplicate against duplicate actions (e.g. multiple sunrise running cards)
    const seenActivities = new Set<string>();
    const deduplicated: AstronomicalInsight[] = [];

    for (const cand of validCandidates) {
      const key = `${cand.type}_${cand.activity || 'gen'}`;
      if (!seenActivities.has(key)) {
        seenActivities.add(key);
        deduplicated.push(cand);
      }
    }

    // Pick top candidate if priority threshold (>= 50) is met
    const topCandidate = deduplicated.length > 0 ? deduplicated[0] : null;

    if (topCandidate) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        this.logDiagnostics(diagnostics);
      }
    }

    return {
      context,
      insight: topCandidate,
      candidates: deduplicated,
      diagnostics,
    };
  }

  /**
   * Outputs development-only evaluation diagnostics to console.
   */
  public static logDiagnostics(diagnostics: AstronomicalDiagnosticReport[]): void {
    if (!diagnostics || diagnostics.length === 0) return;
    for (const d of diagnostics) {
      const decisionStr = d.decision === 'SHOW' ? 'SHOW' : 'SUPPRESS';
      const reasonStr = d.reason ? ` (${d.reason})` : '';
      console.log(
        `[Astronomy Engine] Event: ${d.event || 'none'} | Mins: ${d.minutesRemaining ?? 'N/A'} | Activity: ${d.userActivity || 'none'} | Score: ${d.finalScore} -> ${decisionStr}${reasonStr}`
      );
    }
  }
}
