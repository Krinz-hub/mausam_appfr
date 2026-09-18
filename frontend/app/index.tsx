import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/state/useAuthStore';
import { useOnboardingStore } from '../src/state/useOnboardingStore';
import { Character } from '../src/components/character/Character';

export default function Index() {
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const { loadPersistedPersonalization } = useOnboardingStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setReady(true);
    }, 600); // 600ms quick splash

    const initApp = async () => {
      try {
        await Promise.allSettled([
          initialize(),
          loadPersistedPersonalization(),
        ]);
      } finally {
        if (mounted) setReady(true);
      }
    };
    initApp();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (ready || !isLoading) {
    if (isAuthenticated && user && !user.onboardingCompleted) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.splash}>
      <Character state="happy" size="hero" />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FFFDF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
