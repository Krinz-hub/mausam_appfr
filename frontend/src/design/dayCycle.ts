import { dayColors, nightColors, dayCycleGradients } from './colors';

export type DayCyclePhase =
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'sunset'
  | 'evening'
  | 'night';

export interface DayCycleInfo {
  phase: DayCyclePhase;
  isNight: boolean;
  gradient: {
    top: string;
    bottom: string;
    accent: string;
  };
  colors: typeof dayColors;
  statusBarStyle: 'light-content' | 'dark-content';
}

/**
 * Calculates current DayCyclePhase based on local time, with optional sunrise/sunset times.
 * Runs synchronously on app start to prevent white-flash.
 */
export function getDayCycleInfo(
  date: Date = new Date(),
  sunriseStr?: string,
  sunsetStr?: string
): DayCycleInfo {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const timeInMinutes = currentHour * 60 + currentMinute;

  // Defaults if sunrise/sunset not provided:
  // Dawn: 5:00 - 6:30 (300 - 390 min)
  // Morning: 6:30 - 11:30 (390 - 690 min)
  // Afternoon: 11:30 - 16:30 (690 - 990 min)
  // Sunset: 16:30 - 18:30 (990 - 1110 min)
  // Evening: 18:30 - 21:30 (1110 - 1290 min)
  // Night: 21:30 - 5:00 (1290 - 1440 min and 0 - 300 min)

  let phase: DayCyclePhase = 'morning';

  if (timeInMinutes >= 300 && timeInMinutes < 390) {
    phase = 'dawn';
  } else if (timeInMinutes >= 390 && timeInMinutes < 690) {
    phase = 'morning';
  } else if (timeInMinutes >= 690 && timeInMinutes < 990) {
    phase = 'afternoon';
  } else if (timeInMinutes >= 990 && timeInMinutes < 1110) {
    phase = 'sunset';
  } else if (timeInMinutes >= 1110 && timeInMinutes < 1290) {
    phase = 'evening';
  } else {
    phase = 'night';
  }

  const isNight = phase === 'night' || phase === 'evening';
  const colors = isNight ? nightColors : dayColors;
  const gradient = dayCycleGradients[phase];
  const statusBarStyle = isNight ? 'light-content' : 'dark-content';

  return {
    phase,
    isNight,
    gradient,
    colors,
    statusBarStyle,
  };
}
