import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
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
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: horizontalPadding },
      ]}
    >
      {/* 1. Header with large typography & non-overlapping settings button */}
      <ForecastHeader
        locationName={weather.locationName}
        onPressSettings={() => router.push('/(tabs)/profile')}
      />

      {/* 2. Horizontally scrollable capsule metric pills */}
      <ForecastMetricSelector
        selectedFactor={selectedFactor}
        onSelectFactor={setSelectedFactor}
      />

      {/* 3. Optimal Comfort Window dynamic insight card */}
      <ComfortWindowCard
        windowData={bestWindow}
        isFitnessPersona={isFitness}
      />

      {/* 4. Horizontal scrolling Hourly Conditions carousel */}
      <HourlyConditions
        hourly={weather.hourly}
        selectedHourIndex={selectedHourIndex}
        onSelectHour={setSelectedHourIndex}
        sunrise={weather.current.sunrise}
        sunset={weather.current.sunset}
      />

      {/* 5. Large Outlook Card responding to selected hour & metric */}
      <CurrentOutlookCard
        selectedHour={selectedHour}
        isCurrentHour={isCurrentHour}
        selectedFactor={selectedFactor}
      />

      {/* 6. 7-Day Personalized Outlook with condition-driven recommendations */}
      <WeeklyOutlook
        daily={weather.daily}
        persona={persona}
        aqi={weather.current.aqi}
      />

      {/* 7. Character Companion Note above safe area inset */}
      <View
        style={[
          styles.characterNoteCard,
          {
            backgroundColor: theme.colors.backgroundCard,
            shadowColor: theme.colors.textPrimary,
          },
        ]}
      >
        <Character state="happy" size={38} />
        <Text
          style={[
            styles.characterNoteText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.footnote,
              fontWeight: theme.typography.weights.medium,
            },
          ]}
        >
          I'll keep monitoring changes throughout the week for you.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 60,
  },
  characterNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  characterNoteText: {
    lineHeight: 16,
    marginLeft: 10,
    flex: 1,
  },
});
