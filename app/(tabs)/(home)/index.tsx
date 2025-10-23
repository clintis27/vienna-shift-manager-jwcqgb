
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
import { getCategoryColor, getCategoryName } from '@/utils/mockData';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    let shiftsData = await getShifts();
    
    // If no shifts exist, generate mock data
    if (shiftsData.length === 0 && userData) {
      shiftsData = generateMockShifts(userData.id, userData.category);
      await saveShifts(shiftsData);
    }

    // Filter shifts by user and category
    if (userData) {
      if (userData.role === 'admin' && userData.category) {
        // Admins see all shifts in their category
        shiftsData = shiftsData.filter(s => s.category === userData.category);
      } else {
        // Employees see only their shifts
        shiftsData = shiftsData.filter(s => s.userId === userData.id);
      }
    }

    setShifts(shiftsData);
    console.log('Loaded shifts:', shiftsData.length);
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
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            {user?.category && (
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) }]}>
                <Text style={[styles.categoryText, { color: theme.card }]}>
                  {getCategoryName(user.category)}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.card }]}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
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
            style={[styles.actionCard, { backgroundColor: theme.success }]}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <IconSymbol name="calendar" size={32} color={theme.card} />
            <Text style={[styles.actionText, { color: theme.card }]}>View Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.warning }]}
            onPress={() => router.push('/(tabs)/availability')}
          >
            <IconSymbol name="calendar.badge.plus" size={32} color={theme.card} />
            <Text style={[styles.actionText, { color: theme.card }]}>Book Shifts</Text>
          </TouchableOpacity>

          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.error }]}
              onPress={() => router.push('/(tabs)/admin')}
            >
              <IconSymbol name="person.2" size={32} color={theme.card} />
              <Text style={[styles.actionText, { color: theme.card }]}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Today's Shifts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Shifts</Text>
          {todayShifts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No shifts scheduled for today
              </Text>
            </View>
          ) : (
            todayShifts.map(shift => (
              <View
                key={shift.id}
                style={[
                  styles.shiftCard,
                  { backgroundColor: theme.card, borderLeftColor: shift.color || theme.primary }
                ]}
              >
                <View style={styles.shiftHeader}>
                  <Text style={[styles.shiftDepartment, { color: theme.text }]}>
                    {shift.department}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: shift.status === 'in-progress' ? theme.success : theme.primary }
                  ]}>
                    <Text style={[styles.statusText, { color: theme.card }]}>
                      {shift.status === 'in-progress' ? 'IN PROGRESS' : 'SCHEDULED'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.shiftPosition, { color: theme.textSecondary }]}>
                  {shift.position}
                </Text>
                <View style={styles.shiftTime}>
                  <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                  <Text style={[styles.shiftTimeText, { color: theme.textSecondary }]}>
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </Text>
                </View>
                {shift.notes && (
                  <Text style={[styles.shiftNotes, { color: theme.textSecondary }]}>
                    {shift.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Upcoming Shifts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Shifts</Text>
          {upcomingShifts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No upcoming shifts
              </Text>
            </View>
          ) : (
            upcomingShifts.map(shift => (
              <View
                key={shift.id}
                style={[
                  styles.shiftCard,
                  { backgroundColor: theme.card, borderLeftColor: shift.color || theme.primary }
                ]}
              >
                <View style={styles.shiftHeader}>
                  <Text style={[styles.shiftDate, { color: theme.text }]}>
                    {formatDate(shift.date)}
                  </Text>
                  <Text style={[styles.shiftDepartment, { color: theme.textSecondary }]}>
                    {shift.department}
                  </Text>
                </View>
                <Text style={[styles.shiftPosition, { color: theme.textSecondary }]}>
                  {shift.position}
                </Text>
                <View style={styles.shiftTime}>
                  <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                  <Text style={[styles.shiftTimeText, { color: theme.textSecondary }]}>
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </Text>
                </View>
              </View>
            ))
          )}
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  shiftCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftDepartment: {
    fontSize: 18,
    fontWeight: '600',
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  shiftPosition: {
    fontSize: 14,
    marginBottom: 8,
  },
  shiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftTimeText: {
    fontSize: 14,
  },
  shiftNotes: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
