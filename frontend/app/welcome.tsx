import React, { useRef, useState } from "react";
import { View, StyleSheet, Image, Platform, NativeModules, TurboModuleRegistry } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../src/design";
import { AppScreen, PrimaryButton, Character, Text } from "../src/components";
import { useAuthStore } from "../src/state/useAuthStore";
import { audioManager } from "../src/services/audio/audioManager";
import { withTimeout } from "../src/services/auth/withTimeout";

const GOOGLE_SIGN_IN_TIMEOUT_MS = 45_000;

function getNativeGoogleSigninModule(): typeof import('@react-native-google-signin/google-signin').GoogleSignin | null {
  try {
    const isRegistered = Boolean(
      NativeModules?.RNGoogleSignin ||
      (TurboModuleRegistry as any)?.get?.('RNGoogleSignin')
    );
    if (!isRegistered) return null;
    const mod = require('@react-native-google-signin/google-signin');
    return mod?.GoogleSignin || null;
  } catch {
    return null;
  }
}

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    signInWithGoogle,
    signInWithGoogleCredential,
    signInWithExpoGoFallback,
    beginGoogleSignIn,
    cancelGoogleSignIn,
    failGoogleSignIn,
    isLoading,
  } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const isProcessingRef = useRef(false);

  const handleGoogleSignIn = async () => {
    if (isProcessingRef.current || isLoading) return;
    isProcessingRef.current = true;
    beginGoogleSignIn();
    setAuthError(null);
    audioManager.play("selection");

    console.log('AUTH_GOOGLE_START');

    try {
      if (Platform.OS === "web") {
        console.log('AUTH_REDIRECT_URI', 'Firebase web popup');
        console.log('AUTH_GOOGLE_RESULT', 'firebase-popup');
        await signInWithGoogle();
        console.log('AUTH_GOOGLE_SUCCESS');
      } else {
        const GoogleSignin = getNativeGoogleSigninModule();

        if (GoogleSignin) {
          console.log('AUTH_REDIRECT_URI', 'native Google Sign-In (no browser redirect)');
          const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
          if (!webClientId) throw new Error('Google web client ID is missing from the app environment.');
          GoogleSignin.configure({ webClientId });
          const hasGooglePlayServices = await withTimeout(
            GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }),
            'Google Play Services check timed out.',
            GOOGLE_SIGN_IN_TIMEOUT_MS
          );
          if (!hasGooglePlayServices) throw new Error('Google Play Services is unavailable on this device.');
          const result = await withTimeout(
            GoogleSignin.signIn(),
            'Google Sign-In timed out. Please try again.',
            GOOGLE_SIGN_IN_TIMEOUT_MS
          );
          console.log('AUTH_GOOGLE_RESULT', result.type);
          if (result.type === 'cancelled') {
            console.log('AUTH_GOOGLE_CANCELLED');
            cancelGoogleSignIn();
            return;
          }
          console.log('AUTH_GOOGLE_SUCCESS');
          const idToken = result.data.idToken;
          if (!idToken) throw new Error('Google did not return an ID token.');
          console.log('AUTH_GOOGLE_TOKEN_RECEIVED');
          await signInWithGoogleCredential(idToken);
        } else {
          // Running in Expo Go (native GoogleSignin binary module is not present in Expo Go client)
          console.log('AUTH_REDIRECT_URI', 'Expo Go development authentication session');
          console.log('AUTH_GOOGLE_EXPO_GO', 'Native Google SDK not in binary. Using Expo Go authenticated dev session.');
          await signInWithExpoGoFallback();
        }
      }
      const currentUser = useAuthStore.getState().user;
      router.replace(currentUser?.onboardingCompleted ? "/(tabs)" : "/onboarding");
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') console.log('AUTH_GOOGLE_CANCELLED');
      console.error("AUTH_GOOGLE_ERROR", err);
      const message = err.message || "Google Sign-In could not be started";
      setAuthError(message);
      failGoogleSignIn(message);
    } finally {
      isProcessingRef.current = false;
    }
  };

  return (
    <AppScreen scrollable={false} edges={["top", "bottom"]}>
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
            I am Mausam. A personalized weather experience{"\n"}made for you.
          </Text>
        </View>

        <View style={styles.actionSection}>
          {authError ? (
            <Text
              style={{
                color: theme.colors.error || "#D32F2F",
                fontSize: theme.typography.sizes.footnote,
                textAlign: "center",
                marginBottom: theme.spacing.sm,
              }}
            >
              {authError}
            </Text>
          ) : null}

          <PrimaryButton
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={isLoading}
            icon={
              <View style={styles.googleIconBadge}>
                <Image
                  source={require("../assets/google-logo.png")}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
              </View>
            }
          />

          <Text
            style={[
              styles.disclaimer,
              {
                color: theme.colors.textMuted,
                fontSize: theme.typography.sizes.footnote,
                marginTop: theme.spacing.md,
                textAlign: "center",
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
    justifyContent: "space-between",
    paddingVertical: 32,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    letterSpacing: -1,
    textAlign: "center",
  },
  tagline: {
    textAlign: "center",
  },
  actionSection: {
    width: "100%",
    paddingBottom: 16,
  },
  googleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  googleLogo: {
    width: 18,
    height: 18,
  },
  disclaimer: {
    lineHeight: 16,
  },
});
