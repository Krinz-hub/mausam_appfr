import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/design';
import { AppScreen, Character, PrimaryButton, SecondaryButton, LocationModal, Text } from '../../src/components';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useOnboardingStore } from '../../src/state/useOnboardingStore';
import { useSettingsStore } from '../../src/state/useSettingsStore';
import { useLocationStore } from '../../src/state/useLocationStore';
import { audioManager } from '../../src/services/audio/audioManager';
import { hapticManager } from '../../src/services/haptics/hapticManager';

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
    hapticManager.impact('medium');
    audioManager.play('selection');
    await signOut();
    router.replace('/welcome');
  };

  const handleRetakeOnboarding = () => {
    hapticManager.impact('medium');
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
    <AppScreen scrollable={true} contentContainerStyle={{ paddingBottom: 16 }}>
      {/* 1. Header & User Identity */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeDot}>●</Text>
          <Text style={[styles.badgeLabel, theme.isNight && { color: '#FFB21A' }]}>CONTROL PANEL</Text>
        </View>
        <Text style={[styles.title, theme.isNight && { color: '#FFFDF7' }]}>
          Your Profile
        </Text>
        <Text style={[styles.subtitle, theme.isNight && { color: '#BFBFBF' }]}>
          Companion preferences, active sensitivity & controls
        </Text>
      </View>

      {/* User Account Card */}
      <View style={styles.cardWrapper}>
        <View style={[styles.cardUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
        <View style={[styles.accountCard, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
          <View style={styles.accountRow}>
            <View style={[styles.charContainer, theme.isNight && { backgroundColor: '#362910', borderColor: '#FFB21A' }]}>
              <Character state="happy" size="md" />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={[styles.accountName, theme.isNight && { color: '#FFFDF7' }]}>
                {user?.name || user?.displayName || 'Weather Explorer'}
              </Text>
              {user?.email ? (
                <Text style={[styles.accountEmail, theme.isNight && { color: '#BFBFBF' }]}>
                  {user.email}
                </Text>
              ) : null}
              <View style={[styles.verifiedBadge, theme.isNight && { backgroundColor: '#1F2A38', borderColor: '#3A3A3A' }]}>
                <Text style={[styles.verifiedText, theme.isNight && { color: '#A8C7FF' }]}>
                  ★ MAUSAM PILOT
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Active Location Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDot}>●</Text>
          <Text style={[styles.sectionTitle, theme.isNight && { color: '#FFFDF7' }]}>
            ACTIVE LOCATION
          </Text>
        </View>

        <View style={styles.settingsWrapper}>
          <View style={[styles.settingsUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
          <View style={[styles.settingsList, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
            <Pressable
              onPress={() => {
                hapticManager.selection();
                audioManager.play('selection');
                setLocationModalVisible(true);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Active Location: ${location.name}. Tap to change.`}
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingLabel, theme.isNight && { color: '#FFFDF7' }]}>
                  Forecast Location
                </Text>
                <Text style={[styles.settingSub, theme.isNight && { color: '#BFBFBF' }]}>
                  {location.name} {location.isPrecise ? '• GPS Locked' : '• Network Area'}
                </Text>
              </View>
              <View style={styles.actionControl}>
                <View style={[styles.chevronBox, theme.isNight && { backgroundColor: '#1C1C1C', borderColor: '#3A3A3A' }]}>
                  <Ionicons name="chevron-forward" size={16} color={theme.isNight ? '#FFFDF7' : '#171717'} />
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 3. Preferences Section (Units, Audio) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDot}>●</Text>
          <Text style={[styles.sectionTitle, theme.isNight && { color: '#FFFDF7' }]}>
            PREFERENCES
          </Text>
        </View>

        <View style={styles.settingsWrapper}>
          <View style={[styles.settingsUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
          <View style={[styles.settingsList, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
            {/* Temperature Unit Toggle */}
            <View style={[styles.settingRow, theme.isNight && { borderBottomColor: '#383838' }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingLabel, theme.isNight && { color: '#FFFDF7' }]}>
                  Temperature Units
                </Text>
                <Text style={[styles.settingSub, theme.isNight && { color: '#BFBFBF' }]}>
                  Currently: {temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                </Text>
              </View>
              <View style={styles.actionControl}>
                <Pressable
                  onPress={() => {
                    hapticManager.selection();
                    audioManager.play('selection');
                    toggleUnit();
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [
                    styles.unitToggleBtn,
                    theme.isNight && { borderColor: '#3A3A3A' },
                    pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                  ]}
                >
                  <Text style={styles.unitToggleText}>
                    {temperatureUnit === 'celsius' ? '°C' : '°F'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Sound Feedback Toggle */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingLabel, theme.isNight && { color: '#FFFDF7' }]}>
                  Tactile Audio Effects
                </Text>
                <Text style={[styles.settingSub, theme.isNight && { color: '#BFBFBF' }]}>
                  Playful chimes on taps & interactions
                </Text>
              </View>
              <View style={styles.actionControl}>
                <Switch
                  value={soundEnabled}
                  onValueChange={() => {
                    hapticManager.selection();
                    toggleSound();
                  }}
                  trackColor={{ false: '#D9D7CE', true: '#FF5533' }}
                  thumbColor={soundEnabled ? '#FFFDF7' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 4. Weather Settings (Alerts & Active Sensitivities) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDot}>●</Text>
          <Text style={[styles.sectionTitle, theme.isNight && { color: '#FFFDF7' }]}>
            WEATHER SETTINGS
          </Text>
        </View>

        <View style={styles.settingsWrapper}>
          <View style={[styles.settingsUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
          <View style={[styles.settingsList, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
            {/* Notifications Toggle */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingLabel, theme.isNight && { color: '#FFFDF7' }]}>
                  Atmospheric Alerts
                </Text>
                <Text style={[styles.settingSub, theme.isNight && { color: '#BFBFBF' }]}>
                  Contextual warnings before rain or storm
                </Text>
              </View>
              <View style={styles.actionControl}>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={() => {
                    hapticManager.selection();
                    toggleNotifications();
                  }}
                  trackColor={{ false: '#D9D7CE', true: '#FF5533' }}
                  thumbColor={notificationsEnabled ? '#FFFDF7' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Sensitivities & Routine pills */}
        <View style={styles.pillsContainer}>
          <Text style={[styles.subSectionTitle, theme.isNight && { color: '#BFBFBF' }]}>
            Active Routines & Sensitivities
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
                <View key={idx} style={styles.pillWrapper}>
                  <View style={[styles.pillUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
                  <View style={[styles.pill, { backgroundColor: '#FFB21A' }, theme.isNight && { borderColor: '#3A3A3A' }]}>
                    <Ionicons
                      name={iconName}
                      size={14}
                      color="#171717"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.pillText}>
                      {label}
                    </Text>
                  </View>
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
                <View key={`n-${idx}`} style={styles.pillWrapper}>
                  <View style={[styles.pillUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
                  <View style={[styles.pill, { backgroundColor: theme.isNight ? '#242424' : '#FFFDF7' }, theme.isNight && { borderColor: '#3A3A3A' }]}>
                    <Ionicons
                      name={iconName}
                      size={14}
                      color={theme.isNight ? '#FFFDF7' : '#171717'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.pillText, theme.isNight && { color: '#FFFDF7' }]}>
                      {label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* 5. Accessibility Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDot}>●</Text>
          <Text style={[styles.sectionTitle, theme.isNight && { color: '#FFFDF7' }]}>
            ACCESSIBILITY
          </Text>
        </View>

        <View style={styles.settingsWrapper}>
          <View style={[styles.settingsUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />
          <View style={[styles.settingsList, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingLabel, theme.isNight && { color: '#FFFDF7' }]}>
                  Reduced Motion
                </Text>
                <Text style={[styles.settingSub, theme.isNight && { color: '#BFBFBF' }]}>
                  Simplify floating & bounce transitions
                </Text>
              </View>
              <View style={styles.actionControl}>
                <Switch
                  value={reducedMotion}
                  onValueChange={() => {
                    hapticManager.selection();
                    toggleReducedMotion();
                  }}
                  trackColor={{ false: '#D9D7CE', true: '#FF5533' }}
                  thumbColor={reducedMotion ? '#FFFDF7' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 6. Account Actions */}
      <View style={styles.actionsSection}>
        <SecondaryButton
          label="Recalibrate Routine"
          onPress={handleRetakeOnboarding}
          style={{ marginBottom: 16 }}
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#525252',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#171717',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 13,
    color: '#525252',
    fontWeight: '500',
    marginTop: 2,
  },
  cardWrapper: {
    position: 'relative',
    marginVertical: 10,
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  cardUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 10,
    padding: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  charContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFF0D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171717',
  },
  accountEmail: {
    fontSize: 12,
    color: '#525252',
    marginTop: 2,
  },
  verifiedBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#171717',
    backgroundColor: '#A8C7FF',
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    color: '#171717',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#525252',
    marginTop: 12,
    marginBottom: 8,
  },
  pillsContainer: {
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillWrapper: {
    position: 'relative',
    paddingRight: 3,
    paddingBottom: 3,
  },
  pillUnderlay: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#171717',
  },
  settingsWrapper: {
    position: 'relative',
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  settingsUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#171717',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
  },
  settingSub: {
    fontSize: 11,
    color: '#525252',
    fontWeight: '500',
    marginTop: 2,
  },
  actionControl: {
    width: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#171717',
    backgroundColor: '#F7F4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 6,
    backgroundColor: '#FFB21A',
  },
  unitToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#171717',
  },
  actionsSection: {
    marginTop: 28,
    marginBottom: 8,
  },
});
