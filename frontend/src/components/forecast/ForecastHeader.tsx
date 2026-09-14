import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { FloatingSettingsButton } from './FloatingSettingsButton';

export interface ForecastHeaderProps {
  locationName: string;
  onPressSettings: () => void;
}

export const ForecastHeader: React.FC<ForecastHeaderProps> = ({
  locationName,
  onPressSettings,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontWeight: theme.typography.weights.heavy,
            },
          ]}
        >
          Forecast
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontWeight: theme.typography.weights.medium,
            },
          ]}
        >
          Hourly timeline & personalized week ahead • {locationName}
        </Text>
      </View>

      <View style={styles.buttonWrapper}>
        <FloatingSettingsButton onPress={onPressSettings} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 14,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  buttonWrapper: {
    paddingTop: 4,
  },
});
