import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { tokens, Tokens } from './tokens';
import { getDayCycleInfo, DayCycleInfo, DayCyclePhase } from './dayCycle';
import { dayColors, nightColors } from './colors';

export interface Theme extends Tokens {
  dayCycle: DayCycleInfo;
  isNight: boolean;
  phase: DayCyclePhase;
}

const initialDayCycle = getDayCycleInfo();

export const defaultTheme: Theme = {
  ...tokens,
  colors: initialDayCycle.colors,
  dayCycle: initialDayCycle,
  isNight: initialDayCycle.isNight,
  phase: initialDayCycle.phase,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dayCycle, setDayCycle] = useState<DayCycleInfo>(() => getDayCycleInfo());

  // Periodically refresh day-cycle every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setDayCycle(getDayCycleInfo());
    }, 1000 * 60 * 5);
    return () => clearInterval(timer);
  }, []);

  const activeTheme: Theme = useMemo(
    () => ({
      ...tokens,
      colors: dayCycle.colors,
      dayCycle,
      isNight: dayCycle.isNight,
      phase: dayCycle.phase,
    }),
    [dayCycle]
  );

  return React.createElement(ThemeContext.Provider, { value: activeTheme }, children);
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  return context || defaultTheme;
};

