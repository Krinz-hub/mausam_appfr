import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import {
  AppScreen,
  AnimatedBar,
  Character,
  LoadingState,
  ErrorState,
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { audioManager } from '../../src/services/audio/audioManager';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useLocationStore } from '../../src/state/useLocationStore';

type FactorTab = 'rain' | 'temp' | 'wind' | 'uv';

export default function ForecastScreen() {
  const theme = useTheme();
  const persona = useOnboardingStore((s) => s.personaProfile);
  const location = useLocationStore((s) => s.location);
  const [selectedFactor, setSelectedFactor] = useState<FactorTab>('rain');
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  const {
    data: weather,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['weather', 'forecast', location.latitude, location.longitude],
    queryFn: () => WeatherProvider.fetchWeather(location),
    enabled: !!location.latitude && !!location.longitude,
  });

  if (isLoading) {
    return (
      <AppScreen scrollable={false}>
        <LoadingState message="Calculating 24-hour timeline and personalized weekly outlook..." />
      </AppScreen>
    );
  }

  if (isError || !weather) {
    return (
      <AppScreen scrollable={false}>
        <ErrorState onRetry={refetch} />
      </AppScreen>
    );
  }

  const selectedHour = weather.hourly[selectedHourIndex] || weather.hourly[0];

  const handleSelectFactor = (factor: FactorTab) => {
    audioManager.play('selection');
    setSelectedFactor(factor);
  };

  const handleSelectHour = (idx: number) => {
    audioManager.play('selection');
    setSelectedHourIndex(idx);
  };

  return (
    <AppScreen scrollable={true} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.title1,
              fontWeight: theme.typography.weights.heavy,
            },
          ]}
        >
          Forecast
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Hourly timeline & personalized week ahead • {weather.locationName}
        </Text>
      </View>

      {/* Factor Selector Pills */}
      <View style={styles.tabContainer}>
        {(
          [
            { id: 'rain', label: 'Rain %', icon: '🌧️' },
            { id: 'temp', label: 'Temp', icon: '🌡️' },
            { id: 'wind', label: 'Wind', icon: '💨' },
            { id: 'uv', label: 'UV Index', icon: '☀️' },
          ] as { id: FactorTab; label: string; icon: string }[]
        ).map((tab) => {
          const isSelected = selectedFactor === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handleSelectFactor(tab.id)}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Select ${tab.label}`}
              style={[
                styles.factorTab,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primaryLight
                    : theme.colors.backgroundCard,
                  borderColor: isSelected
                    ? theme.colors.borderSelected
                    : theme.colors.border,
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Text style={styles.factorTabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.factorTabLabel,
                  {
                    color: isSelected
                      ? theme.colors.primaryDark
                      : theme.colors.textSecondary,
                    fontWeight: isSelected
                      ? theme.typography.weights.bold
                      : theme.typography.weights.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 1. Horizontal Hourly Timeline */}
      <View style={styles.sectionWrapper}>
        <Text
          style={[
            styles.sectionHeading,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.headline,
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          Hourly Conditions
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyList}
        >
          {weather.hourly.map((item, index) => {
            const isSelected = selectedHourIndex === index;
            return (
              <Pressable
                key={index}
                onPress={() => handleSelectHour(index)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${item.time}, ${item.temp} degrees, ${item.conditionText}`}
                style={[
                  styles.hourCard,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.cardSelectedBg
                      : theme.colors.backgroundCard,
                    borderColor: isSelected
                      ? theme.colors.borderSelected
                      : theme.colors.border,
                    borderRadius: theme.radius.md,
                    borderWidth: isSelected ? 2 : 1,
                    transform: [{ scale: isSelected ? 1.05 : 1 }],
                    ...(isSelected ? theme.shadows.cardSelected : theme.shadows.sm),
                  },
                ]}
              >
                <Text style={[styles.hourTime, { color: theme.colors.textSecondary }]}>
                  {item.time}
                </Text>
                <Text style={styles.hourIcon}>{item.icon}</Text>
                <Text style={[styles.hourTemp, { color: theme.colors.textPrimary }]}>
                  {Math.round(item.temp)}°
                </Text>
                {item.rainProb > 0 && (
                  <Text style={[styles.hourRain, { color: theme.colors.weatherRain }]}>
                    {item.rainProb}%
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Real Animated Bar for Selected Hour */}
      <View
        style={[
          styles.expandedHourCard,
          {
            backgroundColor: theme.colors.backgroundCard,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.card,
            padding: theme.spacing.cardPadding,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View style={styles.expandedHeader}>
          <Text
            style={[
              styles.expandedTitle,
              {
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.headline,
                fontWeight: theme.typography.weights.bold,
              },
            ]}
          >
            {selectedHour.time} Outlook: {selectedHour.conditionText}
          </Text>
        </View>

        {selectedFactor === 'rain' && (
          <AnimatedBar
            label="Rain Probability"
            value={selectedHour.rainProb}
            unit="%"
            color={theme.colors.weatherRain}
          />
        )}
        {selectedFactor === 'temp' && (
          <AnimatedBar
            label={`Temperature (${Math.round(selectedHour.temp)}°C)`}
            value={Math.min(100, Math.max(0, ((selectedHour.temp - 10) / 35) * 100))}
            unit="%"
            color={theme.colors.weatherHeat}
          />
        )}
        {selectedFactor === 'wind' && (
          <AnimatedBar
            label={`Wind Speed (${Math.round(selectedHour.windSpeed)} km/h)`}
            value={Math.min(100, (selectedHour.windSpeed / 50) * 100)}
            unit="%"
            color={theme.colors.weatherWind}
          />
        )}
        {selectedFactor === 'uv' && (
          <AnimatedBar
            label={`UV Index (${selectedHour.uvIndex} / 12)`}
            value={Math.min(100, (selectedHour.uvIndex / 12) * 100)}
            unit="%"
            color={theme.colors.weatherUV}
          />
        )}
      </View>

      {/* 2. Clean Vertical 7-Day Forecast with ONE Personalized Signal */}
      <View style={styles.sectionWrapper}>
        <Text
          style={[
            styles.sectionHeading,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.headline,
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          7-Day Personalized Outlook
        </Text>

        <View style={styles.dailyContainer}>
          {weather.daily.map((day, idx) => {
            // Generate ONE personalized signal per day
            let signal = 'Comfortable day ahead';
            if (day.rainProb >= 60) {
              signal = 'Rain expected — carry an umbrella';
            } else if (day.maxTemp >= 34) {
              signal = 'Peak afternoon heat';
            } else if (persona?.activities['fitness'] && day.rainProb < 20) {
              signal = 'Ideal outdoor exercise morning';
            } else if (persona?.activities['commuter'] && day.rainProb < 30) {
              signal = 'Clear commute route';
            }

            return (
              <View
                key={idx}
                style={[
                  styles.dailyRow,
                  {
                    backgroundColor: theme.colors.backgroundCard,
                    borderColor: theme.colors.borderLight,
                    borderRadius: theme.radius.md,
                    ...theme.shadows.sm,
                  },
                ]}
              >
                <View style={styles.dailyLeft}>
                  <Text style={[styles.dailyDay, { color: theme.colors.textPrimary }]}>
                    {day.dayName}
                  </Text>
                  <Text style={styles.dailyIcon}>{day.icon}</Text>
                </View>

                <View style={styles.dailyMiddle}>
                  <Text
                    style={[
                      styles.dailySignal,
                      { color: theme.colors.primaryHover },
                    ]}
                  >
                    • {signal}
                  </Text>
                </View>

                <View style={styles.dailyRight}>
                  <Text style={[styles.dailyMin, { color: theme.colors.textMuted }]}>
                    {day.minTemp}°
                  </Text>
                  <Text style={[styles.dailySlash, { color: theme.colors.border }]}>/</Text>
                  <Text style={[styles.dailyMax, { color: theme.colors.textPrimary }]}>
                    {day.maxTemp}°
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Character Companion Note */}
      <View style={styles.characterNoteRow}>
        <Character state="happy" size="sm" />
        <Text
          style={[
            styles.characterNoteText,
            { color: theme.colors.textSecondary },
          ]}
        >
          I'll keep monitoring changes throughout the week for you.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
  },
  title: {
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  factorTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  factorTabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  factorTabLabel: {
    fontSize: 13,
  },
  sectionWrapper: {
    marginTop: 18,
  },
  sectionHeading: {
    marginBottom: 10,
  },
  hourlyList: {
    paddingVertical: 6,
    gap: 10,
  },
  hourCard: {
    width: 72,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 96,
  },
  hourTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  hourIcon: {
    fontSize: 24,
    marginVertical: 6,
  },
  hourTemp: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  hourRain: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  expandedHourCard: {
    marginTop: 14,
    borderWidth: 1.5,
  },
  expandedHeader: {
    marginBottom: 8,
  },
  expandedTitle: {
    letterSpacing: -0.2,
  },
  dailyContainer: {
    gap: 8,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
  },
  dailyDay: {
    fontSize: 14,
    fontWeight: '700',
    width: 60,
  },
  dailyIcon: {
    fontSize: 20,
  },
  dailyMiddle: {
    flex: 1,
    paddingHorizontal: 6,
  },
  dailySignal: {
    fontSize: 12,
    fontWeight: '600',
  },
  dailyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyMin: {
    fontSize: 13,
    fontWeight: '500',
  },
  dailySlash: {
    marginHorizontal: 4,
  },
  dailyMax: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  characterNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 12,
  },
  characterNoteText: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});
