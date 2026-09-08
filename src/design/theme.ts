import React, { createContext, useContext } from 'react';
import { tokens, Tokens } from './tokens';

export type Theme = Tokens;

export const defaultTheme: Theme = tokens;

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider: React.FC<{ theme?: Theme; children: React.ReactNode }> = ({
  theme = defaultTheme,
  children,
}) => {
  return React.createElement(ThemeContext.Provider, { value: theme }, children);
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  return context || defaultTheme;
};
