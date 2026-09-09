import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/design';
import { AppScreen, PrimaryButton, Character, Text } from '../src/components';
import { useAuthStore } from '../src/state/useAuthStore';
import { audioManager } from '../src/services/audio/audioManager';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signInWithGoogle, user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    audioManager.play('selection');
    try {
      await signInWithGoogle();
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <AppScreen scrollable={false} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Character state="happy" size="hero" />

          <Text
            style={[
              styles.appName,
              {
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.display,
                fontWeight: theme.typography.weights.heavy,
                marginTop: theme.spacing.xl,
              },
            ]}
          >
            Welcome
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
            A personalized weather experience{'\n'}made for you.
          </Text>
        </View>

        <View style={styles.actionSection}>
          <PrimaryButton
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={loading}
            icon={<Text style={{ fontSize: 20, marginRight: 8 }}>🌐</Text>}
          />

          <Text
            style={[
              styles.disclaimer,
              {
                color: theme.colors.textMuted,
                fontSize: theme.typography.sizes.footnote,
                marginTop: theme.spacing.md,
                textAlign: 'center',
              },
            ]}
          >
            Secure, passwordless sign-in with Google.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  actionSection: {
    width: '100%',
    paddingBottom: 16,
  },
  disclaimer: {
    lineHeight: 16,
  },
});
