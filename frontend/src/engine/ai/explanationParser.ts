import { AIParsedOutput, validateAIParsedOutput } from './schema';
import { UserType, WeatherFactor } from '../types';

export class ExplanationParser {
  /**
   * Parses natural-language user explanation into structured persona signals.
   * Runs deterministically offline; resilient against invalid syntax, typos, and empty strings.
   */
  public static parse(explanation: string): AIParsedOutput {
    if (!explanation || typeof explanation !== 'string' || explanation.trim() === '') {
      return { userTypes: [], needs: [], activePeriods: [] };
    }

    const text = explanation.toLowerCase();
    const rawOutput: {
      userTypes: { type: string; score: number }[];
      needs: { factor: string; priority: number }[];
      activePeriods: string[];
    } = {
      userTypes: [],
      needs: [],
      activePeriods: [],
    };

    // User Type Entity Extraction
    if (text.includes('commute') || text.includes('college') || text.includes('office') || text.includes('drive') || text.includes('bus') || text.includes('metro') || text.includes('travel to')) {
      rawOutput.userTypes.push({ type: 'commuter', score: 0.88 });
    }
    if (text.includes('cycle') || text.includes('cycling') || text.includes('bike') || text.includes('run') || text.includes('running') || text.includes('walk') || text.includes('exercise') || text.includes('fitness') || text.includes('gym')) {
      rawOutput.userTypes.push({ type: 'fitness', score: 0.82 });
    }
    if (text.includes('asthma') || text.includes('allergy') || text.includes('breathing') || text.includes('lungs') || text.includes('health') || text.includes('pollen')) {
      rawOutput.userTypes.push({ type: 'health', score: 0.92 });
    }
    if (text.includes('plant') || text.includes('garden') || text.includes('farming') || text.includes('soil') || text.includes('crops')) {
      rawOutput.userTypes.push({ type: 'agriculture', score: 0.85 });
    }
    if (text.includes('kids') || text.includes('child') || text.includes('baby') || text.includes('family') || text.includes('school')) {
      rawOutput.userTypes.push({ type: 'family', score: 0.86 });
    }
    if (text.includes('trip') || text.includes('flight') || text.includes('airport') || text.includes('vacation') || text.includes('tour')) {
      rawOutput.userTypes.push({ type: 'traveler', score: 0.80 });
    }
    if (text.includes('beach') || text.includes('surf') || text.includes('swim') || text.includes('ocean') || text.includes('sea')) {
      rawOutput.userTypes.push({ type: 'beach', score: 0.90 });
    }

    // Weather Factor Extraction
    if (text.includes('rain') || text.includes('shower') || text.includes('monsoon') || text.includes('wet') || text.includes('umbrella')) {
      rawOutput.needs.push({ factor: 'rain', priority: 0.95 });
      rawOutput.needs.push({ factor: 'precipitation_probability', priority: 0.90 });
    }
    if (text.includes('heat') || text.includes('hot') || text.includes('warm') || text.includes('scorching') || text.includes('sun')) {
      rawOutput.needs.push({ factor: 'feels_like', priority: 0.88 });
      rawOutput.needs.push({ factor: 'temperature', priority: 0.82 });
    }
    if (text.includes('cold') || text.includes('chilly') || text.includes('freeze') || text.includes('winter') || text.includes('frost')) {
      rawOutput.needs.push({ factor: 'temperature', priority: 0.85 });
    }
    if (text.includes('wind') || text.includes('breeze') || text.includes('storm') || text.includes('gust')) {
      rawOutput.needs.push({ factor: 'wind', priority: 0.84 });
    }
    if (text.includes('air quality') || text.includes('aqi') || text.includes('pollution') || text.includes('smog') || text.includes('smoke')) {
      rawOutput.needs.push({ factor: 'aqi', priority: 0.94 });
    }
    if (text.includes('uv') || text.includes('sunburn') || text.includes('tan')) {
      rawOutput.needs.push({ factor: 'uv', priority: 0.86 });
    }
    if (text.includes('humidity') || text.includes('sweat') || text.includes('muggy') || text.includes('sticky')) {
      rawOutput.needs.push({ factor: 'humidity', priority: 0.80 });
    }

    // Active Period Extraction
    if (text.includes('morning') || text.includes('dawn') || text.includes('early') || text.includes('am')) {
      rawOutput.activePeriods.push('morning');
    }
    if (text.includes('afternoon') || text.includes('noon') || text.includes('lunch')) {
      rawOutput.activePeriods.push('afternoon');
    }
    if (text.includes('evening') || text.includes('dusk') || text.includes('pm') || text.includes('sunset')) {
      rawOutput.activePeriods.push('evening');
    }
    if (text.includes('night') || text.includes('late')) {
      rawOutput.activePeriods.push('night');
    }

    // Default to morning if not specified but cycling/commute mentioned
    if (rawOutput.activePeriods.length === 0 && (text.includes('commute') || text.includes('cycle'))) {
      rawOutput.activePeriods.push('morning');
    }

    // Strict schema & authoritative feature registry validation
    return validateAIParsedOutput(rawOutput);
  }
}
