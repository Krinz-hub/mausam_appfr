import React, { useCallback, useEffect, useMemo } from 'react';
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
  withRepeat,
  Easing,
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
  hover?: boolean;
  isTired?: boolean;
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
  hover = true,
  isTired = false,
  onPress,
  style,
  imageStyle,
  testID = 'weather-character',
}) => {
  // Resolve character state deterministically
  const resolvedState = useMemo<ResolvedCharacterState>(() => {
    // If an explicit targetState is given (e.g. matching message/tip), prioritize it
    if (state) {
      const config = WEATHER_CHARACTER_CONFIGS[state] || WEATHER_CHARACTER_CONFIGS.sunny;
      const assetMeta = WEATHER_CHARACTER_ASSETS[state] || WEATHER_CHARACTER_ASSETS.sunny;

      return {
        assetKey: assetMeta.fileName,
        asset: assetMeta.source,
        assetMeta,
        state,
        mood: config.mood,
        message: explicitResolved?.message || config.defaultMessage,
        tip: explicitResolved?.tip || config.defaultTip,
        haptic: config.haptic,
        accessibilityLabel: config.accessibilityLabel,
        priority: config.priority,
        timeOfDay: explicitResolved?.timeOfDay || 'morning',
      };
    }

    if (explicitResolved) return explicitResolved;

    if (context) {
      return WeatherCharacterEngine.resolve(context);
    }

    const defaultState: CharacterState = 'sunny';
    const config = WEATHER_CHARACTER_CONFIGS[defaultState];
    const assetMeta = WEATHER_CHARACTER_ASSETS[defaultState];

    return {
      assetKey: assetMeta.fileName,
      asset: assetMeta.source,
      assetMeta,
      state: defaultState,
      mood: config.mood,
      message: config.defaultMessage,
      tip: config.defaultTip,
      haptic: config.haptic,
      accessibilityLabel: config.accessibilityLabel,
      priority: config.priority,
      timeOfDay: 'morning',
    };
  }, [context, state, explicitResolved]);

  // Animation values: scale for press/hover, translateY for buoyant hover floating, rotate for tired wobble
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // 1. Buoyant idle hover/floating animation (smooth sinusoidal bobbing)
  useEffect(() => {
    if (hover) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, {
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      );
    } else {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [hover]);

  // 2. Tired wobble animation when frequent rapid tapping occurs
  useEffect(() => {
    if (isTired) {
      rotate.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-3, { duration: 60 }),
        withTiming(0, { duration: 80 })
      );
      scale.value = withSequence(
        withTiming(0.92, { duration: 90 }),
        withSpring(0.96, { damping: 10, stiffness: 180 })
      );
    } else {
      rotate.value = withTiming(0, { duration: 150 });
      scale.value = withSpring(1.0, { damping: 12, stiffness: 220 });
    }
  }, [isTired]);

  // 3. Playful spring bounce when character state/outfit changes according to message
  const previousStateRef = React.useRef<CharacterState | null>(null);
  useEffect(() => {
    if (previousStateRef.current && previousStateRef.current !== resolvedState.state) {
      scale.value = withSequence(
        withSpring(0.86, { damping: 10, stiffness: 240 }),
        withSpring(1.0, { damping: 12, stiffness: 190 })
      );
    }
    previousStateRef.current = resolvedState.state;
  }, [resolvedState.state]);

  const animatedTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePress = useCallback(() => {
    // Trigger native haptic feedback
    hapticManager.impact(isTired ? 'heavy' : resolvedState.haptic);

    // Subtle press spring/timing sequence
    scale.value = withSequence(
      withTiming(0.94, { duration: 90 }),
      withTiming(1.02, { duration: 110 }),
      withSpring(1.0, { damping: 12, stiffness: 240 })
    );

    // User callback
    onPress?.();
  }, [resolvedState.haptic, isTired, onPress]);

  // Web/desktop mouse hover handling
  const handleHoverIn = useCallback(() => {
    if (!isTired) {
      scale.value = withSpring(1.05, { damping: 14, stiffness: 200 });
    }
  }, [isTired]);

  const handleHoverOut = useCallback(() => {
    if (!isTired) {
      scale.value = withSpring(1.0, { damping: 14, stiffness: 200 });
    }
  }, [isTired]);

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
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
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
