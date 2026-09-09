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

export interface CharacterProps {
  state?: CharacterState;
  context?: WeatherContext;
  size?: StageSize;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  animate?: boolean;
  interactive?: boolean;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  testID?: string;
}

const LEGACY_STATE_MAPPING: Record<LegacyCharacterState, EngineCharacterState> = {
  happy: 'sunny',
  concerned: 'heavy_rain',
  energetic: 'windy',
  tired: 'extreme_heat',
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
  state = 'happy',
  context,
  size = 'md',
  style,
  imageStyle,
  interactive,
  onPress,
  testID = 'companion-character',
}) => {
  // Map legacy string state or use engine state
  const mappedState: EngineCharacterState =
    state in LEGACY_STATE_MAPPING
      ? LEGACY_STATE_MAPPING[state as LegacyCharacterState]
      : (state as EngineCharacterState);

  return (
    <WeatherCharacter
      context={context}
      state={mappedState}
      size={size}
      interactive={interactive ?? !!onPress}
      onPress={onPress}
      style={style}
      imageStyle={imageStyle}
      testID={testID}
    />
  );
};
