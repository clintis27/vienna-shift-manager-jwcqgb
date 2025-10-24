
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

interface FrontDeskLayoutProps {
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

export default function FrontDeskLayout({
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
}: FrontDeskLayoutProps) {
  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Transport Card Style Header */}
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerGreeting, { color: theme.textSecondary }]}>
              Front Desk
            </Text>
            <Text style={[styles.headerName, { color: theme.text }]}>
              {getUserName()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.secondary }]}>
                <Text style={[styles.badgeText, { color: theme.text }]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.categoryBanner, { backgroundColor: theme.cardSecondary }]}>
          <IconSymbol name="person.2.fill" size={24} color={theme.primary} />
          <Text style={[styles.categoryText, { color: theme.text }]}>
            {getCategoryName(user?.category || 'frontdesk')}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
        </View>
      </View>

      {/* Today's Shifts - List Style */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today
          </Text>
          <Text style={[styles.sectionDate, { color: theme.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        
        {todayShifts.length > 0 ? (
          todayShifts.map((shift) => (
            <View
              key={shift.id}
              style={[
                styles.listCard,
                { 
                  backgroundColor: theme.card,
                  borderLeftColor: theme.primary,
                }
              ]}
            >
              <View style={styles.listContent}>
                <View style={[styles.timeBlock, { backgroundColor: theme.cardSecondary }]}>
                  <Text style={[styles.timeText, { color: theme.primary }]}>
                    {formatTime(shift.startTime)}
                  </Text>
                  <View style={[styles.timeDivider, { backgroundColor: theme.border }]} />
                  <Text style={[styles.timeText, { color: theme.primary }]}>
                    {formatTime(shift.endTime)}
                  </Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={[styles.listTitle, { color: theme.text }]}>
                    {shift.position}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>
                    {shift.department}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={18} color={theme.textSecondary} />
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={40} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No shifts scheduled
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions - Compact Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/time-tracking')}
          >
            <IconSymbol name="clock.fill" size={24} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              Clock In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            onPress={() => router.push('/(tabs)/availability')}
          >
            <IconSymbol name="calendar.badge.plus" size={24} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Book Shift
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.cardSecondary }]}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <IconSymbol name="calendar" size={24} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.cardSecondary }]}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <IconSymbol name="doc.text.fill" size={24} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Reports
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Shifts - Compact List */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Upcoming
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
              <View style={[styles.dateTag, { backgroundColor: theme.cardSecondary }]}>
                <Text style={[styles.dateTagDay, { color: theme.primary }]}>
                  {new Date(shift.date).getDate()}
                </Text>
                <Text style={[styles.dateTagMonth, { color: theme.textSecondary }]}>
                  {new Date(shift.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
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
              <IconSymbol name="chevron.right" size={18} color={theme.textSecondary} />
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={40} color={theme.textSecondary} />
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
    padding: 16,
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 4px 16px rgba(255, 107, 90, 0.12)',
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  headerGreeting: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  categoryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionDate: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(255, 107, 90, 0.08)',
    elevation: 1,
    gap: 12,
  },
  listContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timeBlock: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  timeDivider: {
    width: 20,
    height: 1,
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  listSubtitle: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(255, 107, 90, 0.1)',
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  dateTag: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTagDay: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dateTagMonth: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  upcomingInfo: {
    flex: 1,
    gap: 2,
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  upcomingTime: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
