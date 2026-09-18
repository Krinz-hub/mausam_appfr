import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/design';
import { audioManager } from '../../src/services/audio/audioManager';
import { hapticManager } from '../../src/services/haptics/hapticManager';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Dynamic safe-area aware bottom bar calculation
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 6);
  const barHeight = 54 + bottomInset;

  const activeLabelColor = theme.isNight ? '#FFB21A' : '#171717';
  const inactiveLabelColor = theme.isNight ? '#888888' : '#525252';
  const activeIconColor = '#171717';
  const inactiveIconColor = theme.isNight ? '#A0A0A0' : '#171717';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeLabelColor,
          tabBarInactiveTintColor: inactiveLabelColor,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: theme.isNight ? '#1C1C1C' : '#FFFDF7',
            borderTopColor: theme.isNight ? '#333333' : '#171717',
            borderTopWidth: 2,
            height: barHeight,
            paddingTop: 4,
            paddingBottom: bottomInset,
            paddingHorizontal: 4,
            elevation: 0,
            shadowColor: 'transparent',
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
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                style={({ pressed }) => [
                  props.style,
                  styles.tabButton,
                  pressed && styles.tabButtonPressed,
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? activeLabelColor : inactiveLabelColor,
                    fontWeight: focused ? '800' : '600',
                  },
                ]}
              >
                {focused ? 'HOME ●' : 'HOME'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconBox,
                  focused && [
                    styles.iconBoxFocused,
                    { borderColor: theme.isNight ? '#FFB21A' : '#171717' },
                  ],
                ]}
              >
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={18}
                  color={focused ? activeIconColor : inactiveIconColor}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="forecast"
          options={{
            title: 'Forecast',
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                style={({ pressed }) => [
                  props.style,
                  styles.tabButton,
                  pressed && styles.tabButtonPressed,
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? activeLabelColor : inactiveLabelColor,
                    fontWeight: focused ? '800' : '600',
                  },
                ]}
              >
                {focused ? 'TIMELINE ●' : 'TIMELINE'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconBox,
                  focused && [
                    styles.iconBoxFocused,
                    { borderColor: theme.isNight ? '#FFB21A' : '#171717' },
                  ],
                ]}
              >
                <Ionicons
                  name={focused ? 'partly-sunny' : 'partly-sunny-outline'}
                  size={18}
                  color={focused ? activeIconColor : inactiveIconColor}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="tips"
          options={{
            title: 'Insights',
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                style={({ pressed }) => [
                  props.style,
                  styles.tabButton,
                  pressed && styles.tabButtonPressed,
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? activeLabelColor : inactiveLabelColor,
                    fontWeight: focused ? '800' : '600',
                  },
                ]}
              >
                {focused ? 'INSIGHTS ●' : 'INSIGHTS'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconBox,
                  focused && [
                    styles.iconBoxFocused,
                    { borderColor: theme.isNight ? '#FFB21A' : '#171717' },
                  ],
                ]}
              >
                <Ionicons
                  name={focused ? 'bulb' : 'bulb-outline'}
                  size={18}
                  color={focused ? activeIconColor : inactiveIconColor}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                style={({ pressed }) => [
                  props.style,
                  styles.tabButton,
                  pressed && styles.tabButtonPressed,
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? activeLabelColor : inactiveLabelColor,
                    fontWeight: focused ? '800' : '600',
                  },
                ]}
              >
                {focused ? 'PROFILE ●' : 'PROFILE'}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconBox,
                  focused && [
                    styles.iconBoxFocused,
                    { borderColor: theme.isNight ? '#FFB21A' : '#171717' },
                  ],
                ]}
              >
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={18}
                  color={focused ? activeIconColor : inactiveIconColor}
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
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingVertical: 2,
  },
  tabButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  iconBox: {
    width: 36,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxFocused: {
    backgroundColor: '#FFB21A',
    borderWidth: 1.5,
  },
});
