import React from 'react';
import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useTheme } from '../../src/design';
import { audioManager } from '../../src/services/audio/audioManager';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundCard,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
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
            <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '⏱️' : '🕒'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '💡' : '✨'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '👤' : '⚙️'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
