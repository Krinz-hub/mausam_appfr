import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { motion } from './motion';
import { audioTokens } from './audio';

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  audio: audioTokens,
};

export type Tokens = typeof tokens;
