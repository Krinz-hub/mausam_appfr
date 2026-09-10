import React from 'react';
import { ViewStyle, ImageStyle } from 'react-native';
import {
  WeatherCharacter,
  WeatherCharacterProps,
} from '../weather/WeatherCharacter';
import {
  CharacterState as EngineCharacterState,
  WeatherContext,
} from '../../engines/weather/weatherCharacterTypes';
import { StageSize } from '../weather/CharacterStage';

export type LegacyCharacterState =
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

export type CharacterState = LegacyCharacterState | EngineCharacterState;

import { getCharacterStateForMessage } from '../../engines/weather/characterMessageMatcher';

export interface CharacterProps {
  state?: CharacterState;
  message?: string;
  tip?: string;
  context?: WeatherContext;
  size?: StageSize;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  animate?: boolean;
  interactive?: boolean;
  hover?: boolean;
  isTired?: boolean;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  testID?: string;
}

const LEGACY_STATE_MAPPING: Record<LegacyCharacterState, EngineCharacterState> = {
  happy: 'sunny',
  concerned: 'heavy_rain',
  energetic: 'windy',
  tired: 'fog',
  bundled: 'extreme_cold',
  sleeping: 'fog',
  thinking: 'cloudy',
  excited: 'rainbow',
  success: 'sunny',
  rain: 'rain',
  heat: 'extreme_heat',
  cold: 'extreme_cold',
  storm: 'thunderstorm',
  neutral: 'overcast',
};

export const Character: React.FC<CharacterProps> = ({
  state,
  message,
  tip,
  context,
  size = 'md',
  style,
  imageStyle,
  interactive,
  hover = true,
  isTired = false,
  onPress,
  testID = 'companion-character',
}) => {
  // Determine state from explicit state, message matching, or fallback to happy
  let resolvedStateName: CharacterState;
  if (state) {
    resolvedStateName = state;
  } else if (message) {
    resolvedStateName = getCharacterStateForMessage(message, tip, 'sunny');
  } else {
    resolvedStateName = 'happy';
  }

  // Map legacy string state or use engine state
  const mappedState: EngineCharacterState =
    resolvedStateName in LEGACY_STATE_MAPPING
      ? LEGACY_STATE_MAPPING[resolvedStateName as LegacyCharacterState]
      : (resolvedStateName as EngineCharacterState);

  return (
    <WeatherCharacter
      context={context}
      state={mappedState}
      size={size}
      interactive={interactive ?? !!onPress}
      hover={hover}
      isTired={isTired}
      onPress={onPress}
      style={style}
      imageStyle={imageStyle}
      testID={testID}
    />
  );
};
