import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AppText as Text } from '../common/AppText';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  variant = 'primary',
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, theme.motion.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.motion.spring.responsive);
  };

  const handlePress = () => {
    if (disabled || loading) return;
    audioManager.play('selection');
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'accent':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.error;
      case 'secondary':
        return theme.colors.primaryLight;
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;
    if (variant === 'secondary') return theme.colors.primary;
    return theme.colors.textInverse;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.radius.button,
          height: theme.spacing.buttonHeight,
          minHeight: theme.spacing.minTouchTarget,
          paddingHorizontal: theme.spacing.lg,
          ...theme.shadows.md,
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.label,
              {
                color: getTextColor(),
                fontSize: theme.typography.sizes.headline,
                fontWeight: theme.typography.weights.bold,
                marginLeft: icon ? theme.spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    textAlign: 'center',
  },
});
