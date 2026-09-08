import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../design';

export interface AnimatedBarProps {
  label: string;
  value: number; // 0 to 100
  unit?: string;
  color?: string;
  style?: ViewStyle;
  delayMs?: number;
  height?: number;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  label,
  value,
  unit = '%',
  color,
  style,
  delayMs = 0,
  height = 12,
}) => {
  const theme = useTheme();
  const widthAnim = useSharedValue(0);

  const clampedVal = Math.max(0, Math.min(100, value));
  const barColor = color || theme.colors.primary;

  useEffect(() => {
    widthAnim.value = 0;
    widthAnim.value = withDelay(
      delayMs,
      withTiming(clampedVal, { duration: theme.motion.duration.gentle })
    );
  }, [clampedVal, delayMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
          {Math.round(clampedVal)}
          {unit}
        </Text>
      </View>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.colors.borderLight,
            borderRadius: theme.radius.pill,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              borderRadius: theme.radius.pill,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
