import React, { useCallback, useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { CharacterStage, StageSize } from './CharacterStage';
import {
  WeatherContext,
  CharacterState,
  ResolvedCharacterState,
} from '../../engines/weather/weatherCharacterTypes';
import { WeatherCharacterEngine } from '../../engines/weather/WeatherCharacterEngine';
import { WEATHER_CHARACTER_ASSETS } from '../../engines/weather/weatherCharacterAssets';
import { WEATHER_CHARACTER_CONFIGS } from '../../engines/weather/weatherCharacterConfig';
import { hapticManager } from '../../services/haptics/hapticManager';

export interface WeatherCharacterProps {
  context?: WeatherContext;
  state?: CharacterState;
  resolved?: ResolvedCharacterState;
  size?: StageSize;
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const WeatherCharacter: React.FC<WeatherCharacterProps> = ({
  context,
  state,
  resolved: explicitResolved,
  size,
  interactive = true,
  onPress,
  style,
  imageStyle,
  testID = 'weather-character',
}) => {
  // Resolve character state deterministically
  const resolvedState = useMemo<ResolvedCharacterState>(() => {
    if (explicitResolved) return explicitResolved;

    if (context) {
      return WeatherCharacterEngine.resolve(context);
    }

    const targetState: CharacterState = state || 'sunny';
    const config = WEATHER_CHARACTER_CONFIGS[targetState] || WEATHER_CHARACTER_CONFIGS.sunny;
    const assetMeta = WEATHER_CHARACTER_ASSETS[targetState] || WEATHER_CHARACTER_ASSETS.sunny;

    return {
      assetKey: assetMeta.fileName,
      asset: assetMeta.source,
      assetMeta,
      state: targetState,
      mood: config.mood,
      message: config.defaultMessage,
      tip: config.defaultTip,
      haptic: config.haptic,
      accessibilityLabel: config.accessibilityLabel,
      priority: config.priority,
      timeOfDay: 'morning',
    };
  }, [context, state, explicitResolved]);

  // Subtle press animation: 1.00 -> 0.94 -> 1.02 -> 1.00
  const scale = useSharedValue(1);

  const animatedTransformStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    // 1. Trigger native haptic feedback matching condition severity
    hapticManager.impact(resolvedState.haptic);

    // 2. Subtle press spring/timing sequence
    scale.value = withSequence(
      withTiming(0.94, { duration: 90 }),
      withTiming(1.02, { duration: 110 }),
      withSpring(1.0, { damping: 12, stiffness: 240 })
    );

    // 3. User callback
    onPress?.();
  }, [resolvedState.haptic, onPress]);

  const isClickable = interactive && (!!onPress || true);

  const imageElement = (
    <Image
      source={resolvedState.asset}
      resizeMode="contain"
      accessibilityLabel={resolvedState.accessibilityLabel}
      style={[
        styles.image,
        {
          aspectRatio: resolvedState.assetMeta.aspectRatio,
        },
        imageStyle,
      ]}
    />
  );

  return (
    <CharacterStage size={size} style={style} testID={testID}>
      {isClickable ? (
        <AnimatedPressable
          onPress={handlePress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${resolvedState.accessibilityLabel}. Tap for weather reaction.`}
          style={[styles.pressable, animatedTransformStyle]}
        >
          {imageElement}
        </AnimatedPressable>
      ) : (
        <Animated.View style={[styles.pressable, animatedTransformStyle]}>
          {imageElement}
        </Animated.View>
      )}
    </CharacterStage>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  image: {
    width: '85%',
    height: '85%',
    backgroundColor: 'transparent',
  },
});
