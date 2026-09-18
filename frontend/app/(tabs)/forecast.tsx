import React, { useState, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import {
  AppScreen,
  Character,
  LoadingState,
  ErrorState,
  Text,
  ForecastHeader,
  ForecastMetricSelector,
  ComfortWindowCard,
  HourlyConditions,
  CurrentOutlookCard,
  WeeklyOutlook,
  FactorTab,
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useLocationStore } from '../../src/state/useLocationStore';
import {
  findBestRunningWindow,
  findOutdoorComfortWindow,
} from '../../src/engine/decision/activityCalculators';

export default function ForecastScreen() {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const persona = useOnboardingStore((s) => s.personaProfile);
  const location = useLocationStore((s) => s.location);
  const [selectedFactor, setSelectedFactor] = useState<FactorTab>('rain');
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  const fallbackWeather = useMemo(
    () => WeatherProvider.getFallbackData(location.name, location.latitude, location.longitude),
    [location.name, location.latitude, location.longitude]
  );

  const {
    data: weather,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['weather', location.latitude, location.longitude],
    queryFn: () => WeatherProvider.fetchWeather(location),
    placeholderData: fallbackWeather,
    enabled: !!location.latitude && !!location.longitude,
  });

  if (isError && !weather) {
    return (
      <AppScreen scrollable={false}>
        <ErrorState onRetry={refetch} />
      </AppScreen>
    );
  }

  if (!weather) {
    return (
      <AppScreen scrollable={false}>
        <LoadingState message="Calculating 24-hour timeline and personalized weekly outlook..." />
      </AppScreen>
    );
  }

  const runningWindow = findBestRunningWindow(weather.hourly);
  const comfortWindow = findOutdoorComfortWindow(weather.hourly);
  const bestWindow = persona?.activities['fitness'] ? runningWindow : comfortWindow;
  const isFitness = !!persona?.activities['fitness'];

  const selectedHour = weather.hourly[selectedHourIndex] || weather.hourly[0];
  const isCurrentHour = selectedHourIndex === 0;

  // Responsive horizontal padding based on viewport
  const horizontalPadding = windowWidth > 600 ? 28 : theme.spacing.screenHorizontal;

  return (
    <AppScreen
      scrollable={true}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: horizontalPadding },
      ]}
    >
      {/* 1. Header with date & location context */}
      <ForecastHeader locationName={weather.locationName} />

      {/* 2. Weather Advisory & Optimal Comfort Window */}
      <ComfortWindowCard
        windowData={bestWindow}
        isFitnessPersona={isFitness}
      />

      {/* 3. Hourly Forecast Carousel */}
      <HourlyConditions
        hourly={weather.hourly}
        selectedHourIndex={selectedHourIndex}
        onSelectHour={setSelectedHourIndex}
        sunrise={weather.current.sunrise}
        sunset={weather.current.sunset}
      />

      {/* 4. Metric tabs for detailed condition analysis */}
      <ForecastMetricSelector
        selectedFactor={selectedFactor}
        onSelectFactor={setSelectedFactor}
      />

      {/* 5. Detailed outlook & chart for selected hour & factor */}
      <CurrentOutlookCard
        selectedHour={selectedHour}
        isCurrentHour={isCurrentHour}
        selectedFactor={selectedFactor}
      />

      {/* 6. 7-Day Personalized Outlook */}
      <WeeklyOutlook
        daily={weather.daily}
        persona={persona}
        aqi={weather.current.aqi}
      />

      {/* 7. Character Companion Note */}
      <View style={styles.characterNoteWrapper}>
        <View style={[styles.characterNoteUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
        <View style={[styles.characterNoteCard, theme.isNight && { backgroundColor: '#2E2416', borderColor: '#3A3A3A' }]}>
          <Character state="happy" size={36} />
          <Text style={[styles.characterNoteText, theme.isNight && { color: '#FFFDF7' }]}>
            I'll keep monitoring atmospheric shifts across the week for you.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  characterNoteWrapper: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 20,
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  characterNoteUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  characterNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFF7DE',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  characterNoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#171717',
    lineHeight: 16,
    marginLeft: 10,
    flex: 1,
  },
});
