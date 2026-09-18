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
  AstronomicalInsightCard,
  SwipeableInsightsCarousel,
  SuggestionInsightItem,
  Character,
  WeatherCharacter,
  FeedbackModal,
  LoadingState,
  ErrorState,
  LocationModal,
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
  const resetTiredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Memoize fallback data so placeholderData preserves reference stability across renders
  const fallbackWeather = useMemo(
    () => WeatherProvider.getFallbackData(location.name, location.latitude, location.longitude),
    [location.name, location.latitude, location.longitude]
  );

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
    placeholderData: fallbackWeather,
    enabled: !!location.latitude && !!location.longitude,
  });

  useEffect(() => {
    if (weather) {
      computeDecision(weather);
    }
  }, [weather, persona, computeDecision]);

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

  // Construct suggestions pool from engine experience with character live reaction prepend
  const suggestions = useMemo<SuggestionInsightItem[]>(() => {
    const list: SuggestionInsightItem[] = [];

    // 1. Companion character's immediate live reaction for current atmospheric conditions
    if (characterResolution) {
      const state = getCharacterStateForMessage(
        characterResolution.message,
        characterResolution.tip,
        characterResolution.state
      );
      list.push({
        id: 'char_status',
        type: 'now',
        message: characterResolution.message,
        tip: characterResolution.tip,
        characterState: state,
        badge: 'Live Reaction',
        isPrimary: !experience?.primaryInsight,
      });
    }

    // 2. Engine-provided structured suggestions (primary, astronomical insight, secondary cards, contextual alerts)
    if (experience?.suggestions && experience.suggestions.length > 0) {
      list.push(...experience.suggestions);
    } else if (experience?.primaryInsight) {
      list.push({
        id: 'primary_decision',
        type: experience.primaryInsight.type,
        message: experience.primaryInsight.title,
        tip: experience.primaryInsight.shortMessage,
        characterState: (experience.primaryInsight.characterState as EngineCharacterState) || 'sunny',
        badge: 'Primary Intelligence',
        isPrimary: true,
      });
    }

    return list;
  }, [characterResolution, experience]);

  const handleNextSuggestion = () => {
    if (suggestions.length === 0) return;
    hapticManager.selection();
    audioManager.play('selection');
    setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
  };

  const handlePrevSuggestion = () => {
    if (suggestions.length === 0) return;
    hapticManager.selection();
    audioManager.play('selection');
    setSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
  };

  const handleSelectSuggestionIndex = (index: number) => {
    setSuggestionIndex(index);
  };

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
    if (isTired) {
      return TIRED_PHRASES[tiredIndex % TIRED_PHRASES.length].characterState || 'fog';
    }
    if (currentSuggestion?.characterState) {
      return currentSuggestion.characterState;
    }
    if (currentSuggestion?.message) {
      return getCharacterStateForMessage(
        currentSuggestion.message,
        currentSuggestion.tip,
        'sunny'
      );
    }
    return characterResolution?.state || 'sunny';
  }, [isTired, tiredIndex, currentSuggestion, characterResolution?.state]);

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
        <LoadingState message="Connecting to atmospheric intelligence..." />
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
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      contentContainerStyle={{ paddingBottom: 16 }}
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
            hover={true}
            isTired={isTired}
            onPress={handleCharacterTap}
          />
        </View>
      )}

      {/* 3. Main Suggestion Insights Carousel (Swipeable Left & Right to Shuffle) */}
      {suggestions.length > 0 && (
        <View style={styles.primaryInsightContainer}>
          <SwipeableInsightsCarousel
            items={suggestions}
            activeIndex={suggestionIndex % suggestions.length}
            onIndexChange={handleSelectSuggestionIndex}
          />
        </View>
      )}

        {/* Conditional Engine-Approved Astronomical Insight Card */}
        {experience?.astronomicalInsight && (
          <View style={styles.astronomicalContainer}>
            <AstronomicalInsightCard insight={experience.astronomicalInsight} />
          </View>
        )}

        {/* 4. Small Supporting Information (Today's Flow) */}
        <View style={styles.supportingSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#FF5533', fontSize: 10, marginRight: 6 }}>●</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.isNight ? '#FFFDF7' : '#171717',
                    fontSize: 12,
                    fontWeight: '800',
                    letterSpacing: 0.8,
                  },
                ]}
              >
                TODAY'S FLOW
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/forecast')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="View detailed hourly timeline"
            >
              <Text
                style={[
                  styles.viewMoreText,
                  {
                    color: '#FF5533',
                    fontSize: 12,
                    fontWeight: '800',
                  },
                ]}
              >
                Timeline →
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
                <View key={idx} style={styles.miniCardWrapper}>
                  <View
                    style={[
                      styles.miniCardUnderlay,
                      { backgroundColor: theme.isNight ? '#000000' : '#171717' },
                    ]}
                  />
                  <View
                    style={[
                      styles.miniHourlyCard,
                      {
                        backgroundColor: isCurrentHour
                          ? '#FFB21A'
                          : theme.isNight
                          ? '#242424'
                          : '#FFFFFF',
                        borderColor:
                          isCurrentHour || !theme.isNight ? '#171717' : '#3A3A3A',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniHourText,
                        {
                          color: isCurrentHour
                            ? '#171717'
                            : theme.isNight
                            ? '#E8E8E8'
                            : '#171717',
                          fontWeight: isCurrentHour ? '800' : '700',
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
                      size={20}
                      style={{ marginVertical: 6 }}
                    />
                    <Text
                      style={[
                        styles.miniTemp,
                        {
                          color: isCurrentHour
                            ? '#171717'
                            : theme.isNight
                            ? '#FFFDF7'
                            : '#171717',
                          fontWeight: '800',
                        },
                      ]}
                    >
                      {Math.round(h.temp)}°
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Progressive Disclosure Link to Raw Detailed Weather */}
        <View style={styles.detailLinkContainer}>
          <View
            style={[
              styles.detailUnderlay,
              { backgroundColor: theme.isNight ? '#000000' : '#171717' },
            ]}
          />
          <Pressable
            onPress={() => router.push('/details/metrics')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View detailed metrics"
            style={({ pressed }) => [
              styles.detailLinkCard,
              {
                backgroundColor: theme.isNight ? '#242424' : '#FFFFFF',
                borderColor: theme.isNight ? '#3A3A3A' : '#171717',
              },
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={{ color: '#FF5533', fontSize: 10, marginRight: 6 }}>●</Text>
                <Text
                  style={[
                    styles.detailTitle,
                    {
                      color: theme.isNight ? '#FFFDF7' : '#171717',
                      fontSize: 14,
                      fontWeight: '800',
                    },
                  ]}
                >
                  Atmospheric Diagnostics
                </Text>
              </View>
              <Text
                style={[
                  styles.detailSubtitle,
                  {
                    color: theme.isNight ? '#BFBFBF' : '#4A4A4A',
                    fontSize: 12,
                    fontWeight: '500',
                  },
                ]}
              >
                Humidity, UV, AQI, pressure & visibility metrics
              </Text>
            </View>
            <View
              style={[
                styles.arrowBox,
                theme.isNight && { borderColor: '#FFB21A' },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#171717' }}>➔</Text>
            </View>
          </Pressable>
        </View>

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
  astronomicalContainer: {
    width: '100%',
    marginVertical: 6,
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
    flexDirection: 'row',
  },
  miniCardWrapper: {
    position: 'relative',
    marginRight: 10,
    paddingRight: 3,
    paddingBottom: 3,
  },
  miniCardUnderlay: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  miniHourlyCard: {
    width: 72,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#171717',
  },
  miniHourText: {
    fontSize: 12,
    marginBottom: 2,
  },
  miniTemp: {
    fontSize: 15,
    marginTop: 2,
  },
  detailLinkContainer: {
    position: 'relative',
    marginTop: 24,
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  detailUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  detailLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 12,
  },
  detailTitle: {
    marginBottom: 2,
  },
  detailSubtitle: {},
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFB21A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
