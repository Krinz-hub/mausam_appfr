import '../src/design/fontSetup';
import React from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from '../src/design';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60, // 1 hour memory
      retry: 2,
    },
  },
});

function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="details/metrics"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Comfortaa: require('../assets/fonts/Comfortaa_400Regular.ttf'),
    'Comfortaa-Regular': require('../assets/fonts/Comfortaa_400Regular.ttf'),
    'Comfortaa-Bold': require('../assets/fonts/Comfortaa_700Bold.ttf'),
    'Comfortaa-SemiBold': require('../assets/fonts/Comfortaa_600SemiBold.ttf'),
    'Comfortaa-Medium': require('../assets/fonts/Comfortaa_500Medium.ttf'),
    'Comfortaa-Light': require('../assets/fonts/Comfortaa_300Light.ttf'),
    Comfortaa_300Light: require('../assets/fonts/Comfortaa_300Light.ttf'),
    Comfortaa_400Regular: require('../assets/fonts/Comfortaa_400Regular.ttf'),
    Comfortaa_500Medium: require('../assets/fonts/Comfortaa_500Medium.ttf'),
    Comfortaa_600SemiBold: require('../assets/fonts/Comfortaa_600SemiBold.ttf'),
    Comfortaa_700Bold: require('../assets/fonts/Comfortaa_700Bold.ttf'),
  });

  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: '#EBF4FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
