import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/design';
import { audioManager } from '../../src/services/audio/audioManager';
import { hapticManager } from '../../src/services/haptics/hapticManager';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#171717',
          tabBarInactiveTintColor: '#717171',
          tabBarStyle: {
            backgroundColor: '#FFFDF7',
            borderTopColor: '#171717',
            borderTopWidth: 3,
            height: Platform.OS === 'ios' ? 88 : 70,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 24 : 10,
            paddingHorizontal: 8,
            elevation: 8,
          },
        }}
        screenListeners={{
          tabPress: () => {
            hapticManager.selection();
            audioManager.play('selection');
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? '#171717' : '#717171', fontWeight: focused ? '800' : '600' },
                ]}
              >
                {focused ? 'HOME ●' : 'HOME'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={19}
                  color="#171717"
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="forecast"
          options={{
            title: 'Forecast',
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? '#171717' : '#717171', fontWeight: focused ? '800' : '600' },
                ]}
              >
                {focused ? 'TIMELINE ●' : 'TIMELINE'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
                <Ionicons
                  name={focused ? 'partly-sunny' : 'partly-sunny-outline'}
                  size={19}
                  color="#171717"
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="tips"
          options={{
            title: 'Insights',
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? '#171717' : '#717171', fontWeight: focused ? '800' : '600' },
                ]}
              >
                {focused ? 'INSIGHTS ●' : 'INSIGHTS'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
                <Ionicons
                  name={focused ? 'bulb' : 'bulb-outline'}
                  size={19}
                  color="#171717"
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? '#171717' : '#717171', fontWeight: focused ? '800' : '600' },
                ]}
              >
                {focused ? 'PROFILE ●' : 'PROFILE'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={19}
                  color="#171717"
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  iconBox: {
    width: 42,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxFocused: {
    backgroundColor: '#FFB21A',
    borderColor: '#171717',
    borderWidth: 2,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '2px 2px 0px #171717' } as any)
      : {
          shadowColor: '#171717',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }),
  },
});
