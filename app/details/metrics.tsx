import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import { AppScreen, Character } from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { useLocationStore } from '../../src/state/useLocationStore';

export default function DetailedMetricsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const location = useLocationStore((s) => s.location);

  const { data: weather } = useQuery({
    queryKey: ['weather', location.latitude, location.longitude],
    queryFn: () => WeatherProvider.fetchWeather(location),
    enabled: !!location.latitude && !!location.longitude,
  });

  const current = weather?.current;

  return (
    <AppScreen scrollable={true} edges={['top', 'bottom']}>
      {/* Header with Close */}
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.title2,
                fontWeight: theme.typography.weights.heavy,
              },
            ]}
          >
            Atmospheric Diagnostics
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {weather?.locationName || location.name} • Complete Telemetry
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close detailed view"
          style={[styles.closeBtn, { backgroundColor: theme.colors.backgroundCardMuted }]}
        >
          <Text style={[styles.closeBtnText, { color: theme.colors.textPrimary }]}>✕</Text>
        </Pressable>
      </View>

      {/* Hero Mini Banner */}
      <View
        style={[
          styles.heroBanner,
          {
            backgroundColor: theme.colors.primaryLight,
            borderRadius: theme.radius.cardLarge,
            borderColor: theme.colors.borderSelected,
          },
        ]}
      >
        <Character state="happy" size="md" />
        <View style={{ marginLeft: 16 }}>
          <Text style={[styles.heroTemp, { color: theme.colors.textPrimary }]}>
            {Math.round(current?.temperature ?? 28)}°
          </Text>
          <Text style={[styles.heroFeelsLike, { color: theme.colors.textSecondary }]}>
            Feels like {Math.round(current?.feelsLike ?? 31)}° • {current?.conditionText}
          </Text>
        </View>
      </View>

      {/* Clean Spacious 2-Column Metric Grid */}
      <View style={styles.metricGrid}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.borderLight,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          <Text style={styles.metricIcon}>💧</Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Humidity
          </Text>
          <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
            {current?.humidity ?? 60}%
          </Text>
          <Text style={[styles.metricNote, { color: theme.colors.textMuted }]}>
            {(current?.humidity ?? 60) > 70 ? 'Muggy' : 'Comfortable moisture'}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.borderLight,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          <Text style={styles.metricIcon}>💨</Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Wind Speed
          </Text>
          <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
            {Math.round(current?.windSpeed ?? 12)} km/h
          </Text>
          <Text style={[styles.metricNote, { color: theme.colors.textMuted }]}>
            Light to gentle breeze
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.borderLight,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          <Text style={styles.metricIcon}>☀️</Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            UV Index
          </Text>
          <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
            {current?.uvIndex ?? 6} / 12
          </Text>
          <Text style={[styles.metricNote, { color: theme.colors.weatherUV }]}>
            {(current?.uvIndex ?? 6) >= 6 ? 'High solar exposure' : 'Moderate'}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.borderLight,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          <Text style={styles.metricIcon}>🌫️</Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Air Quality (AQI)
          </Text>
          <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
            {current?.aqi ?? 48}
          </Text>
          <Text style={[styles.metricNote, { color: theme.colors.success }]}>
            Satisfactory & breathable
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.borderLight,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          <Text style={styles.metricIcon}>👁️</Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Visibility
          </Text>
          <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
            {current?.visibility ?? 10} km
          </Text>
          <Text style={[styles.metricNote, { color: theme.colors.textMuted }]}>
            Clear road visibility
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.borderLight,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          <Text style={styles.metricIcon}>⏲️</Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Atmospheric Pressure
          </Text>
          <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
            1012 hPa
          </Text>
          <Text style={[styles.metricNote, { color: theme.colors.textMuted }]}>
            Normal barometric pressure
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginVertical: 14,
    borderWidth: 1.5,
  },
  heroTemp: {
    fontSize: 32,
    fontWeight: '800',
  },
  heroFeelsLike: {
    fontSize: 13,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 4,
  },
  metricNote: {
    fontSize: 11,
    fontWeight: '600',
  },
});
