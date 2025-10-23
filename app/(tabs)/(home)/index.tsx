
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, commonStyles } from '@/styles/commonStyles';
import { getUser, getShifts, saveShifts } from '@/utils/storage';
import { generateMockShifts } from '@/utils/mockData';
import { User, Shift } from '@/types';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    console.log('Loading home screen data...');
    const userData = await getUser();
    setUser(userData);

    let shiftsData = await getShifts();
    if (shiftsData.length === 0) {
      // Generate mock shifts if none exist
      shiftsData = generateMockShifts(userData?.id);
      await saveShifts(shiftsData);
    }
    setShifts(shiftsData);
    console.log('Data loaded:', { user: userData?.firstName, shifts: shiftsData.length });
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
    return shifts.filter(shift => shift.date > today).slice(0, 5);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const todayShifts = getTodayShifts();
  const upcomingShifts = getUpcomingShifts();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol name="person" size={24} color={theme.card} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/time-tracking')}
          >
            <IconSymbol name="clock" size={32} color={theme.card} />
            <Text style={[styles.actionText, { color: theme.card }]}>Clock In/Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.secondary }]}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <IconSymbol name="calendar" size={32} color={theme.text} />
            <Text style={[styles.actionText, { color: theme.text }]}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Shifts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Shifts</Text>
          {todayShifts.length > 0 ? (
            todayShifts.map((shift) => (
              <View
                key={shift.id}
                style={[
                  styles.shiftCard,
                  { backgroundColor: theme.card, borderLeftColor: shift.color || theme.primary }
                ]}
              >
                <View style={styles.shiftHeader}>
                  <View>
                    <Text style={[styles.shiftDepartment, { color: theme.text }]}>
                      {shift.department}
                    </Text>
                    <Text style={[styles.shiftPosition, { color: theme.textSecondary }]}>
                      {shift.position}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: shift.status === 'in-progress' ? theme.success : theme.accent }
                  ]}>
                    <Text style={[styles.statusText, { color: theme.card }]}>
                      {shift.status === 'in-progress' ? 'Active' : 'Scheduled'}
                    </Text>
                  </View>
                </View>
                <View style={styles.shiftTime}>
                  <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                  <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No shifts scheduled for today
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Shifts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Shifts</Text>
          {upcomingShifts.map((shift) => (
            <View
              key={shift.id}
              style={[
                styles.upcomingCard,
                { backgroundColor: theme.card, borderLeftColor: shift.color || theme.primary }
              ]}
            >
              <View style={styles.upcomingHeader}>
                <Text style={[styles.upcomingDate, { color: theme.primary }]}>
                  {formatDate(shift.date)}
                </Text>
                <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </Text>
              </View>
              <Text style={[styles.upcomingDepartment, { color: theme.text }]}>
                {shift.department} • {shift.position}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  shiftCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftDepartment: {
    fontSize: 18,
    fontWeight: '600',
  },
  shiftPosition: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  upcomingTime: {
    fontSize: 14,
  },
  upcomingDepartment: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
