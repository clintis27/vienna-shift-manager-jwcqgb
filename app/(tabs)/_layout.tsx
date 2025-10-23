
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import FloatingTabBar from '@/components/FloatingTabBar';
import { getUser } from '@/utils/storage';
import { User } from '@/types';

export default function TabLayout() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const isAdmin = user?.role === 'admin';

  const tabs = [
    {
      name: '(home)',
      title: 'Home',
      icon: 'house',
      route: '/(tabs)/(home)',
    },
    {
      name: 'schedule',
      title: 'Schedule',
      icon: 'calendar',
      route: '/(tabs)/schedule',
    },
    {
      name: 'availability',
      title: 'Availability',
      icon: 'calendar.badge.plus',
      route: '/(tabs)/availability',
    },
    ...(isAdmin ? [{
      name: 'admin',
      title: 'Admin',
      icon: 'person.2',
      route: '/(tabs)/admin',
    }] : []),
    {
      name: 'time-tracking',
      title: 'Time',
      icon: 'clock',
      route: '/(tabs)/time-tracking',
    },
    {
      name: 'profile',
      title: 'Profile',
      icon: 'person',
      route: '/(tabs)/profile',
    },
  ];

  if (Platform.OS === 'web') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol name="house" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color }) => <IconSymbol name="calendar" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="availability"
          options={{
            title: 'Availability',
            tabBarIcon: ({ color }) => <IconSymbol name="calendar.badge.plus" size={24} color={color} />,
          }}
        />
        {isAdmin && (
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ color }) => <IconSymbol name="person.2" size={24} color={color} />,
            }}
          />
        )}
        <Tabs.Screen
          name="time-tracking"
          options={{
            title: 'Time',
            tabBarIcon: ({ color }) => <IconSymbol name="clock" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol name="person" size={24} color={color} />,
          }}
        />
      </Tabs>
    );
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => <FloatingTabBar tabs={tabs} />}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="schedule" />
        <Tabs.Screen name="availability" />
        {isAdmin && <Tabs.Screen name="admin" />}
        <Tabs.Screen name="time-tracking" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  );
}
