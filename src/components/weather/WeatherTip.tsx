import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';

export interface WeatherTipProps {
  tip: string;
  category?: 'caution' | 'general' | 'positive';
  style?: ViewStyle;
  testID?: string;
}

export const WeatherTip: React.FC<WeatherTipProps> = ({
  tip,
  category = 'general',
  style,
  testID = 'weather-tip',
}) => {
  const theme = useTheme();

  const iconName: keyof typeof Ionicons.glyphMap =
    category === 'caution'
      ? 'shield-checkmark-outline'
      : category === 'positive'
      ? 'sunny-outline'
      : 'information-circle-outline';

  const iconColor =
    category === 'caution'
      ? theme.colors.warning
      : category === 'positive'
      ? theme.colors.success
      : theme.colors.primary;

  const bgColor = theme.isNight
    ? 'rgba(21, 52, 73, 0.75)'
    : theme.colors.surfaceSecondary;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor: theme.isNight
            ? 'rgba(255, 255, 255, 0.1)'
            : theme.colors.borderLight,
        },
        style,
      ]}
    >
      <Ionicons
        name={iconName}
        size={16}
        color={iconColor}
        style={{ marginRight: 8, marginTop: 1 }}
      />
      <Text
        style={[
          styles.text,
          {
            color: theme.isNight ? '#F3FAFF' : theme.colors.textPrimary,
          },
        ]}
      >
        {tip}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
    maxWidth: 360,
    alignSelf: 'center',
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
