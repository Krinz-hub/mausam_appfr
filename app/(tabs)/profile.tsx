import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/design';
import { AppScreen, Character, PrimaryButton, SecondaryButton, LocationModal } from '../../src/components';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useSettingsStore } from '../../src/state/useSettingsStore';
import { useLocationStore } from '../../src/state/useLocationStore';
import { audioManager } from '../../src/services/audio/audioManager';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuthStore();
  const { needProfile, personaProfile, resetOnboarding } = useOnboardingStore();
  const { location } = useLocationStore();
  const [locationModalVisible, setLocationModalVisible] = React.useState(false);
  const {
    soundEnabled,
    temperatureUnit,
    notificationsEnabled,
    reducedMotion,
    toggleSound,
    toggleUnit,
    toggleNotifications,
    toggleReducedMotion,
  } = useSettingsStore();

  const handleSignOut = async () => {
    audioManager.play('selection');
    await signOut();
    router.replace('/welcome');
  };

  const handleRetakeOnboarding = () => {
    audioManager.play('selection');
    resetOnboarding();
    router.replace('/onboarding');
  };

  const activeInterests = needProfile?.userTypes || [
    { type: 'commuter', score: 0.9 },
    { type: 'fitness', score: 0.8 },
  ];

  const activeNeeds = needProfile?.needs.slice(0, 4) || [
    { factor: 'rain', priority: 0.95 },
    { factor: 'feels_like', priority: 0.85 },
  ];

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
          Your Profile
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Personalized companion preferences & settings
        </Text>
      </View>

      {/* User Account Card (Google Authenticated) */}
      <View
        style={[
          styles.accountCard,
          {
            backgroundColor: theme.colors.backgroundCard,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.card,
            padding: theme.spacing.cardPadding,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View style={styles.accountRow}>
          <Character state="happy" size="md" />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text
              style={[
                styles.accountName,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.title3,
                  fontWeight: theme.typography.weights.bold,
                },
              ]}
            >
              {user?.displayName || 'Dev'}
            </Text>
            <Text style={[styles.accountEmail, { color: theme.colors.textSecondary }]}>
              {user?.email || 'dev@mausam.in'}
            </Text>
            <View style={styles.googleBadge}>
              <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>
                Google Connected
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 1. Visual Interests & Active Routines */}
      <View style={styles.section}>
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
          Your Active Interests
        </Text>

        <View style={styles.pillsRow}>
          {activeInterests.map((item, idx) => {
            const iconName: keyof typeof Ionicons.glyphMap =
              item.type === 'commuter'
                ? 'car-outline'
                : item.type === 'fitness'
                ? 'fitness-outline'
                : item.type === 'health'
                ? 'heart-outline'
                : 'home-outline';
            const label =
              item.type === 'commuter'
                ? 'Commute'
                : item.type === 'fitness'
                ? 'Exercise'
                : item.type === 'health'
                ? 'Health'
                : 'Daily life';

            return (
              <View
                key={idx}
                style={[
                  styles.pill,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: theme.radius.pill,
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={14}
                  color={theme.colors.primaryDark}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.pillText, { color: theme.colors.primaryDark }]}>
                  {label}
                </Text>
              </View>
            );
          })}

          {activeNeeds.map((need, idx) => {
            const iconName: keyof typeof Ionicons.glyphMap =
              need.factor === 'rain'
                ? 'rainy-outline'
                : need.factor === 'feels_like'
                ? 'sunny-outline'
                : need.factor === 'wind'
                ? 'speedometer-outline'
                : 'leaf-outline';
            const label =
              need.factor === 'rain'
                ? 'Rain Alert'
                : need.factor === 'feels_like'
                ? 'Heat Comfort'
                : need.factor === 'wind'
                ? 'Wind Watch'
                : 'Air Quality';

            return (
              <View
                key={`n-${idx}`}
                style={[
                  styles.pill,
                  {
                    backgroundColor: theme.colors.backgroundCardMuted,
                    borderRadius: theme.radius.pill,
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={14}
                  color={theme.colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.pillText, { color: theme.colors.textPrimary }]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 2. Settings Toggles */}
      <View style={styles.section}>
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
          App Experience
        </Text>

        <View
          style={[
            styles.settingsList,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.card,
              ...theme.shadows.sm,
            },
          ]}
        >
          {/* Active Location Row */}
          <Pressable
            onPress={() => setLocationModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Active Location: ${location.name}. Tap to change.`}
            style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Active Location
              </Text>
              <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                {location.name} {location.isPrecise ? '• GPS Locked' : '• Network Area'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </Pressable>

          {/* Sound Feedback Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Playful Sound Effects
              </Text>
              <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                Tactile chimes on taps & completions
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          {/* Temperature Unit Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Temperature Units
              </Text>
              <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                Currently: {temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
              </Text>
            </View>
            <Pressable
              onPress={toggleUnit}
              style={[
                styles.unitToggleBtn,
                {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primary,
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Text style={[styles.unitToggleText, { color: theme.colors.primaryDark }]}>
                {temperatureUnit === 'celsius' ? '°C' : '°F'}
              </Text>
            </Pressable>
          </View>

          {/* Notifications Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Atmospheric Alerts
              </Text>
              <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                Contextual notifications before rain or heat
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          {/* Reduced Motion Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Reduced Motion
              </Text>
              <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                Simplify floating & bounce transitions
              </Text>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={toggleReducedMotion}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>
      </View>

      {/* 3. Actions */}
      <View style={styles.actionsSection}>
        <SecondaryButton
          label="Recalibrate Preferences"
          onPress={handleRetakeOnboarding}
          style={{ marginBottom: 12 }}
        />
        <PrimaryButton
          label="Sign Out"
          variant="danger"
          onPress={handleSignOut}
        />
      </View>

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
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
  accountCard: {
    marginVertical: 10,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    letterSpacing: -0.2,
  },
  accountEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  googleBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingsList: {
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  unitToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  unitToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginTop: 28,
  },
});
