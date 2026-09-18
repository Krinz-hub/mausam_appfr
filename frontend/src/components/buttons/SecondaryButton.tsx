import React from 'react';
import {
  Pressable,
  StyleSheet,
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
  const offset = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled) return;
    offset.value = withTiming(3, { duration: 80 });
  };

  const handlePressOut = () => {
    offset.value = withTiming(0, { duration: 120 });
  };

  const handlePress = () => {
    if (disabled) return;
    hapticManager.impact('light');
    audioManager.play('selection');
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      { translateY: offset.value },
    ],
  }));

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
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.backgroundCard,
            borderColor: disabled ? '#8A8A8A' : '#171717',
            borderWidth: 2.5,
            borderRadius: theme.radius.button,
            height: theme.spacing.buttonHeight,
            minHeight: theme.spacing.minTouchTarget,
            paddingHorizontal: theme.spacing.lg,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconBox}>{icon}</View>}
          <Text
            style={[
              styles.label,
              {
                color: disabled ? '#8A8A8A' : '#171717',
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
