
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { User, Shift } from '@/types';
import { getCategoryName } from '@/utils/mockData';

interface BreakfastLayoutProps {
  user: User | null;
  shifts: Shift[];
  todayShifts: Shift[];
  upcomingShifts: Shift[];
  unreadCount: number;
  refreshing: boolean;
  onRefresh: () => void;
  theme: any;
  formatTime: (time: string) => string;
  formatDate: (dateStr: string) => string;
  getUserName: () => string;
}

export default function BreakfastLayout({
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
}: BreakfastLayoutProps) {
  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section with Plant Shop Style */}
      <View style={[styles.heroSection, { backgroundColor: theme.primary }]}>
        <View style={styles.heroContent}>
          <View style={styles.heroText}>
            <Text style={[styles.heroGreeting, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              Good Morning
            </Text>
            <Text style={[styles.heroName, { color: '#FFFFFF' }]}>
              {getUserName()}
            </Text>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <IconSymbol name="cup.and.saucer.fill" size={16} color="#FFFFFF" />
              <Text style={[styles.heroBadgeText, { color: '#FFFFFF' }]}>
                {getCategoryName(user?.category || 'breakfast')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <IconSymbol name="bell.fill" size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.secondary }]}>
                <Text style={[styles.badgeText, { color: theme.text }]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Shifts - Plant Card Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Today&apos;s Schedule
        </Text>
        {todayShifts.length > 0 ? (
          todayShifts.map((shift) => (
            <View
              key={shift.id}
              style={[
                styles.plantCard,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }
              ]}
            >
              <View style={[styles.plantImagePlaceholder, { backgroundColor: theme.cardSecondary }]}>
                <IconSymbol name="cup.and.saucer.fill" size={40} color={theme.primary} />
              </View>
              <View style={styles.plantInfo}>
                <Text style={[styles.plantTitle, { color: theme.text }]}>
                  {shift.position}
                </Text>
                <Text style={[styles.plantSubtitle, { color: theme.textSecondary }]}>
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </Text>
                <View style={[styles.plantBadge, { backgroundColor: `${theme.primary}30` }]}>
                  <Text style={[styles.plantBadgeText, { color: theme.primary }]}>
                    {shift.department}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No shifts today
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Enjoy your day off!
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions - Rounded Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/time-tracking')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <IconSymbol name="clock.fill" size={28} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
              Clock In
            </Text>
            <IconSymbol name="arrow.right" size={20} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.secondary }]}
            onPress={() => router.push('/(tabs)/availability')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <IconSymbol name="calendar.badge.plus" size={28} color={theme.text} />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>
              Book Shift
            </Text>
            <IconSymbol name="arrow.right" size={20} color={`${theme.text}CC`} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Shifts */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Coming Up
        </Text>
        {upcomingShifts.length > 0 ? (
          upcomingShifts.map((shift) => (
            <View
              key={shift.id}
              style={[
                styles.upcomingCard,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }
              ]}
            >
              <View style={[styles.dateCircle, { backgroundColor: theme.cardSecondary }]}>
                <Text style={[styles.dateDay, { color: theme.primary }]}>
                  {new Date(shift.date).getDate()}
                </Text>
                <Text style={[styles.dateMonth, { color: theme.textSecondary }]}>
                  {new Date(shift.date).toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingTitle, { color: theme.text }]}>
                  {shift.position}
                </Text>
                <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No upcoming shifts
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    padding: 28,
    marginBottom: 24,
    boxShadow: '0px 8px 24px rgba(123, 160, 91, 0.2)',
    elevation: 4,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  heroGreeting: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  heroName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  plantCard: {
    flexDirection: 'row',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    boxShadow: '0px 4px 16px rgba(123, 160, 91, 0.08)',
    elevation: 2,
    gap: 16,
  },
  plantImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  plantTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  plantSubtitle: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  plantBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  plantBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actionsGrid: {
    gap: 16,
  },
  actionCard: {
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0px 6px 20px rgba(123, 160, 91, 0.15)',
    elevation: 3,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    gap: 16,
  },
  dateCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingInfo: {
    flex: 1,
    gap: 4,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  upcomingTime: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  emptyCard: {
    borderRadius: 28,
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
});
