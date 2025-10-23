
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
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { User, Shift } from '@/types';
import { colors, darkColors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateMockShifts } from '@/utils/mockData';
import React, { useState, useEffect } from 'react';
import { getCategoryColor, getCategoryName } from '@/utils/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser, getShifts, saveShifts, getNotifications } from '@/utils/storage';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? darkColors : colors;

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

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: currentColors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[commonStyles.title, { color: currentColors.text, fontSize: 28 }]}>
              {getUserName()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: currentColors.card }]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <IconSymbol name="bell" size={22} color={currentColors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: currentColors.terracotta }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Badge */}
        <View style={[
          styles.categoryCard,
          { 
            backgroundColor: getCategoryColor(user?.category || 'breakfast'),
          }
        ]}>
          <View style={styles.categoryContent}>
            <IconSymbol 
              name={
                user?.category === 'breakfast' ? 'cup.and.saucer.fill' :
                user?.category === 'housekeeping' ? 'bed.double.fill' :
                'person.2.fill'
              } 
              size={28} 
              color={currentColors.text} 
            />
            <View style={styles.categoryText}>
              <Text style={[styles.categoryLabel, { color: currentColors.textSecondary }]}>
                Department
              </Text>
              <Text style={[styles.categoryName, { color: currentColors.text }]}>
                {getCategoryName(user?.category || 'breakfast')}
              </Text>
            </View>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
            <Text style={[styles.categoryBadgeText, { color: currentColors.text }]}>
              {user?.role === 'admin' ? 'Admin' : 'Employee'}
            </Text>
          </View>
        </View>

        {/* Today's Shifts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[commonStyles.subtitle, { color: currentColors.text, fontSize: 20 }]}>
              Today&apos;s Shifts
            </Text>
            <Text style={[commonStyles.textSecondary, { fontSize: 13 }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>

          {todayShifts.length > 0 ? (
            todayShifts.map((shift) => (
              <View
                key={shift.id}
                style={[
                  styles.shiftCard,
                  { 
                    backgroundColor: currentColors.card,
                    borderLeftWidth: 4,
                    borderLeftColor: getCategoryColor(shift.category),
                  }
                ]}
              >
                <View style={styles.shiftHeader}>
                  <View style={styles.shiftInfo}>
                    <Text style={[styles.shiftTitle, { color: currentColors.text }]}>
                      {shift.position}
                    </Text>
                    <Text style={[styles.shiftTime, { color: currentColors.textSecondary }]}>
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </Text>
                  </View>
                  <View style={[
                    styles.shiftBadge,
                    { backgroundColor: `${getCategoryColor(shift.category)}40` }
                  ]}>
                    <Text style={[styles.shiftBadgeText, { color: currentColors.text }]}>
                      {shift.department}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <IconSymbol name="calendar" size={40} color={currentColors.textTertiary} />
              <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                No shifts scheduled for today
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text, fontSize: 20, marginBottom: 16 }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: currentColors.sage }]}
              onPress={() => router.push('/(tabs)/time-tracking')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <IconSymbol name="clock.fill" size={24} color={currentColors.text} />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                Clock In/Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: currentColors.terracotta }]}
              onPress={() => router.push('/(tabs)/availability')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <IconSymbol name="calendar.badge.plus" size={24} color={currentColors.text} />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                Book Shifts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: currentColors.dustyBlue }]}
              onPress={() => router.push('/(tabs)/schedule')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <IconSymbol name="calendar" size={24} color={currentColors.text} />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                View Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: currentColors.cream }]}
              onPress={() => router.push('/(tabs)/reports')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <IconSymbol name="doc.text.fill" size={24} color={currentColors.text} />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                Reports
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Shifts */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[commonStyles.subtitle, { color: currentColors.text, fontSize: 20, marginBottom: 16 }]}>
            Upcoming Shifts
          </Text>
          {upcomingShifts.length > 0 ? (
            upcomingShifts.map((shift) => (
              <View
                key={shift.id}
                style={[
                  styles.upcomingCard,
                  { 
                    backgroundColor: currentColors.card,
                    borderWidth: 1,
                    borderColor: currentColors.border,
                  }
                ]}
              >
                <View style={[
                  styles.dateCircle,
                  { backgroundColor: `${getCategoryColor(shift.category)}30` }
                ]}>
                  <Text style={[styles.dateDay, { color: currentColors.text }]}>
                    {new Date(shift.date).getDate()}
                  </Text>
                  <Text style={[styles.dateMonth, { color: currentColors.textSecondary }]}>
                    {new Date(shift.date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={[styles.upcomingTitle, { color: currentColors.text }]}>
                    {shift.position}
                  </Text>
                  <Text style={[styles.upcomingTime, { color: currentColors.textSecondary }]}>
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </Text>
                  <Text style={[styles.upcomingLocation, { color: currentColors.textSecondary }]}>
                    {shift.department}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <IconSymbol name="calendar" size={40} color={currentColors.textTertiary} />
              <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                No upcoming shifts
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(45, 45, 45, 0.06)',
    elevation: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 6px 20px rgba(45, 45, 45, 0.08)',
    elevation: 2,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryText: {
    gap: 2,
  },
  categoryLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shiftCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    boxShadow: '0px 4px 16px rgba(45, 45, 45, 0.04)',
    elevation: 1,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftInfo: {
    flex: 1,
    gap: 4,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  shiftTime: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  shiftBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  shiftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0px 4px 16px rgba(45, 45, 45, 0.04)',
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 6px 20px rgba(45, 45, 45, 0.08)',
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  upcomingCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingInfo: {
    flex: 1,
    gap: 2,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  upcomingTime: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  upcomingLocation: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
});
