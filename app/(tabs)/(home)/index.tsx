
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
import { colors, darkColors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { getUser, getShifts, saveShifts, getNotifications } from '@/utils/storage';
import { generateMockShifts } from '@/utils/mockData';
import { User, Shift } from '@/types';
import { getCategoryColor, getCategoryName } from '@/utils/mockData';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    let shiftsData = await getShifts();
    
    if (shiftsData.length === 0 && userData) {
      shiftsData = generateMockShifts(userData.id, userData.category);
      await saveShifts(shiftsData);
    }

    if (userData) {
      if (userData.role === 'admin' && userData.category) {
        shiftsData = shiftsData.filter(s => s.category === userData.category);
      } else {
        shiftsData = shiftsData.filter(s => s.userId === userData.id);
      }
    }

    setShifts(shiftsData);

    // Load unread notifications count
    const notifications = await getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);

    console.log('Loaded shifts:', shiftsData.length, 'Unread notifications:', unread);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTodayShifts = (): Shift[] => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === today);
  };

  const getUpcomingShifts = (): Shift[] => {
    const today = new Date().toISOString().split('T')[0];
    return shifts
      .filter(shift => shift.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  };

  const formatTime = (time: string): string => {
    return time;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentMonth = (): string => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Notification Bell */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>
              Work Dashboard
            </Text>
            <Text style={[styles.monthText, { color: theme.textSecondary }]}>
              {getCurrentMonth()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <IconSymbol name="bell" size={24} color={theme.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.error }]}>
                <Text style={[styles.badgeText, { color: theme.card }]}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Mini Calendar Preview */}
        <View style={[styles.calendarPreview, { backgroundColor: theme.card }]}>
          <View style={styles.calendarHeader}>
            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day, index) => (
              <Text key={index} style={[styles.calendarDay, { color: theme.textTertiary }]}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.calendarDates}>
            {[8, 13, 19, 11, 28, 12, 27].map((date, index) => (
              <View key={index} style={styles.calendarDateContainer}>
                <Text 
                  style={[
                    styles.calendarDate, 
                    { color: index === 5 ? theme.text : theme.textSecondary },
                    index === 5 && styles.calendarDateActive
                  ]}
                >
                  {date}
                </Text>
                {index === 5 && <View style={[styles.calendarDot, { backgroundColor: theme.pastelPink }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[buttonStyles.pastelBlue, styles.actionButton]}
            onPress={() => router.push('/(tabs)/time-tracking')}
            activeOpacity={0.8}
          >
            <Text style={[buttonStyles.text, { color: theme.text }]}>Clock In/Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.pastelPink, styles.actionButton]}
            onPress={() => router.push('/(tabs)/schedule')}
            activeOpacity={0.8}
          >
            <Text style={[buttonStyles.text, { color: theme.text }]}>View Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.pastelMint, styles.actionButton]}
            onPress={() => router.push('/(tabs)/availability')}
            activeOpacity={0.8}
          >
            <Text style={[buttonStyles.text, { color: theme.text }]}>Book Shifts</Text>
          </TouchableOpacity>

          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[buttonStyles.pastelPurple, styles.actionButton]}
              onPress={() => router.push('/(tabs)/admin')}
              activeOpacity={0.8}
            >
              <Text style={[buttonStyles.text, { color: theme.text }]}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Today's Shifts */}
        {todayShifts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Shifts</Text>
            {todayShifts.map(shift => (
              <View
                key={shift.id}
                style={[styles.shiftCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.shiftHeader}>
                  <View style={[styles.shiftIcon, { backgroundColor: theme.pastelBlue }]}>
                    <IconSymbol name="briefcase" size={20} color={theme.text} />
                  </View>
                  <View style={styles.shiftInfo}>
                    <Text style={[styles.shiftDepartment, { color: theme.text }]}>
                      {shift.department}
                    </Text>
                    <Text style={[styles.shiftTime, { color: theme.textSecondary }]}>
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: shift.status === 'in-progress' ? theme.success : theme.pastelBlue }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Shifts */}
        {upcomingShifts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming</Text>
            {upcomingShifts.map(shift => (
              <View
                key={shift.id}
                style={[styles.shiftCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.shiftHeader}>
                  <View style={[styles.shiftIcon, { backgroundColor: theme.pastelMint }]}>
                    <IconSymbol name="calendar" size={20} color={theme.text} />
                  </View>
                  <View style={styles.shiftInfo}>
                    <Text style={[styles.shiftDepartment, { color: theme.text }]}>
                      {shift.department}
                    </Text>
                    <Text style={[styles.shiftTime, { color: theme.textSecondary }]}>
                      {formatDate(shift.date)} • {formatTime(shift.startTime)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {todayShifts.length === 0 && upcomingShifts.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Shifts Scheduled</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Book your shifts to get started
            </Text>
          </View>
        )}

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  monthText: {
    fontSize: 17,
    fontWeight: '500',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  calendarPreview: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calendarDay: {
    fontSize: 13,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  calendarDates: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDateContainer: {
    alignItems: 'center',
    width: 32,
  },
  calendarDate: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  calendarDateActive: {
    fontWeight: '700',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  shiftCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftDepartment: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  shiftTime: {
    fontSize: 15,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyState: {
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
