import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import {
  AppScreen,
  WeatherHero,
  InsightCard,
  Character,
  WeatherCharacter,
  CharacterBubble,
  FeedbackModal,
  LoadingState,
  ErrorState,
  LocationModal,
  ThoughtBubble,
  WeatherIcon,
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { normalizeToWeatherContext } from '../../src/services/weather/normalizer';
import { WeatherCharacterEngine } from '../../src/engines/weather/WeatherCharacterEngine';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useDecisionStore } from '../../src/state/useDecisionStore';
import { useLocationStore } from '../../src/state/useLocationStore';
import { CharacterState } from '../../src/components/character/Character';
import { FeedbackReason } from '../../src/components/insights/FeedbackModal';
import { audioManager } from '../../src/services/audio/audioManager';
import { hapticManager } from '../../src/services/haptics/hapticManager';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const persona = useOnboardingStore((s) => s.personaProfile);
  const { experience, currentDecision, computeDecision, submitFeedback, feedbackHistory } =
    useDecisionStore();
  const { location, isLocating, initLocation } = useLocationStore();

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [activeDecisionId, setActiveDecisionId] = useState<string>('');
  const [suggestionIndex, setSuggestionIndex] = useState<number>(0);

  // Initialize precise GPS location on screen mount
  useEffect(() => {
    initLocation();
  }, []);

  // Weather Query keyed by exact coordinates
  const {
    data: weather,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['weather', location.latitude, location.longitude],
    queryFn: () => WeatherProvider.fetchWeather(location),
    enabled: !!location.latitude && !!location.longitude,
  });

  useEffect(() => {
    if (weather && persona) {
      computeDecision(weather);
    }
  }, [weather, persona]);

  const handleFeedback = (decisionId: string, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      submitFeedback(decisionId, 'positive');
    } else {
      setActiveDecisionId(decisionId);
      setFeedbackModalVisible(true);
    }
  };

  const handleReasonSubmit = (decisionId: string, reason: FeedbackReason) => {
    submitFeedback(decisionId, 'negative', reason);
  };

  const weatherContext = React.useMemo(() => {
    if (!weather) return null;
    return normalizeToWeatherContext(weather);
  }, [weather]);

  const characterResolution = React.useMemo(() => {
    if (!weatherContext) return null;
    return WeatherCharacterEngine.resolve(weatherContext);
  }, [weatherContext]);

  const handleCharacterTap = () => {
    if (characterResolution) {
      hapticManager.impact(characterResolution.haptic);
    } else {
      hapticManager.impact('light');
    }
    audioManager.play('selection');
    setSuggestionIndex((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <AppScreen scrollable={false}>
        <LoadingState message="Connecting to atmospheric intelligence..." />
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

  const greeting = `${experience?.greeting || 'Good day'}, ${user?.displayName || 'Friend'}`;
  const primaryInsight = experience?.primaryInsight;
  const decisionId = experience?.decisionId || 'dec_live';
  const feedbackStatus = feedbackHistory[decisionId]?.type;

  return (
    <AppScreen
      scrollable={true}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 1. Hero Weather (Greeting, Location, Large Temp, Feels Like, Minimal Metrics) */}
        <WeatherHero
          greeting={greeting}
          locationName={location.name || weather.locationName}
          temperature={weather.current.temperature}
          feelsLike={weather.current.feelsLike}
          conditionText={weather.current.conditionText}
          conditionEmoji={weather.current.conditionEmoji}
          humidity={weather.current.humidity}
          windSpeed={weather.current.windSpeed}
          uvIndex={weather.current.uvIndex}
          isPrecise={location.isPrecise}
          isLocating={isLocating}
          isNight={weather.current.isDay !== undefined ? !weather.current.isDay : undefined}
          sunrise={weather.current.sunrise}
          sunset={weather.current.sunset}
          onPressLocation={() => setLocationModalVisible(true)}
        />

        {/* 2. Character Anchor with Centralized Weather Reaction Engine */}
        {characterResolution && (
          <View style={styles.characterSection}>
            <WeatherCharacter
              resolved={characterResolution}
              onPress={handleCharacterTap}
            />

            <CharacterBubble
              message={characterResolution.message}
              tip={characterResolution.tip}
              onPress={handleCharacterTap}
              pointerPosition="above"
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* 3. ONE Primary Personalized Insight Card */}
        {primaryInsight && (
          <View style={styles.primaryInsightContainer}>
            <InsightCard
              isPrimary={true}
              type={primaryInsight.type}
              title={primaryInsight.title}
              shortMessage={primaryInsight.shortMessage}
            />
          </View>
        )}

        {/* 4. Small Supporting Information (Today's Flow) */}
        <View style={styles.supportingSection}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.isNight ? '#F3FAFF' : theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.headline,
                  fontWeight: theme.typography.weights.bold,
                },
              ]}
            >
              Today's Flow
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/forecast')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="View detailed hourly timeline"
            >
              <Text
                style={[
                  styles.viewMoreText,
                  {
                    color: theme.isNight ? '#35B7F2' : theme.colors.primary,
                    fontSize: theme.typography.sizes.callout,
                    fontWeight: theme.typography.weights.semibold,
                  },
                ]}
              >
                Hourly timeline →
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.miniHourlyRow}
          >
            {weather.hourly.map((h, idx) => {
              const isCurrentHour = idx === 0;
              return (
                <View
                  key={idx}
                  style={[
                    styles.miniHourlyCard,
                    {
                      backgroundColor: theme.isNight
                        ? isCurrentHour
                          ? '#153449'
                          : '#102A3B'
                        : isCurrentHour
                        ? theme.colors.surfaceSecondary
                        : theme.colors.backgroundCard,
                      borderRadius: 16,
                      borderWidth: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniHourText,
                      {
                        color: theme.isNight
                          ? isCurrentHour
                            ? '#F3FAFF'
                            : '#B9CEDA'
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {h.time}
                  </Text>
                  <WeatherIcon
                    condition={h.conditionText}
                    hour={h.hour}
                    time={h.timestamp || h.time}
                    isNight={h.isNight}
                    sunrise={weather.current.sunrise}
                    sunset={weather.current.sunset}
                    size={22}
                    style={{ marginVertical: 8 }}
                  />
                  <Text
                    style={[
                      styles.miniTemp,
                      {
                        color: theme.isNight
                          ? isCurrentHour
                            ? '#35B7F2'
                            : '#F3FAFF'
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {Math.round(h.temp)}°
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Progressive Disclosure Link to Raw Detailed Weather */}
        <View style={styles.detailLinkContainer}>
          <Pressable
            onPress={() => router.push('/details/metrics')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View detailed metrics"
            style={[
              styles.detailLinkCard,
              {
                backgroundColor: theme.colors.backgroundCardMuted,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.card,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.detailTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.body,
                    fontWeight: theme.typography.weights.semibold,
                  },
                ]}
              >
                Atmospheric Diagnostics
              </Text>
              <Text
                style={[
                  styles.detailSubtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.sizes.footnote,
                  },
                ]}
              >
                Humidity, UV, AQI, pressure & visibility metrics
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Optional Feedback Reason Modal */}
      <FeedbackModal
        visible={feedbackModalVisible}
        decisionId={activeDecisionId}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmitReason={handleReasonSubmit}
      />

      {/* Location Picker & GPS Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  characterSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  primaryInsightContainer: {
    width: '100%',
    marginVertical: 12,
  },
  supportingSection: {
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  viewMoreText: {
    paddingVertical: 4,
  },
  miniHourlyRow: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    paddingRight: 20,
    gap: 10,
  },
  miniHourlyCard: {
    width: 72,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniHourText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  miniTemp: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  detailLinkContainer: {
    marginTop: 28,
  },
  detailLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  detailTitle: {
    marginBottom: 2,
  },
  detailSubtitle: {},
  arrowIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
});
