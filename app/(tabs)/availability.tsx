
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
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { Calendar, DateData } from 'react-native-calendars';
import { getUser, saveAvailability, getAvailability, saveShiftRequest, getShiftRequests } from '@/utils/storage';
import { getCategoryColor } from '@/utils/mockData';
import { User, AvailabilityDay, ShiftRequest } from '@/types';

export default function AvailabilityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>({});
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [requests, setRequests] = useState<ShiftRequest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    const availabilityData = await getAvailability();
    setAvailability(availabilityData);

    const requestsData = await getShiftRequests();
    const userRequests = requestsData.filter(r => r.employeeId === userData?.id);
    setRequests(userRequests);

    const marked: { [key: string]: any } = {};
    userRequests.forEach(request => {
      marked[request.date] = {
        marked: true,
        dotColor: getStatusColor(request.status),
        selected: false,
      };
    });

    setSelectedDates(marked);
    console.log('Loaded availability and requests');
  };

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    const newSelected = { ...selectedDates };

    if (newSelected[dateStr]?.selected) {
      delete newSelected[dateStr];
    } else {
      newSelected[dateStr] = {
        selected: true,
        selectedColor: theme.pastelBlue,
        marked: newSelected[dateStr]?.marked,
        dotColor: newSelected[dateStr]?.dotColor,
      };
    }

    setSelectedDates(newSelected);
  };

  const handleRequestShift = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    const selectedDatesList = Object.keys(selectedDates).filter(
      date => selectedDates[date].selected
    );

    if (selectedDatesList.length === 0) {
      Alert.alert('No Dates Selected', 'Please select at least one date to request a shift.');
      return;
    }

    const newRequests: ShiftRequest[] = selectedDatesList.map(date => ({
      id: `request-${Date.now()}-${Math.random()}`,
      employeeId: user.id,
      date,
      status: 'pending',
      category: user.category!,
      createdAt: new Date().toISOString(),
    }));

    const allRequests = await getShiftRequests();
    await saveShiftRequest([...allRequests, ...newRequests]);

    Alert.alert(
      'Success',
      `Shift request${selectedDatesList.length > 1 ? 's' : ''} submitted for ${selectedDatesList.length} day${selectedDatesList.length > 1 ? 's' : ''}`
    );

    await loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.success;
      case 'rejected':
        return theme.error;
      default:
        return theme.warning;
    }
  };

  const getRequestForDate = (dateStr: string): ShiftRequest | undefined => {
    return requests.find(r => r.date === dateStr);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Book Your Shifts
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select dates you&apos;d like to work
          </Text>
        </View>

        {/* Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.card }]}>
          <Calendar
            markedDates={selectedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: theme.card,
              calendarBackground: theme.card,
              textSectionTitleColor: theme.textSecondary,
              selectedDayBackgroundColor: theme.pastelBlue,
              selectedDayTextColor: theme.text,
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textTertiary,
              dotColor: theme.primary,
              selectedDotColor: theme.text,
              arrowColor: theme.primary,
              monthTextColor: theme.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Request Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, styles.requestButton]}
          onPress={handleRequestShift}
          activeOpacity={0.8}
        >
          <IconSymbol name="calendar.badge.plus" size={20} color="#FFFFFF" />
          <Text style={[buttonStyles.textWhite, { marginLeft: 8 }]}>
            Request Selected Shifts
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.pastelYellow }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {pendingRequests.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Pending</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.pastelMint }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {approvedRequests.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Approved</Text>
          </View>
        </View>

        {/* Recent Requests */}
        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Requests
            </Text>
            {requests.slice(0, 10).map(request => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.requestHeader}>
                  <View style={[
                    styles.requestIcon,
                    { 
                      backgroundColor: request.status === 'approved' 
                        ? theme.pastelMint 
                        : request.status === 'rejected'
                        ? theme.error + '20'
                        : theme.pastelYellow
                    }
                  ]}>
                    <IconSymbol 
                      name={
                        request.status === 'approved' 
                          ? 'checkmark.circle' 
                          : request.status === 'rejected'
                          ? 'xmark.circle'
                          : 'clock'
                      } 
                      size={20} 
                      color={
                        request.status === 'approved'
                          ? theme.text
                          : request.status === 'rejected'
                          ? theme.error
                          : theme.text
                      } 
                    />
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestDate, { color: theme.text }]}>
                      {new Date(request.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={[styles.requestStatus, { color: theme.textSecondary }]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol name="calendar" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Requests Yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Select dates on the calendar to request shifts
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  calendarContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  calendar: {
    borderRadius: 16,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '600',
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
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestDate: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestStatus: {
    fontSize: 15,
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
