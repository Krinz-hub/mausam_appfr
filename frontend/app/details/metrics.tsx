import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import { AppScreen, Character, Text } from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { useLocationStore } from '../../src/state/useLocationStore';
import { audioManager } from '../../src/services/audio/audioManager';
import { hapticManager } from '../../src/services/haptics/hapticManager';

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

  const handleClose = () => {
    audioManager.play('selection');
    hapticManager.impact('light');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <AppScreen scrollable={true} edges={['top', 'bottom']}>
      {/* Header with Close */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeDot}>●</Text>
            <Text style={styles.badgeLabel}>TELEMETRY STREAM</Text>
          </View>
          <Text style={styles.title}>
            Atmospheric Diagnostics
          </Text>
          <Text style={styles.subtitle}>
            {weather?.locationName || location.name} • Complete Sensor Grid
          </Text>
        </View>

        <Pressable
          onPress={handleClose}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close detailed view"
          style={({ pressed }) => [
            styles.closeBtn,
            pressed && styles.closeBtnPressed,
          ]}
        >
          <Ionicons name="close" size={18} color="#171717" />
        </Pressable>
      </View>

      {/* Hero Mini Banner with Character */}
      <View style={styles.bannerWrapper}>
        <View style={styles.bannerUnderlay} />
        <View style={styles.heroBanner}>
          <View style={styles.charBox}>
            <Character state="happy" size="md" />
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.heroTemp}>
              {Math.round(current?.temperature ?? 28)}°
            </Text>
            <Text style={styles.heroFeelsLike}>
              Feels like {Math.round(current?.feelsLike ?? 31)}° • {current?.conditionText}
            </Text>
          </View>
        </View>
      </View>

      {/* Clean 2-Column Neo-Brutalist Metric Grid */}
      <View style={styles.metricGrid}>
        {/* Humidity */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardUnderlay} />
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EBF3FF' }]}>
              <Ionicons name="water-outline" size={20} color="#171717" />
            </View>
            <Text style={styles.metricLabel}>HUMIDITY</Text>
            <Text style={styles.metricVal}>{current?.humidity ?? 60}%</Text>
            <Text style={styles.metricNote}>
              {(current?.humidity ?? 60) > 70 ? 'Muggy moisture' : 'Comfortable'}
            </Text>
          </View>
        </View>

        {/* Wind Speed */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardUnderlay} />
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EAF4EC' }]}>
              <Ionicons name="speedometer-outline" size={20} color="#171717" />
            </View>
            <Text style={styles.metricLabel}>WIND SPEED</Text>
            <Text style={styles.metricVal}>{Math.round(current?.windSpeed ?? 12)} km/h</Text>
            <Text style={styles.metricNote}>Gentle breeze</Text>
          </View>
        </View>

        {/* UV Index */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardUnderlay} />
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF6E0' }]}>
              <Ionicons name="sunny-outline" size={20} color="#171717" />
            </View>
            <Text style={styles.metricLabel}>UV INDEX</Text>
            <Text style={styles.metricVal}>{current?.uvIndex ?? 6} / 12</Text>
            <Text style={styles.metricNote}>
              {(current?.uvIndex ?? 6) >= 6 ? 'High solar exposure' : 'Moderate'}
            </Text>
          </View>
        </View>

        {/* Air Quality */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardUnderlay} />
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EAF4EC' }]}>
              <Ionicons name="leaf-outline" size={20} color="#171717" />
            </View>
            <Text style={styles.metricLabel}>AIR QUALITY (AQI)</Text>
            <Text style={styles.metricVal}>{current?.aqi ?? 48}</Text>
            <Text style={styles.metricNote}>Satisfactory & breathable</Text>
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardUnderlay} />
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEBE6' }]}>
              <Ionicons name="eye-outline" size={20} color="#171717" />
            </View>
            <Text style={styles.metricLabel}>VISIBILITY</Text>
            <Text style={styles.metricVal}>{current?.visibility ?? 10} km</Text>
            <Text style={styles.metricNote}>Clear road vision</Text>
          </View>
        </View>

        {/* Atmospheric Pressure */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardUnderlay} />
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#F7F4EB' }]}>
              <Ionicons name="compass-outline" size={20} color="#171717" />
            </View>
            <Text style={styles.metricLabel}>PRESSURE</Text>
            <Text style={styles.metricVal}>1012 hPa</Text>
            <Text style={styles.metricNote}>Normal barometric</Text>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  headerBadge: {
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
    fontSize: 24,
    fontWeight: '800',
    color: '#171717',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '2px 2px 0px #171717' } as any)
      : {
          shadowColor: '#171717',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }),
  },
  closeBtnPressed: {
    transform: [{ translateX: 1.5 }, { translateY: 1.5 }],
  },
  bannerWrapper: {
    position: 'relative',
    marginVertical: 12,
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  bannerUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF0D4',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 12,
  },
  charBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTemp: {
    fontSize: 34,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: -1,
  },
  heroFeelsLike: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '600',
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cardWrapper: {
    position: 'relative',
    width: '48%',
    marginBottom: 14,
    paddingRight: 3,
    paddingBottom: 3,
  },
  cardUnderlay: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 10,
    padding: 14,
    minHeight: 130,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#171717',
    marginBottom: 4,
  },
  metricNote: {
    fontSize: 11,
    color: '#4A4A4A',
    fontWeight: '500',
  },
});
