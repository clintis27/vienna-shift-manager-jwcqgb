
import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useShifts } from '@/hooks/useShifts';
import { useNotifications } from '@/hooks/useNotifications';
import { getCategoryTheme } from '@/styles/categoryThemes';
import { formatTime, formatDate } from '@/utils/dateHelpers';
import { getUserFullName } from '@/utils/userHelpers';
import BreakfastLayout from '@/components/layouts/BreakfastLayout';
import FrontDeskLayout from '@/components/layouts/FrontDeskLayout';
import HousekeepingLayout from '@/components/layouts/HousekeepingLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const category = user?.category || 'breakfast';
  const theme = getCategoryTheme(category, isDark);

  const {
    shifts,
    loading: shiftsLoading,
    getTodayShifts,
    getUpcomingShifts,
    loadShifts,
  } = useShifts(user?.id, category);

  const {
    unreadCount,
    loading: notificationsLoading,
    loadNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadShifts(), loadNotifications()]);
    setRefreshing(false);
  };

  const todayShifts = getTodayShifts();
  const upcomingShifts = getUpcomingShifts(3);

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
    getUserName: () => getUserFullName(user),
  };

  if (shiftsLoading || notificationsLoading) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]} 
        edges={['top']}
      >
        <LoadingSpinner isDark={isDark} message="Loading your schedule..." />
      </SafeAreaView>
    );
  }

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
