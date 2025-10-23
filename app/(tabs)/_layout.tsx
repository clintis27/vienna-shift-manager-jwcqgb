
import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      route: '/(tabs)/(home)',
      label: 'Home',
      icon: 'house',
    },
    {
      route: '/(tabs)/schedule',
      label: 'Schedule',
      icon: 'calendar',
    },
    {
      route: '/(tabs)/time-tracking',
      label: 'Time',
      icon: 'clock',
    },
    {
      route: '/(tabs)/profile',
      label: 'Profile',
      icon: 'person',
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(home)" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="time-tracking" />
          <Stack.Screen name="profile" />
        </Stack>
        <FloatingTabBar tabs={tabs} />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="time-tracking" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
