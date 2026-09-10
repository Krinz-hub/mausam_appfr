import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/state/useAuthStore';
import { useOnboardingStore } from '../src/state/useOnboardingStore';
import { Character } from '../src/components/character/Character';

export default function Index() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const { loadPersistedPersonalization } = useOnboardingStore();

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      await loadPersistedPersonalization();
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.onboardingCompleted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } else {
        router.replace('/welcome');
      }
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={styles.splash}>
      <Character state="happy" size="lg" />
      <ActivityIndicator size="small" color="#2B7EE4" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#F1F6FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
