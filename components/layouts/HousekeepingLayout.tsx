
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

interface HousekeepingLayoutProps {
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

export default function HousekeepingLayout({
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
}: HousekeepingLayoutProps) {
  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Air Quality Data Style Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>
              HOUSEKEEPING
            </Text>
            <Text style={[styles.headerName, { color: theme.text }]}>
              {getUserName()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <IconSymbol name="bell" size={22} color={theme.primary} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Data Card Style */}
        <View style={[styles.dataCard, { backgroundColor: theme.card }]}>
          <View style={styles.dataRow}>
            <View style={styles.dataItem}>
              <IconSymbol name="bed.double.fill" size={32} color={theme.primary} />
              <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>
                Department
              </Text>
              <Text style={[styles.dataValue, { color: theme.text }]}>
                {getCategoryName(user?.category || 'housekeeping')}
              </Text>
            </View>
            <View style={[styles.dataDivider, { backgroundColor: theme.border }]} />
            <View style={styles.dataItem}>
              <IconSymbol name="calendar" size={32} color={theme.secondary} />
              <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>
                Today
              </Text>
              <Text style={[styles.dataValue, { color: theme.text }]}>
                {todayShifts.length} {todayShifts.length === 1 ? 'Shift' : 'Shifts'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Today's Shifts - Data Grid Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Today&apos;s Schedule
        </Text>
        {todayShifts.length > 0 ? (
          todayShifts.map((shift) => (
            <View
              key={shift.id}
              style={[
                styles.dataShiftCard,
                { 
                  backgroundColor: theme.card,
                }
              ]}
            >
              <View style={styles.shiftHeader}>
                <View style={[styles.shiftIcon, { backgroundColor: theme.cardSecondary }]}>
                  <IconSymbol name="bed.double.fill" size={24} color={theme.primary} />
                </View>
                <View style={styles.shiftInfo}>
                  <Text style={[styles.shiftTitle, { color: theme.text }]}>
                    {shift.position}
                  </Text>
                  <Text style={[styles.shiftDepartment, { color: theme.textSecondary }]}>
                    {shift.department}
                  </Text>
                </View>
              </View>
              <View style={styles.shiftMetrics}>
                <View style={styles.metricItem}>
                  <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                  <Text style={[styles.metricText, { color: theme.textSecondary }]}>
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No shifts scheduled
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Enjoy your day off
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions - Grid Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.gridAction, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/time-tracking')}
          >
            <View style={[styles.gridIcon, { backgroundColor: theme.primary }]}>
              <IconSymbol name="clock.fill" size={28} color="#FFFFFF" />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>
              Clock In/Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridAction, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/availability')}
          >
            <View style={[styles.gridIcon, { backgroundColor: theme.secondary }]}>
              <IconSymbol name="calendar.badge.plus" size={28} color={theme.text} />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>
              Book Shift
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridAction, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <View style={[styles.gridIcon, { backgroundColor: theme.cardSecondary }]}>
              <IconSymbol name="calendar" size={28} color={theme.primary} />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>
              Schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridAction, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <View style={[styles.gridIcon, { backgroundColor: theme.cardSecondary }]}>
              <IconSymbol name="doc.text.fill" size={28} color={theme.primary} />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>
              Reports
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Shifts - Timeline Style */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Upcoming Shifts
        </Text>
        {upcomingShifts.length > 0 ? (
          <View style={styles.timeline}>
            {upcomingShifts.map((shift, index) => (
              <View key={shift.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
                  {index < upcomingShifts.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                  )}
                </View>
                <View
                  style={[
                    styles.timelineCard,
                    { 
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    }
                  ]}
                >
                  <View style={styles.timelineHeader}>
                    <Text style={[styles.timelineDate, { color: theme.primary }]}>
                      {formatDate(shift.date)}
                    </Text>
                    <Text style={[styles.timelineTime, { color: theme.textSecondary }]}>
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </Text>
                  </View>
                  <Text style={[styles.timelineTitle, { color: theme.text }]}>
                    {shift.position}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    padding: 18,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(107, 154, 196, 0.12)',
    elevation: 2,
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
  dataCard: {
    borderRadius: 22,
    padding: 24,
    boxShadow: '0px 6px 20px rgba(107, 154, 196, 0.1)',
    elevation: 2,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dataDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  dataShiftCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    boxShadow: '0px 4px 16px rgba(107, 154, 196, 0.08)',
    elevation: 1,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  shiftIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftInfo: {
    flex: 1,
    gap: 4,
  },
  shiftTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  shiftDepartment: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  shiftMetrics: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridAction: {
    width: '48%',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    gap: 14,
    boxShadow: '0px 4px 16px rgba(107, 154, 196, 0.08)',
    elevation: 1,
  },
  gridIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptyCard: {
    borderRadius: 22,
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
