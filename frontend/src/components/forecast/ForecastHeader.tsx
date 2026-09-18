import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
export interface ForecastHeaderProps {
  locationName: string;
  onPressSettings?: () => void;
}

export const ForecastHeader: React.FC<ForecastHeaderProps> = ({
  locationName,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeDot}>●</Text>
          <Text
            style={[
              styles.badgeLabel,
              { color: theme.isNight ? '#BFBFBF' : '#525252' },
            ]}
          >
            OUTLOOK & TIMELINE
          </Text>
        </View>

        <Text
          style={[
            styles.title,
            { color: theme.isNight ? '#FFFDF7' : '#171717' },
          ]}
        >
          Forecast
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.isNight ? '#BFBFBF' : '#4A4A4A' },
          ]}
        >
          24h hourly curves & weekly intelligence • {locationName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 14,
  },
  textContainer: {
    flex: 1,
    paddingRight: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#171717',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4A4A4A',
    fontWeight: '500',
    marginTop: 2,
  },
});
