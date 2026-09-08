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
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import {
  AppScreen,
  WeatherHero,
  InsightCard,
  Character,
  FeedbackModal,
  LoadingState,
  ErrorState,
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useDecisionStore } from '../../src/state/useDecisionStore';
import { CharacterState } from '../../src/components/character/Character';
import { FeedbackReason } from '../../src/components/insights/FeedbackModal';
import { audioManager } from '../../src/services/audio/audioManager';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const persona = useOnboardingStore((s) => s.personaProfile);
  const { experience, currentDecision, computeDecision, submitFeedback, feedbackHistory } =
    useDecisionStore();

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [activeDecisionId, setActiveDecisionId] = useState<string>('');
  const [characterInteraction, setCharacterInteraction] = useState<string | null>(null);

  // Weather Query
  const {
    data: weather,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['weather', 'current'],
    queryFn: () => WeatherProvider.fetchWeather(),
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

  const handleCharacterTap = () => {
    audioManager.play('selection');
    const messages = [
      "Everything looks tailored for your routine today! 🌤️",
      "I'm keeping an eye on changes in rain and heat for you! ☀️",
      "Have a wonderful and productive day ahead! ✨",
    ];
    const chosen = messages[Math.floor(Math.random() * messages.length)];
    setCharacterInteraction(chosen);
    setTimeout(() => setCharacterInteraction(null), 4000);
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
  const charState = (experience?.characterState || 'happy') as CharacterState;
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
        {/* 1. Hero Weather (Greeting, Location, Large Temp, Feels Like) */}
        <WeatherHero
          greeting={greeting}
          locationName={weather.locationName}
          temperature={weather.current.temperature}
          feelsLike={weather.current.feelsLike}
          conditionText={weather.current.conditionText}
          conditionEmoji={weather.current.conditionEmoji}
        />

        {/* 2. Character Anchor with Interactive Speech Response */}
        <View style={styles.characterSection}>
          <Pressable
            onPress={handleCharacterTap}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tap buddy for cheerful tip"
          >
            <Character state={charState} size="lg" />
          </Pressable>

          {characterInteraction && (
            <View
              style={[
                styles.interactionBubble,
                {
                  backgroundColor: theme.colors.backgroundCard,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.bubble,
                  ...theme.shadows.sm,
                },
              ]}
            >
              <Text style={[styles.interactionText, { color: theme.colors.textPrimary }]}>
                {characterInteraction}
              </Text>
            </View>
          )}
        </View>

        {/* 3. ONE Primary Personalized Insight Card */}
        {primaryInsight && (
          <View style={styles.primaryInsightContainer}>
            <InsightCard
              isPrimary={true}
              decisionId={decisionId}
              type={primaryInsight.type}
              title={primaryInsight.title}
              shortMessage={primaryInsight.shortMessage}
              reasonCodes={primaryInsight.reasonCodes}
              priority={primaryInsight.priority}
              icon={primaryInsight.icon}
              feedbackGiven={feedbackStatus}
              onFeedback={handleFeedback}
            />
          </View>
        )}

        {/* 4. Small Supporting Information (Hourly forecast preview) */}
        <View style={styles.supportingSection}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.headline,
                  fontWeight: theme.typography.weights.bold,
                },
              ]}
            >
              Today's Flow
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/forecast')}>
              <Text
                style={[
                  styles.viewMoreText,
                  {
                    color: theme.colors.primary,
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
            contentContainerStyle={styles.miniHourlyRow}
          >
            {weather.hourly.slice(0, 6).map((h, idx) => (
              <View
                key={idx}
                style={[
                  styles.miniHourlyCard,
                  {
                    backgroundColor: theme.colors.backgroundCard,
                    borderColor: theme.colors.borderLight,
                    borderRadius: theme.radius.md,
                    ...theme.shadows.sm,
                  },
                ]}
              >
                <Text style={[styles.miniHourText, { color: theme.colors.textSecondary }]}>
                  {h.time}
                </Text>
                <Text style={styles.miniIcon}>{h.icon}</Text>
                <Text style={[styles.miniTemp, { color: theme.colors.textPrimary }]}>
                  {Math.round(h.temp)}°
                </Text>
                {h.rainProb > 20 && (
                  <Text style={[styles.miniRain, { color: theme.colors.weatherRain }]}>
                    {h.rainProb}%
                  </Text>
                )}
              </View>
            ))}
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
            <Text style={[styles.arrowIcon, { color: theme.colors.textMuted }]}>➔</Text>
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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  characterSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  interactionBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
    maxWidth: 280,
    borderWidth: 1,
  },
  interactionText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryInsightContainer: {
    width: '100%',
  },
  supportingSection: {
    marginTop: 16,
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
    paddingVertical: 4,
    gap: 10,
  },
  miniHourlyCard: {
    width: 68,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  miniHourText: {
    fontSize: 12,
    fontWeight: '500',
  },
  miniIcon: {
    fontSize: 22,
    marginVertical: 4,
  },
  miniTemp: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniRain: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  detailLinkContainer: {
    marginTop: 24,
  },
  detailLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
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
