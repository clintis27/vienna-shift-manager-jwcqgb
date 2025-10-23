
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { getUser, saveAvailability, getAvailability, saveShiftRequest, getShiftRequests } from '@/utils/storage';
import { User, AvailabilityDay, ShiftRequest } from '@/types';
import { getCategoryColor } from '@/utils/mockData';

export default function AvailabilityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>({});
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);
    
    if (userData) {
      const availabilities = await getAvailability();
      const requests = await getShiftRequests();
      
      // Filter for current user
      const userAvailabilities = availabilities.filter(a => a.userId === userData.id);
      const userRequests = requests.filter(r => r.userId === userData.id);
      
      setShiftRequests(userRequests);
      
      // Mark available dates
      const marked: { [key: string]: any } = {};
      userAvailabilities.forEach(av => {
        if (av.available) {
          marked[av.date] = {
            selected: true,
            selectedColor: getCategoryColor(userData.category || 'breakfast'),
          };
        }
      });
      
      // Mark requested dates
      userRequests.forEach(req => {
        if (req.status === 'pending') {
          marked[req.date] = {
            ...marked[req.date],
            marked: true,
            dotColor: theme.warning,
          };
        } else if (req.status === 'approved') {
          marked[req.date] = {
            ...marked[req.date],
            marked: true,
            dotColor: theme.success,
          };
        } else if (req.status === 'rejected') {
          marked[req.date] = {
            ...marked[req.date],
            marked: true,
            dotColor: theme.error,
          };
        }
      });
      
      setMarkedDates(marked);
    }
  };

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    const isSelected = selectedDates[dateStr];
    
    setSelectedDates(prev => ({
      ...prev,
      [dateStr]: !isSelected,
    }));
  };

  const handleSaveAvailability = async () => {
    if (!user) return;
    
    const selectedCount = Object.keys(selectedDates).filter(key => selectedDates[key]).length;
    
    if (selectedCount === 0) {
      Alert.alert('No Dates Selected', 'Please select at least one date to mark as available.');
      return;
    }

    // Save availability for each selected date
    for (const dateStr in selectedDates) {
      if (selectedDates[dateStr]) {
        const availability: AvailabilityDay = {
          userId: user.id,
          date: dateStr,
          available: true,
        };
        await saveAvailability(availability);
      }
    }

    Alert.alert('Success', `Marked ${selectedCount} day(s) as available!`);
    setSelectedDates({});
    loadData();
  };

  const handleRequestShift = async () => {
    if (!user || !user.category) return;
    
    const selectedCount = Object.keys(selectedDates).filter(key => selectedDates[key]).length;
    
    if (selectedCount === 0) {
      Alert.alert('No Dates Selected', 'Please select at least one date to request a shift.');
      return;
    }

    // Create shift requests for each selected date
    for (const dateStr in selectedDates) {
      if (selectedDates[dateStr]) {
        const request: ShiftRequest = {
          id: `req-${Date.now()}-${dateStr}`,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          category: user.category,
          date: dateStr,
          startTime: '08:00',
          endTime: '16:00',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        await saveShiftRequest(request);
      }
    }

    Alert.alert('Success', `Requested ${selectedCount} shift(s)! Your admin will review them.`);
    setSelectedDates({});
    loadData();
  };

  const getRequestForDate = (dateStr: string): ShiftRequest | undefined => {
    return shiftRequests.find(req => req.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.warning;
      case 'approved':
        return theme.success;
      case 'rejected':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Availability</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select days you want to work this month
          </Text>
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: theme.card }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getCategoryColor(user?.category || 'breakfast') }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>Approved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.error }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>Rejected</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.card }]}>
          <Calendar
            markedDates={{
              ...markedDates,
              ...Object.keys(selectedDates).reduce((acc, date) => {
                if (selectedDates[date]) {
                  acc[date] = {
                    ...markedDates[date],
                    selected: true,
                    selectedColor: theme.primary,
                  };
                }
                return acc;
              }, {} as { [key: string]: any }),
            }}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: theme.card,
              calendarBackground: theme.card,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: theme.card,
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              monthTextColor: theme.text,
              arrowColor: theme.primary,
            }}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.success }]}
            onPress={handleSaveAvailability}
          >
            <IconSymbol name="checkmark.circle" size={20} color={theme.card} />
            <Text style={[styles.actionButtonText, { color: theme.card }]}>
              Mark as Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={handleRequestShift}
          >
            <IconSymbol name="calendar.badge.plus" size={20} color={theme.card} />
            <Text style={[styles.actionButtonText, { color: theme.card }]}>
              Request Shifts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shift Requests List */}
        {shiftRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Shift Requests</Text>
            {shiftRequests.map(request => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.card }]}>
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestDate, { color: theme.text }]}>
                    {new Date(request.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={[styles.statusText, { color: theme.card }]}>
                      {request.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.requestTime, { color: theme.textSecondary }]}>
                  {request.startTime} - {request.endTime}
                </Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestDate: {
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
  requestTime: {
    fontSize: 14,
  },
});
