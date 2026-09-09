import React from 'react';
import {
  Pressable,
  StyleSheet,
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

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.96, theme.motion.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.motion.spring.responsive);
  };

  const handlePress = () => {
    if (disabled) return;
    audioManager.play('selection');
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.backgroundCard,
          borderColor: theme.colors.border,
          borderWidth: 1.5,
          borderRadius: theme.radius.button,
          height: theme.spacing.buttonHeight,
          minHeight: theme.spacing.minTouchTarget,
          paddingHorizontal: theme.spacing.lg,
          ...theme.shadows.sm,
        },
        animatedStyle,
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          styles.label,
          {
            color: disabled ? theme.colors.textMuted : theme.colors.textPrimary,
            fontSize: theme.typography.sizes.headline,
            fontWeight: theme.typography.weights.semibold,
            marginLeft: icon ? theme.spacing.sm : 0,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
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
