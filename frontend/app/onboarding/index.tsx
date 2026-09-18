import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/design';
import {
  AppScreen,
  PrimaryButton,
  SecondaryButton,
  SelectionCard,
  ProgressIndicator,
  Character,
  SpeechBubble,
  Text,
  TextInput,
} from '../../src/components';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { audioManager } from '../../src/services/audio/audioManager';

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();

  const {
    currentStep,
    setStep,
    userTypeKeys,
    toggleUserType,
    explanation,
    setExplanation,
    weatherFactorKeys,
    toggleWeatherFactor,
    activePeriods,
    toggleActivePeriod,
    finishOnboarding,
  } = useOnboardingStore();

  const [saving, setSaving] = useState(false);
  const [checkmarkStep, setCheckmarkStep] = useState(0);

  // Sequential checkmarks animation on step 6
  useEffect(() => {
    if (currentStep === 6) {
      audioManager.play('success');
      setCheckmarkStep(1);
      const t1 = setTimeout(() => setCheckmarkStep(2), 600);
      const t2 = setTimeout(() => setCheckmarkStep(3), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setCheckmarkStep(0);
    }
  }, [currentStep]);

  const handleNext = () => {
    audioManager.play('progress');
    setStep(Math.min(6, currentStep + 1));
  };

  const handleBack = () => {
    audioManager.play('selection');
    setStep(Math.max(1, currentStep - 1));
  };

  const handleFinish = async () => {
    setSaving(true);
    audioManager.play('success');
    try {
      await finishOnboarding();
      router.replace('/(tabs)');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <AppScreen scrollable={true} edges={['top', 'bottom']}>
      {/* Top Header & Progress */}
      <View style={styles.topHeader}>
        {currentStep > 1 && currentStep < 6 ? (
          <Pressable
            onPress={handleBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous step"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.colors.backgroundCard,
                borderColor: '#171717',
                transform: [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }],
              },
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <ProgressIndicator currentStep={currentStep} totalSteps={6} />
        </View>
        <View style={[styles.stepBadge, { backgroundColor: theme.colors.backgroundCard, borderColor: '#171717' }]}>
          <Text style={[styles.stepCount, { color: theme.colors.textPrimary }]}>
            {currentStep}/6
          </Text>
        </View>
      </View>

      {/* STEP 1: Welcome */}
      {currentStep === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.centerHero}>
            <Character state="happy" size="hero" />
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.title1,
                  fontWeight: theme.typography.weights.heavy,
                  marginTop: theme.spacing.xl,
                  textAlign: 'center',
                },
              ]}
            >
              A brighter day{'\n'}is with you
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.body,
                  marginTop: theme.spacing.sm,
                  textAlign: 'center',
                  maxWidth: 280,
                },
              ]}
            >
              Weather that understands your day, routines, and health.
            </Text>
            <Ionicons name="heart-outline" size={24} color={theme.colors.primary} style={{ marginTop: 16 }} />
          </View>

          <View style={styles.bottomCta}>
            <PrimaryButton label="Let's begin →" onPress={handleNext} />
          </View>
        </View>
      )}

      {/* STEP 2: What brings you here? */}
      {currentStep === 2 && (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Character state="thinking" size="sm" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.title2,
                    fontWeight: theme.typography.weights.bold,
                  },
                ]}
              >
                What brings you here?
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                Select all that apply to you
              </Text>
            </View>
          </View>

          {/* 2-Column Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.column}>
              <SelectionCard
                id="daily"
                title="Daily life"
                subtitle="Home & errands"
                iconName="home-outline"
                selected={userTypeKeys.includes('daily')}
                onToggle={toggleUserType}
              />
              <SelectionCard
                id="exercise"
                title="Exercise"
                subtitle="Rides & runs"
                iconName="fitness-outline"
                selected={userTypeKeys.includes('exercise')}
                onToggle={toggleUserType}
              />
              <SelectionCard
                id="work"
                title="Outdoor work"
                subtitle="Jobs & sites"
                iconName="briefcase-outline"
                selected={userTypeKeys.includes('work')}
                onToggle={toggleUserType}
              />
              <SelectionCard
                id="gardening"
                title="Gardening"
                subtitle="Plants & soil"
                iconName="leaf-outline"
                selected={userTypeKeys.includes('gardening')}
                onToggle={toggleUserType}
              />
            </View>
            <View style={styles.column}>
              <SelectionCard
                id="commute"
                title="Commute"
                subtitle="Transit & drive"
                iconName="car-outline"
                selected={userTypeKeys.includes('commute')}
                onToggle={toggleUserType}
              />
              <SelectionCard
                id="travel"
                title="Travel"
                subtitle="Trips & flights"
                iconName="airplane-outline"
                selected={userTypeKeys.includes('travel')}
                onToggle={toggleUserType}
              />
              <SelectionCard
                id="health"
                title="Health / comfort"
                subtitle="Air quality & UV"
                iconName="heart-outline"
                selected={userTypeKeys.includes('health')}
                onToggle={toggleUserType}
              />
              <SelectionCard
                id="curious"
                title="Just curious"
                subtitle="Daily forecast"
                iconName="search-outline"
                selected={userTypeKeys.includes('curious')}
                onToggle={toggleUserType}
              />
            </View>
          </View>

          <View style={styles.bottomCta}>
            <PrimaryButton
              label="Continue →"
              onPress={handleNext}
              disabled={userTypeKeys.length === 0}
            />
          </View>
        </View>
      )}

      {/* STEP 3: Anything else? Conversational Input */}
      {currentStep === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.centerHero}>
            <Character state="concerned" size="lg" />
            <SpeechBubble
              text="Anything else?"
              subtext="Share in your own words. We'll use this to tailor your forecast."
              style={{ marginTop: 12 }}
            />

            <View style={styles.textInputWrapper}>
              <View style={styles.textInputUnderlay} />
              <View
                style={[
                  styles.textInputCard,
                  {
                    backgroundColor: theme.colors.backgroundCard,
                    borderColor: '#171717',
                  },
                ]}
              >
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={explanation}
                  onChangeText={setExplanation}
                  placeholder="e.g. I cycle to college every morning. Rain and heat are the biggest problem for me."
                  placeholderTextColor={theme.colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.textPrimary,
                      fontSize: theme.typography.sizes.body,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.bottomCta}>
            <PrimaryButton label="Next →" onPress={handleNext} />
            <SecondaryButton
              label="Skip this step"
              onPress={handleNext}
              style={{ marginTop: 10, height: 48 }}
            />
          </View>
        </View>
      )}

      {/* STEP 4: What affects you most? */}
      {currentStep === 4 && (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Character state="neutral" size="sm" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.title2,
                    fontWeight: theme.typography.weights.bold,
                  },
                ]}
              >
                What affects you most?
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                We will highlight these weather conditions
              </Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.column}>
              <SelectionCard
                id="rain"
                title="Rain"
                iconName="rainy-outline"
                selected={weatherFactorKeys.includes('rain')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="cold"
                title="Cold"
                iconName="snow-outline"
                selected={weatherFactorKeys.includes('cold')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="humidity"
                title="Humidity"
                iconName="water-outline"
                selected={weatherFactorKeys.includes('humidity')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="uv"
                title="UV Index"
                iconName="sunny-outline"
                selected={weatherFactorKeys.includes('uv')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="storm"
                title="Storm"
                iconName="thunderstorm-outline"
                selected={weatherFactorKeys.includes('storm')}
                onToggle={toggleWeatherFactor}
              />
            </View>
            <View style={styles.column}>
              <SelectionCard
                id="heat"
                title="Heat"
                iconName="flame-outline"
                selected={weatherFactorKeys.includes('heat')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="wind"
                title="Wind"
                iconName="speedometer-outline"
                selected={weatherFactorKeys.includes('wind')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="air_quality"
                title="Air quality"
                iconName="leaf-outline"
                selected={weatherFactorKeys.includes('air_quality')}
                onToggle={toggleWeatherFactor}
              />
              <SelectionCard
                id="snow"
                title="Frost / Snow"
                iconName="snow-outline"
                selected={weatherFactorKeys.includes('snow')}
                onToggle={toggleWeatherFactor}
              />
            </View>
          </View>

          <View style={styles.bottomCta}>
            <PrimaryButton
              label="Continue →"
              onPress={handleNext}
              disabled={weatherFactorKeys.length === 0}
            />
          </View>
        </View>
      )}

      {/* STEP 5: When are you usually active? */}
      {currentStep === 5 && (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Character state="energetic" size="sm" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.title2,
                    fontWeight: theme.typography.weights.bold,
                  },
                ]}
              >
                When are you active?
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                Pick your typical routine hours
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectionCard
              id="morning"
              title="Morning"
              subtitle="5 AM – 12 PM"
              iconName="sunny-outline"
              layout="pill"
              selected={activePeriods.includes('morning')}
              onToggle={() => toggleActivePeriod('morning')}
            />
            <SelectionCard
              id="afternoon"
              title="Afternoon"
              subtitle="12 PM – 5 PM"
              iconName="partly-sunny-outline"
              layout="pill"
              selected={activePeriods.includes('afternoon')}
              onToggle={() => toggleActivePeriod('afternoon')}
            />
            <SelectionCard
              id="evening"
              title="Evening"
              subtitle="5 PM – 10 PM"
              iconName="moon-outline"
              layout="pill"
              selected={activePeriods.includes('evening')}
              onToggle={() => toggleActivePeriod('evening')}
            />
            <SelectionCard
              id="night"
              title="Night"
              subtitle="10 PM – 5 AM"
              iconName="cloudy-night-outline"
              layout="pill"
              selected={activePeriods.includes('night')}
              onToggle={() => toggleActivePeriod('night')}
            />
          </View>

          <View style={styles.bottomCta}>
            <PrimaryButton label="Continue →" onPress={handleNext} />
          </View>
        </View>
      )}

      {/* STEP 6: All Set! Reward Screen */}
      {currentStep === 6 && (
        <View style={styles.stepContainer}>
          <View style={styles.centerHero}>
            <Character state="excited" size="hero" />
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.title1,
                  fontWeight: theme.typography.weights.heavy,
                  marginTop: theme.spacing.lg,
                  textAlign: 'center',
                },
              ]}
            >
              All set!
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.body,
                  marginTop: theme.spacing.xs,
                  textAlign: 'center',
                  maxWidth: 280,
                },
              ]}
            >
              I'll personalize your weather experience just for you.
            </Text>

            {/* Sequential Animated Checkmarks */}
            <View style={styles.checkmarksWrapper}>
              <View style={styles.checkmarksUnderlay} />
              <View style={[styles.checkmarksBox, { backgroundColor: theme.colors.backgroundCard, borderColor: '#171717' }]}>
                <View style={styles.checkmarksHeader}>
                  <Text style={styles.terminalLabel}>[ STATUS // SYSTEM READY ]</Text>
                </View>
                {checkmarkStep >= 1 && (
                  <View style={styles.checkItem}>
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                    <Text style={[styles.checkText, { color: theme.colors.textPrimary }]}>
                      Preferences saved
                    </Text>
                  </View>
                )}
                {checkmarkStep >= 2 && (
                  <View style={styles.checkItem}>
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                    <Text style={[styles.checkText, { color: theme.colors.textPrimary }]}>
                      Personalized experience ready
                    </Text>
                  </View>
                )}
                {checkmarkStep >= 3 && (
                  <View style={styles.checkItem}>
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                    <Text style={[styles.checkText, { color: theme.colors.textPrimary }]}>
                      Let's make brighter days together
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.bottomCta}>
            <PrimaryButton
              label="Start exploring →"
              onPress={handleFinish}
              loading={saving}
            />
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 8,
  },
  stepCount: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  centerHero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 22,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  textInputWrapper: {
    width: '100%',
    position: 'relative',
    marginTop: 20,
  },
  textInputUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  textInputCard: {
    width: '100%',
    padding: 16,
    borderWidth: 2.5,
    borderRadius: 10,
  },
  textInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  checkmarksWrapper: {
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
    position: 'relative',
  },
  checkmarksUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  checkmarksBox: {
    borderWidth: 2.5,
    borderRadius: 10,
    padding: 16,
  },
  checkmarksHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#171717',
    paddingBottom: 6,
    marginBottom: 10,
  },
  terminalLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#171717',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 4,
    backgroundColor: '#FFB21A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171717',
  },
  checkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomCta: {
    marginTop: 24,
  },
});
