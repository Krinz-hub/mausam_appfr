import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { AppText as Text } from '../common/AppText';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

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
  const offset = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled || loading) return;
    offset.value = withTiming(3, { duration: 80 });
  };

  const handlePressOut = () => {
    offset.value = withTiming(0, { duration: 120 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    hapticManager.impact('medium');
    audioManager.play('selection');
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      { translateY: offset.value },
    ],
  }));

  const getBackgroundColor = () => {
    if (disabled) return '#D9D7CE';
    switch (variant) {
      case 'accent':
        return theme.colors.accentAmber; // #FFB21A
      case 'danger':
        return theme.colors.accentCoral; // #FF5533
      case 'secondary':
        return '#FFFDF7';
      default:
        return theme.colors.accentCoral; // #FF5533
    }
  };

  const getTextColor = () => {
    if (disabled) return '#8A8A8A';
    if (variant === 'secondary') return '#171717';
    return '#FFFDF7';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Physical hard offset shadow underlay */}
      <View
        style={[
          styles.underlay,
          {
            backgroundColor: disabled ? '#A8A69E' : '#171717',
            borderRadius: theme.radius.button,
          },
        ]}
      />

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
            borderColor: disabled ? '#8A8A8A' : '#171717',
            borderWidth: 2.5,
            height: theme.spacing.buttonHeight,
            minHeight: theme.spacing.minTouchTarget,
            paddingHorizontal: theme.spacing.lg,
          },
          animatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconBox}>{icon}</View>}
            <Text
              style={[
                styles.label,
                {
                  color: getTextColor(),
                  fontSize: theme.typography.sizes.headline,
                  fontWeight: theme.typography.weights.bold,
                  letterSpacing: 0.5,
                },
                textStyle,
              ]}
            >
              {label}
            </Text>
          </View>
        )}
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginVertical: 4,
    paddingRight: 4,
    paddingBottom: 4,
  },
  underlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    marginRight: 8,
  },
  label: {
    textAlign: 'center',
  },
});
