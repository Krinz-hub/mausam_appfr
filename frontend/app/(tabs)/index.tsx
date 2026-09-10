import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
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
  Text,
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { normalizeToWeatherContext } from '../../src/services/weather/normalizer';
import { WeatherCharacterEngine, getCharacterStateForMessage, CharacterState as EngineCharacterState } from '../../src/engines/weather';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useDecisionStore } from '../../src/state/useDecisionStore';
import { useLocationStore } from '../../src/state/useLocationStore';
import { CharacterState } from '../../src/components/character/Character';
import { FeedbackReason } from '../../src/components/insights/FeedbackModal';
import { audioManager } from '../../src/services/audio/audioManager';
import { hapticManager } from '../../src/services/haptics/hapticManager';

const TIRED_PHRASES: Array<{ message: string; tip?: string; characterState?: EngineCharacterState }> = [
  {
    message: 'Stop, I am tired! Give me some rest 😴',
    tip: 'Phew! Too many taps too fast. Give me a second to catch my breath! 😮‍💨',
    characterState: 'fog',
  },
  {
    message: 'Whoa there, slow down! 😵‍💫',
    tip: 'My cloud brain is spinning! Take a breather and tap gently.',
    characterState: 'lightning',
  },
  {
    message: 'Zzz... taking a mini recharge nap! 💤',
    tip: 'Give me a couple seconds of rest and I will be back with more insights.',
    characterState: 'fog',
  },
];

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
  const [isTired, setIsTired] = useState<boolean>(false);
  const [tiredIndex, setTiredIndex] = useState<number>(0);

  const tapTimestampsRef = useRef<number[]>([]);
  const resetTiredTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize precise GPS location on screen mount
  useEffect(() => {
    initLocation();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (resetTiredTimerRef.current) {
        clearTimeout(resetTiredTimerRef.current);
      }
    };
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

  // Construct a diverse pool of weather & personalized insights to cycle through
  const suggestions = useMemo<Array<{ message: string; tip?: string; characterState?: EngineCharacterState }>>(() => {
    const list: Array<{ message: string; tip?: string; characterState?: EngineCharacterState }> = [];

    // 1. Primary character reaction for current conditions
    if (characterResolution) {
      list.push({
        message: characterResolution.message,
        tip: characterResolution.tip,
        characterState: characterResolution.state,
      });
    }

    // 2. Primary personalized insight from DecisionEngine
    if (experience?.primaryInsight) {
      list.push({
        message: experience.primaryInsight.title,
        tip: experience.primaryInsight.shortMessage,
        characterState: getCharacterStateForMessage(
          experience.primaryInsight.title,
          experience.primaryInsight.shortMessage,
          characterResolution?.state || 'sunny'
        ),
      });
    }

    // 3. Secondary cards from DecisionEngine
    if (experience?.cards && experience.cards.length > 0) {
      for (const card of experience.cards) {
        list.push({
          message: card.title,
          tip: card.shortMessage,
          characterState: getCharacterStateForMessage(
            card.title,
            card.shortMessage,
            characterResolution?.state || 'sunny'
          ),
        });
      }
    }

    // 4. Contextual tips based on live weather readings
    if (weather) {
      const cur = weather.current;

      // Rain probability / umbrella
      if (cur.rainProbability !== undefined && cur.rainProbability >= 25) {
        list.push({
          message: 'Umbrella Advisory ☔',
          tip: `Rain chance is around ${cur.rainProbability}%. Keep rain gear handy just in case!`,
          characterState: 'rain',
        });
      }

      // UV index advice
      if (cur.uvIndex !== undefined && cur.uvIndex >= 5) {
        list.push({
          message: 'High UV Alert ☀️',
          tip: `UV index reaches ${cur.uvIndex}. Wear SPF 30+ sunscreen and sunglasses today.`,
          characterState: 'bright_sun',
        });
      }

      // High heat or cold advice
      if (cur.feelsLike !== undefined && cur.feelsLike >= 30) {
        list.push({
          message: 'Beat The Heat 💧',
          tip: `Feels like ${Math.round(cur.feelsLike)}°! Stay well-hydrated and seek shaded spots outdoors.`,
          characterState: 'extreme_heat',
        });
      } else if (cur.temperature <= 16) {
        list.push({
          message: 'Crisp Weather 🧣',
          tip: `Chilly ${Math.round(cur.temperature)}° air. Dress warmly in comfortable breathable layers.`,
          characterState: 'extreme_cold',
        });
      }

      // Wind advice
      if (cur.windSpeed !== undefined && cur.windSpeed >= 20) {
        list.push({
          message: 'Breezy Outlook 💨',
          tip: `Winds active around ${Math.round(cur.windSpeed)} km/h. Watch out for sudden gusts.`,
          characterState: 'windy',
        });
      }

      // Air Quality
      if (cur.aqi !== undefined && cur.aqi >= 80) {
        list.push({
          message: 'Air Quality Check 🌫️',
          tip: `AQI is ${cur.aqi}. Sensitive groups should keep strenuous outdoor exercise light.`,
          characterState: 'bad_air_quality',
        });
      } else if (cur.aqi !== undefined && cur.aqi <= 40) {
        list.push({
          message: 'Crisp & Clean Air 🌿',
          tip: `AQI is ${cur.aqi} — great atmospheric clarity for walking and outdoor workouts.`,
          characterState: 'rainbow',
        });
      }
    }

    // 5. Friendly companion tip
    list.push({
      message: 'Always Keeping Watch 🌤️',
      tip: 'Tap the bubble anytime to cycle through your atmospheric intelligence!',
      characterState: characterResolution?.state || 'sunny',
    });

    // Fallback if list is empty
    if (list.length === 0) {
      list.push({
        message: 'Looking good out there!',
        tip: 'Enjoy your day and check back for live weather updates.',
        characterState: 'sunny',
      });
    }

    return list;
  }, [characterResolution, experience, weather]);

  const handleCharacterTap = () => {
    const now = Date.now();

    // Reset/extend the recovery cooldown timer whenever tapped
    if (resetTiredTimerRef.current) {
      clearTimeout(resetTiredTimerRef.current);
    }

    // Automatically recover after 2.8 seconds of resting (no taps)
    resetTiredTimerRef.current = setTimeout(() => {
      setIsTired(false);
      setTiredIndex(0);
      tapTimestampsRef.current = [];
    }, 2800);

    // Keep only taps within the last 1400ms window
    const recentTaps = tapTimestampsRef.current.filter((t) => now - t < 1400);
    recentTaps.push(now);
    tapTimestampsRef.current = recentTaps;

    // Frequent rapid tap detection:
    // Requires at least 4 taps within 1400ms AND the gap from the previous tap is < 450ms
    const isRapid =
      recentTaps.length >= 4 &&
      recentTaps.length >= 2 &&
      now - recentTaps[recentTaps.length - 2] < 450;

    if (isRapid || isTired) {
      setIsTired(true);
      setTiredIndex((prev) => (prev + 1) % TIRED_PHRASES.length);
      hapticManager.notification('warning');
      audioManager.play('selection');
      return;
    }

    // Normal tap: cycle through suggestions smoothly!
    if (characterResolution) {
      hapticManager.impact(characterResolution.haptic);
    } else {
      hapticManager.impact('light');
    }
    audioManager.play('selection');
    setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
  };

  const currentSuggestion = isTired
    ? TIRED_PHRASES[tiredIndex % TIRED_PHRASES.length]
    : suggestions[suggestionIndex % suggestions.length];

  const activeCharacterState = useMemo<EngineCharacterState>(() => {
    if (currentSuggestion?.characterState) {
      return currentSuggestion.characterState;
    }
    if (currentSuggestion?.message) {
      return getCharacterStateForMessage(
        currentSuggestion.message,
        currentSuggestion.tip,
        characterResolution?.state || 'sunny'
      );
    }
    return characterResolution?.state || 'sunny';
  }, [currentSuggestion, characterResolution?.state]);

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
              state={activeCharacterState}
              resolved={characterResolution}
              hover={true}
              isTired={isTired}
              onPress={handleCharacterTap}
            />

            <CharacterBubble
              message={currentSuggestion.message}
              tip={currentSuggestion.tip}
              onPress={handleCharacterTap}
              pointerPosition="above"
              isTired={isTired}
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
