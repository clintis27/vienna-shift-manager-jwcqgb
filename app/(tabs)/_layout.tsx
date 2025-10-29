
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
      name: 'leave',
      title: 'Leave',
      icon: 'calendar.badge.clock',
      route: '/(tabs)/leave',
    },
    {
      name: 'tasks',
      title: 'Tasks',
      icon: 'checkmark.circle',
      route: '/(tabs)/tasks',
    },
    ...(isAdmin ? [{
      name: 'admin-enhanced',
      title: 'Admin',
      icon: 'person.2',
      route: '/(tabs)/admin-enhanced',
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
          name="leave"
          options={{
            title: 'Leave',
            tabBarIcon: ({ color }) => <IconSymbol name="calendar.badge.clock" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => <IconSymbol name="checkmark.circle" size={24} color={color} />,
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
          <>
            <Tabs.Screen
              name="admin"
              options={{
                title: 'Admin (Old)',
                tabBarIcon: ({ color }) => <IconSymbol name="person.2" size={24} color={color} />,
              }}
            />
            <Tabs.Screen
              name="admin-enhanced"
              options={{
                title: 'Admin',
                tabBarIcon: ({ color }) => <IconSymbol name="person.2" size={24} color={color} />,
              }}
            />
          </>
        )}
        <Tabs.Screen
          name="time-tracking"
          options={{
            title: 'Time',
            tabBarIcon: ({ color }) => <IconSymbol name="clock" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }) => <IconSymbol name="bell" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color }) => <IconSymbol name="doc.text" size={24} color={color} />,
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
        <Tabs.Screen name="leave" />
        <Tabs.Screen name="tasks" />
        <Tabs.Screen name="availability" />
        {isAdmin && (
          <>
            <Tabs.Screen name="admin" />
            <Tabs.Screen name="admin-enhanced" />
          </>
        )}
        <Tabs.Screen name="time-tracking" />
        <Tabs.Screen name="notifications" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  );
}
