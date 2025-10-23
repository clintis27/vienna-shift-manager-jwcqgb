
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { getShifts } from '@/utils/storage';
import { Shift } from '@/types';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    const shiftsData = await getShifts();
    setShifts(shiftsData);
    console.log('Loaded shifts:', shiftsData.length);
  };

  const getWeekDates = () => {
    const dates = [];
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current.setDate(diff + i));
      dates.push(date);
    }
    return dates;
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDates = getWeekDates();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Schedule</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'week' && { backgroundColor: theme.primary }
            ]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[
              styles.toggleText,
              { color: viewMode === 'week' ? theme.card : theme.textSecondary }
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'month' && { backgroundColor: theme.primary }
            ]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[
              styles.toggleText,
              { color: viewMode === 'month' ? theme.card : theme.textSecondary }
            ]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Week View */}
        {viewMode === 'week' && (
          <View style={styles.weekView}>
            {weekDates.map((date, index) => {
              const dayShifts = getShiftsForDate(date);
              const today = isToday(date);

              return (
                <View key={index} style={styles.dayContainer}>
                  <View style={[
                    styles.dayHeader,
                    today && { backgroundColor: theme.primary }
                  ]}>
                    <Text style={[
                      styles.dayName,
                      { color: today ? theme.card : theme.textSecondary }
                    ]}>
                      {formatDay(date)}
                    </Text>
                    <Text style={[
                      styles.dayDate,
                      { color: today ? theme.card : theme.text }
                    ]}>
                      {date.getDate()}
                    </Text>
                  </View>

                  <View style={styles.shiftsContainer}>
                    {dayShifts.length > 0 ? (
                      dayShifts.map((shift) => (
                        <View
                          key={shift.id}
                          style={[
                            styles.shiftItem,
                            { backgroundColor: theme.card, borderLeftColor: shift.color || theme.primary }
                          ]}
                        >
                          <Text style={[styles.shiftTime, { color: theme.text }]}>
                            {shift.startTime}
                          </Text>
                          <Text style={[styles.shiftDept, { color: theme.textSecondary }]}>
                            {shift.department}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={[styles.noShift, { backgroundColor: theme.card }]}>
                        <Text style={[styles.noShiftText, { color: theme.textSecondary }]}>
                          Off
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Month View - List of all shifts */}
        {viewMode === 'month' && (
          <View style={styles.monthView}>
            {shifts.map((shift) => (
              <View
                key={shift.id}
                style={[
                  styles.monthShiftCard,
                  { backgroundColor: theme.card, borderLeftColor: shift.color || theme.primary }
                ]}
              >
                <View style={styles.monthShiftHeader}>
                  <Text style={[styles.monthShiftDate, { color: theme.primary }]}>
                    {formatDate(new Date(shift.date))}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: shift.status === 'in-progress' ? theme.success : theme.accent }
                  ]}>
                    <Text style={[styles.statusText, { color: theme.card }]}>
                      {shift.status === 'in-progress' ? 'Active' : 'Scheduled'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.monthShiftDept, { color: theme.text }]}>
                  {shift.department}
                </Text>
                <Text style={[styles.monthShiftPosition, { color: theme.textSecondary }]}>
                  {shift.position}
                </Text>
                <View style={styles.monthShiftTime}>
                  <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                  <Text style={[styles.monthShiftTimeText, { color: theme.textSecondary }]}>
                    {shift.startTime} - {shift.endTime}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  weekView: {
    gap: 12,
  },
  dayContainer: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '700',
  },
  shiftsContainer: {
    gap: 8,
  },
  shiftItem: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shiftDept: {
    fontSize: 14,
  },
  noShift: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  noShiftText: {
    fontSize: 14,
    fontWeight: '500',
  },
  monthView: {
    gap: 12,
  },
  monthShiftCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  monthShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthShiftDate: {
    fontSize: 14,
    fontWeight: '600',
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
  monthShiftDept: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  monthShiftPosition: {
    fontSize: 14,
    marginBottom: 8,
  },
  monthShiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthShiftTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
