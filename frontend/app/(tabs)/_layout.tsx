import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions, Easing, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/design';
import { audioManager } from '../../src/services/audio/audioManager';

export default function TabsLayout() {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const forSlide = React.useCallback(
    ({ current }: { current: { progress: any } }) => {
      const translateX = current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-screenWidth, 0, screenWidth],
        extrapolate: 'clamp',
      });

      return {
        sceneStyle: {
          backgroundColor: theme.colors.background,
          transform: [{ translateX }],
        },
      };
    },
    [screenWidth, theme.colors.background]
  );

  const slideTransitionSpec = React.useMemo(
    () => ({
      animation: 'timing' as const,
      config: {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
    }),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          sceneStyleInterpolator: forSlide,
          transitionSpec: slideTransitionSpec,
          sceneStyle: {
            backgroundColor: theme.colors.background,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.backgroundCard,
            borderTopColor: theme.colors.borderLight,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            elevation: 8,
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
          },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.caption,
          fontWeight: theme.typography.weights.semibold,
          marginTop: 2,
        },
      }}
      screenListeners={{
        tabPress: () => {
          audioManager.play('selection');
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'partly-sunny' : 'partly-sunny-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bulb' : 'bulb-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  </View>
);
}
