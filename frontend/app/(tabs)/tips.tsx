import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/design';
import {
  AppScreen,
  InsightCard,
  FeedbackModal,
  Character,
  LoadingState,
  ErrorState,
  Text,
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
import { DecisionEngine } from '../../src/engine/decision/decisionEngine';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useDecisionStore } from '../../src/state/useDecisionStore';
import { useLocationStore } from '../../src/state/useLocationStore';
import { FeedbackReason } from '../../src/components/insights/FeedbackModal';

export default function TipsScreen() {
  const theme = useTheme();
  const persona = useOnboardingStore((s) => s.personaProfile);
  const location = useLocationStore((s) => s.location);
  const {
    experience,
    currentDecision,
    computeDecision,
    submitFeedback,
    feedbackHistory,
  } = useDecisionStore();

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [activeDecisionId, setActiveDecisionId] = useState<string>('');

  const fallbackWeather = React.useMemo(
    () => WeatherProvider.getFallbackData(location.name, location.latitude, location.longitude),
    [location.name, location.latitude, location.longitude]
  );

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

  React.useEffect(() => {
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
        <LoadingState message="Ranking personalized recommendations for your day..." />
      </AppScreen>
    );
  }

  const activeExperience = experience || DecisionEngine.decide(weather, persona || useOnboardingStore.getState().personaProfile!, new Date().getHours()).experience;

  const rawInsights = [
    { ...activeExperience.primaryInsight, isPrimary: true },
    ...activeExperience.cards.map((c) => ({ ...c, isPrimary: false, reasonCodes: [] })),
  ];

  // Visual Hierarchy Sorting:
  // 1. Important / Current Warning (storm, severe, alert)
  // 2. Personalized Recommendation (primary insight / fitness / commute)
  // 3. Secondary Insight (UV, wind, comfort)
  // 4. General Info / Tip
  const sortedInsights = [...rawInsights].sort((a, b) => {
    const score = (item: typeof a) => {
      const type = (item.type || '').toLowerCase();
      if (item.priority === 3 || type.includes('storm') || type.includes('severe') || type.includes('alert')) return 4;
      if (item.isPrimary) return 3;
      if (item.priority === 2 || type.includes('heat') || type.includes('cold') || type.includes('rain')) return 2;
      return 1;
    };
    return score(b) - score(a);
  });

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
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ color: '#FF5533', fontSize: 10, marginRight: 6 }}>●</Text>
          <Text style={{ fontSize: 10, fontWeight: '800', color: theme.isNight ? '#FFB21A' : '#525252', letterSpacing: 0.8 }}>
            ADVISORY MATRIX
          </Text>
        </View>
        <Text
          style={[
            styles.title,
            {
              color: theme.isNight ? '#FFFDF7' : '#171717',
              fontSize: 30,
              fontWeight: '800',
            },
          ]}
        >
          Insights & Tips
        </Text>
        <Text style={[styles.subtitle, { color: theme.isNight ? '#BFBFBF' : '#525252', fontWeight: '500' }]}>
          Tailored suggestions ranked by your sensitivity and routine
        </Text>
      </View>

      {/* Character Status Banner */}
      <View style={styles.bannerWrapper}>
        <View style={[styles.bannerUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
        <View style={[styles.bannerCard, theme.isNight && { backgroundColor: '#2E2416', borderColor: '#3A3A3A' }]}>
          <Character state="happy" size="md" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.bannerTitle, theme.isNight && { color: '#FFFDF7' }]}>
              Adapting to your feedback
            </Text>
            <Text style={[styles.bannerText, theme.isNight && { color: '#E8E8E8' }]}>
              Every thumbs up or down tunes tomorrow’s suggestions.
            </Text>
          </View>
        </View>
      </View>

      {/* Ranked Insights List */}
      <View style={styles.insightsList}>
        {sortedInsights.map((insight, index) => {
          const currentDecisionId = activeExperience.decisionId;
          const feedbackStatus = feedbackHistory[currentDecisionId]?.type;

          return (
            <InsightCard
              key={`${insight.type}_${index}`}
              decisionId={currentDecisionId}
              type={insight.type}
              title={insight.title}
              shortMessage={insight.shortMessage}
              reasonCodes={insight.reasonCodes}
              priority={insight.priority}
              icon={insight.icon}
              isPrimary={insight.isPrimary}
              feedbackGiven={feedbackStatus}
              onFeedback={handleFeedback}
            />
          );
        })}
      </View>

      {/* Feedback Reason Modal */}
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
    borderRadius: 10,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF0D4',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 10,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -0.2,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E2E2E',
    lineHeight: 18,
    marginTop: 2,
  },
  insightsList: {
    marginTop: 8,
  },
});
