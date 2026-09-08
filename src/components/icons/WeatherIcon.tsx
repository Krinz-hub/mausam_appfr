import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveWeatherIcon } from '../../services/weather/weatherIconMapping';

export interface WeatherIconProps {
  condition?: string;
  hour?: number;
  time?: string | Date;
  isNight?: boolean;
  sunrise?: string | Date;
  sunset?: string | Date;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition = '',
  hour,
  time,
  isNight,
  sunrise,
  sunset,
  size = 20,
  color,
  style,
}) => {
  const iconInfo = resolveWeatherIcon({
    condition,
    hour,
    time,
    isNight,
    sunrise,
    sunset,
    color,
  });

  return (
    <View style={style}>
      <Ionicons name={iconInfo.name} size={size} color={color || iconInfo.color} />
    </View>
  );
};

