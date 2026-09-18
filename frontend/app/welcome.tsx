import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/design';
import { AppScreen, PrimaryButton, SecondaryButton, Character, Text } from '../src/components';
import { useAuthStore } from '../src/state/useAuthStore';
import { audioManager } from '../src/services/audio/audioManager';
import { hapticManager } from '../src/services/haptics/hapticManager';

type AuthMode = 'login' | 'register';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { login, register, continueAsGuest, isLoading, error: storeError, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (newMode: AuthMode) => {
    hapticManager.selection();
    audioManager.play('selection');
    setMode(newMode);
    setLocalError(null);
    clearError();
  };

  const handleInputChange = () => {
    if (localError) setLocalError(null);
    if (storeError) clearError();
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    const trimmedName = name.trim();

    // Client-side validation
    if (!trimmedEmail) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!trimmedPassword) {
      setLocalError('Please enter your password.');
      return;
    }
    if (trimmedPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!trimmedName || trimmedName.length < 2) {
        setLocalError('Please enter your name (at least 2 characters).');
        return;
      }
    }

    setLocalError(null);
    clearError();
    hapticManager.impact('medium');
    audioManager.play('selection');

    try {
      if (mode === 'login') {
        await login(trimmedEmail, trimmedPassword);
      } else {
        await register(trimmedName, trimmedEmail, trimmedPassword);
      }

      const currentUser = useAuthStore.getState().user;
      if (currentUser?.onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch {
      // Error handled by store
    }
  };

  const activeError = localError || storeError;

  return (
    <AppScreen scrollable={true} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.contentWrapper}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Character state="happy" size="hero" />

            <View style={styles.brandTitleRow}>
              <Text style={styles.brandDot}>●</Text>
              <Text style={styles.appName}>
                MAUSAM
              </Text>
            </View>

            <Text style={styles.tagline}>
              Personalized weather intelligence with companion personality.
            </Text>
          </View>

          {/* Retro Window Card Container */}
          <View style={styles.cardWrapper}>
            <View style={styles.cardUnderlay} />

            <View style={styles.authCard}>
              {/* Retro Window Header */}
              <View style={styles.windowHeader}>
                <View style={styles.windowHeaderLeft}>
                  <Text style={styles.windowDot}>●</Text>
                  <Text style={styles.windowTitle}>TERMINAL // ACCESS</Text>
                </View>
                <Text style={styles.windowStatus}>ONLINE</Text>
              </View>

              <View style={styles.cardContent}>
                {/* Mode Switcher Tabs */}
                <View style={styles.tabContainer}>
                  <Pressable
                    onPress={() => switchMode('login')}
                    style={[
                      styles.tabButton,
                      mode === 'login' ? styles.tabButtonActive : styles.tabButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { fontWeight: mode === 'login' ? '800' : '600' },
                      ]}
                    >
                      {mode === 'login' ? 'SIGN IN ●' : 'SIGN IN'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => switchMode('register')}
                    style={[
                      styles.tabButton,
                      mode === 'register' ? styles.tabButtonActive : styles.tabButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { fontWeight: mode === 'register' ? '800' : '600' },
                      ]}
                    >
                      {mode === 'register' ? 'REGISTER ●' : 'REGISTER'}
                    </Text>
                  </Pressable>
                </View>

                {/* Error Message */}
                {activeError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorIcon}>⚠</Text>
                    <Text style={styles.errorText}>
                      {activeError}
                    </Text>
                  </View>
                ) : null}

                {/* Form Fields */}
                <View style={styles.form}>
                  {mode === 'register' ? (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        FULL NAME
                      </Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color="#171717"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Maya Lin"
                          placeholderTextColor="#717171"
                          value={name}
                          onChangeText={(val) => {
                            setName(val);
                            handleInputChange();
                          }}
                          autoCapitalize="words"
                          autoCorrect={false}
                        />
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      EMAIL ADDRESS
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color="#171717"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor="#717171"
                        value={email}
                        onChangeText={(val) => {
                          setEmail(val);
                          handleInputChange();
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      PASSWORD
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color="#171717"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                        placeholderTextColor="#717171"
                        value={password}
                        onChangeText={(val) => {
                          setPassword(val);
                          handleInputChange();
                        }}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={8}
                        style={styles.passwordToggle}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#171717"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <PrimaryButton
                      label={mode === 'login' ? 'SIGN IN ➔' : 'CREATE ACCOUNT ➔'}
                      onPress={handleSubmit}
                      loading={isLoading}
                    />
                  </View>

                  <View style={{ marginTop: 10 }}>
                    <SecondaryButton
                      label="EXPLORE AS GUEST ➔"
                      onPress={async () => {
                        await continueAsGuest();
                        router.replace('/(tabs)');
                      }}
                    />
                  </View>
                </View>

                {/* Bottom Mode Switch Link */}
                <Pressable
                  onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  style={styles.switchLink}
                >
                  <Text style={styles.switchText}>
                    {mode === 'login'
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                    <Text style={styles.switchHighlight}>
                      {mode === 'login' ? 'Register here' : 'Sign in here'}
                    </Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  brandDot: {
    color: '#FF5533',
    fontSize: 16,
    marginRight: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 4,
    lineHeight: 18,
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    paddingRight: 5,
    paddingBottom: 5,
  },
  cardUnderlay: {
    position: 'absolute',
    left: 5,
    top: 5,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  authCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#171717',
    borderRadius: 12,
    overflow: 'hidden',
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F4EB',
    borderBottomWidth: 2,
    borderBottomColor: '#171717',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  windowHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  windowDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  windowTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  windowStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7A9E7E',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
  },
  tabButtonActive: {
    backgroundColor: '#FFB21A',
  },
  tabButtonInactive: {
    backgroundColor: '#FFFDF7',
  },
  tabText: {
    fontSize: 12,
    color: '#171717',
    letterSpacing: 0.4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBE6',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#171717',
    flex: 1,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#171717',
    height: '100%',
  },
  passwordToggle: {
    padding: 4,
  },
  switchLink: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  switchHighlight: {
    color: '#FF5533',
    fontWeight: '800',
  },
});
