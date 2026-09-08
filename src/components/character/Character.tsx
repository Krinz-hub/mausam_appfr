import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design';

export type CharacterState =
  | 'happy'
  | 'concerned'
  | 'energetic'
  | 'tired'
  | 'bundled'
  | 'sleeping'
  | 'thinking'
  | 'excited'
  | 'success'
  | 'rain'
  | 'heat'
  | 'cold'
  | 'storm'
  | 'neutral';

export interface CharacterProps {
  state: CharacterState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  style?: ViewStyle;
  animate?: boolean;
}

const CHARACTER_CONFIG: Record<
  CharacterState,
  { emoji: string; auraColor: string; label: string; badge?: string }
> = {
  happy: { emoji: '☀️', auraColor: '#FEF3C7', label: 'Cheerful and clear', badge: '😊' },
  concerned: { emoji: '🌧️', auraColor: '#E0F2FE', label: 'Watch out for rain', badge: '🥺' },
  energetic: { emoji: '💨', auraColor: '#CCFBF1', label: 'Breezy and active', badge: '⚡' },
  tired: { emoji: '🥵', auraColor: '#FEE2E2', label: 'Hot and humid', badge: '💧' },
  bundled: { emoji: '🥶', auraColor: '#DBEAFE', label: 'Chilly weather', badge: '🧣' },
  sleeping: { emoji: '🌙', auraColor: '#EDE9FE', label: 'Nighttime rest', badge: '😴' },
  thinking: { emoji: '🤔', auraColor: '#E2E8F0', label: 'Analyzing weather patterns' },
  excited: { emoji: '🥰', auraColor: '#FCE7F3', label: 'Great conditions ahead', badge: '✨' },
  success: { emoji: '🎉', auraColor: '#D1FAE5', label: 'Personalization configured', badge: '✓' },
  rain: { emoji: '☔', auraColor: '#E0F2FE', label: 'Rain alert', badge: '🌧️' },
  heat: { emoji: '☀️', auraColor: '#FFEDD5', label: 'High temperature', badge: '🔥' },
  cold: { emoji: '❄️', auraColor: '#E0F2FE', label: 'Cold temperatures', badge: '🧤' },
  storm: { emoji: '⛈️', auraColor: '#FEE2E2', label: 'Severe weather alert', badge: '⚠️' },
  neutral: { emoji: '⛅', auraColor: '#F1F5F9', label: 'Comfortable day' },
};

export const Character: React.FC<CharacterProps> = ({
  state,
  size = 'md',
  style,
  animate = true,
}) => {
  const theme = useTheme();
  const config = CHARACTER_CONFIG[state] || CHARACTER_CONFIG.neutral;

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;

    // Gentle breathing / floating loop
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1600 }),
        withTiming(0, { duration: 1600 })
      ),
      -1,
      true
    );

    // Subtle scale bounce on state change
    scale.value = 0.85;
    scale.value = withSpring(1, theme.motion.spring.bouncy);
  }, [state, animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const dimensions = {
    sm: { container: 48, emoji: 26, badge: 14 },
    md: { container: 76, emoji: 40, badge: 18 },
    lg: { container: 104, emoji: 56, badge: 22 },
    hero: { container: 132, emoji: 72, badge: 26 },
  }[size];

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel={`Mausam buddy status: ${config.label}`}
      style={[
        styles.wrapper,
        { width: dimensions.container, height: dimensions.container },
        animatedStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.aura,
          {
            backgroundColor: config.auraColor,
            borderRadius: dimensions.container / 2,
          },
        ]}
      />
      <View
        style={[
          styles.innerCircle,
          {
            width: dimensions.container * 0.84,
            height: dimensions.container * 0.84,
            borderRadius: (dimensions.container * 0.84) / 2,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <Text style={{ fontSize: dimensions.emoji }}>{config.badge || config.emoji}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  aura: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  innerCircle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
