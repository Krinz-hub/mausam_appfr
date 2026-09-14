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
import { AppScreen, PrimaryButton, Character, Text } from '../src/components';
import { useAuthStore } from '../src/state/useAuthStore';
import { audioManager } from '../src/services/audio/audioManager';

type AuthMode = 'login' | 'register';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { login, register, isLoading, error: storeError, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (newMode: AuthMode) => {
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

            <Text
              style={[
                styles.appName,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.display,
                  fontWeight: theme.typography.weights.heavy,
                  marginTop: theme.spacing.lg,
                },
              ]}
            >
              Mausam
            </Text>

            <Text
              style={[
                styles.tagline,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.body,
                  marginTop: theme.spacing.xs,
                  lineHeight: theme.typography.lineHeights.body,
                },
              ]}
            >
              A personalized weather companion crafted for you.
            </Text>
          </View>

          {/* Card Container */}
          <View
            style={[
              styles.authCard,
              {
                backgroundColor: theme.colors.backgroundCard,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.card,
                padding: theme.spacing.xl,
                ...theme.shadows.md,
              },
            ]}
          >
            {/* Mode Switcher Tabs */}
            <View
              style={[
                styles.tabContainer,
                {
                  backgroundColor: theme.colors.backgroundCardMuted,
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Pressable
                onPress={() => switchMode('login')}
                style={[
                  styles.tabButton,
                  mode === 'login' && [
                    styles.tabButtonActive,
                    {
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.radius.pill,
                    },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        mode === 'login'
                          ? theme.colors.textInverse
                          : theme.colors.textSecondary,
                      fontWeight:
                        mode === 'login'
                          ? theme.typography.weights.bold
                          : theme.typography.weights.medium,
                    },
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                onPress={() => switchMode('register')}
                style={[
                  styles.tabButton,
                  mode === 'register' && [
                    styles.tabButtonActive,
                    {
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.radius.pill,
                    },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        mode === 'register'
                          ? theme.colors.textInverse
                          : theme.colors.textSecondary,
                      fontWeight:
                        mode === 'register'
                          ? theme.typography.weights.bold
                          : theme.typography.weights.medium,
                    },
                  ]}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* Error Message */}
            {activeError ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.colors.errorLight || '#FEE2E2',
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={theme.colors.error || '#DC2626'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.errorText,
                    { color: theme.colors.error || '#DC2626' },
                  ]}
                >
                  {activeError}
                </Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.form}>
              {mode === 'register' ? (
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Full Name
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                        borderRadius: theme.radius.input,
                      },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={theme.colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { color: theme.colors.textPrimary },
                      ]}
                      placeholder="e.g. Maya Lin"
                      placeholderTextColor={theme.colors.textMuted}
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
                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Email Address
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.input,
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.colors.textPrimary },
                    ]}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.textMuted}
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
                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Password
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.input,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.colors.textPrimary, flex: 1 },
                    ]}
                    placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                    placeholderTextColor={theme.colors.textMuted}
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
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={{ marginTop: theme.spacing.md }}>
                <PrimaryButton
                  label={mode === 'login' ? 'Sign In' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={isLoading}
                />
              </View>
            </View>

            {/* Bottom Mode Switch Link */}
            <Pressable
              onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={styles.switchLink}
            >
              <Text
                style={[
                  styles.switchText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: theme.typography.weights.bold,
                  }}
                >
                  {mode === 'login' ? 'Create one' : 'Sign In'}
                </Text>
              </Text>
            </Pressable>
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
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 320,
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  passwordToggle: {
    padding: 4,
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    fontSize: 13,
  },
});
