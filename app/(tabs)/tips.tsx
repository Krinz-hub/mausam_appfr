import React, { useState } from 'react';
import {
  View,
  Text,
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
} from '../../src/components';
import { WeatherProvider } from '../../src/services/weather/openMeteoProvider';
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

  React.useEffect(() => {
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

  if (isLoading) {
    return (
      <AppScreen scrollable={false}>
        <LoadingState message="Ranking personalized recommendations for your day..." />
      </AppScreen>
    );
  }

  if (isError || !weather || !experience) {
    return (
      <AppScreen scrollable={false}>
        <ErrorState onRetry={refetch} />
      </AppScreen>
    );
  }

  const allInsights = [
    { ...experience.primaryInsight, isPrimary: true },
    ...experience.cards.map((c) => ({ ...c, isPrimary: false, reasonCodes: [] })),
  ];

  return (
    <AppScreen scrollable={true} contentContainerStyle={{ paddingBottom: 60 }}>
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
            Personal Insights
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Tailored suggestions ranked by your sensitivity and routine
          </Text>
        </View>

        {/* Character Status Banner */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: theme.colors.backgroundSky,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.card,
            },
          ]}
        >
          <Character state="happy" size="md" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={[
                styles.bannerTitle,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.headline,
                  fontWeight: theme.typography.weights.bold,
                },
              ]}
            >
              Adapting to your feedback
            </Text>
            <Text
              style={[
                styles.bannerText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.callout,
                  marginTop: 2,
                },
              ]}
            >
              Every thumbs up or down tunes tomorrow’s suggestions.
            </Text>
          </View>
        </View>

        {/* Ranked Insights List */}
        <View style={styles.insightsList}>
          {allInsights.map((insight, index) => {
            const currentDecisionId = experience.decisionId;
            const feedbackStatus = feedbackHistory[currentDecisionId]?.type;

            return (
              <InsightCard
                key={index}
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
      </ScrollView>

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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
  },
  bannerTitle: {
    letterSpacing: -0.2,
  },
  bannerText: {
    lineHeight: 18,
  },
  insightsList: {
    marginTop: 8,
  },
});
