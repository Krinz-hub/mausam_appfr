import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../design';

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  style,
}) => {
  const theme = useTheme();
  const progressAnim = useSharedValue(0);

  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  useEffect(() => {
    progressAnim.value = withTiming(percentage, {
      duration: theme.motion.duration.standard,
    });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.borderLight,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.pill,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
