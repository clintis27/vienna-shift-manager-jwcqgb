
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { User, Shift } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateMockShifts } from '@/utils/mockData';
import { getUser, getShifts, saveShifts, getNotifications } from '@/utils/storage';
import { getCategoryTheme } from '@/styles/categoryThemes';
import BreakfastLayout from '@/components/layouts/BreakfastLayout';
import FrontDeskLayout from '@/components/layouts/FrontDeskLayout';
import HousekeepingLayout from '@/components/layouts/HousekeepingLayout';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get category-specific theme
  const category = user?.category || 'breakfast';
  const theme = getCategoryTheme(category, isDark);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUser();
      console.log('Home screen loaded user:', userData);
      setUser(userData);

      let shiftsData = await getShifts();
      if (!shiftsData || shiftsData.length === 0) {
        shiftsData = generateMockShifts(userData?.id || '1', userData?.category || 'breakfast');
        await saveShifts(shiftsData);
      }
      setShifts(shiftsData);

      const notifications = await getNotifications();
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTodayShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === today);
  };

  const getUpcomingShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return shifts
      .filter(shift => shift.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getUserName = () => {
    if (!user) return 'Employee';
    return `${user.firstName} ${user.lastName}`.trim() || 'Employee';
  };

  const todayShifts = getTodayShifts();
  const upcomingShifts = getUpcomingShifts();

  // Common props for all layouts
  const layoutProps = {
    user,
    shifts,
    todayShifts,
    upcomingShifts,
    unreadCount,
    refreshing,
    onRefresh,
    theme,
    formatTime,
    formatDate,
    getUserName,
  };

  // Render category-specific layout
  const renderLayout = () => {
    switch (category) {
      case 'breakfast':
        return <BreakfastLayout {...layoutProps} />;
      case 'frontdesk':
        return <FrontDeskLayout {...layoutProps} />;
      case 'housekeeping':
        return <HousekeepingLayout {...layoutProps} />;
      default:
        return <BreakfastLayout {...layoutProps} />;
    }
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      edges={['top']}
    >
      {renderLayout()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
