
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
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/app/integrations/supabase/client';
import { LeaveRequest } from '@/types';
import { formatDate } from '@/utils/dateHelpers';

export default function LeaveScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<'vacation' | 'sick' | 'personal' | 'other'>('vacation');
  const [reason, setReason] = useState('');
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    loadLeaveRequests();
  }, [user]);

  useEffect(() => {
    updateMarkedDates();
  }, [leaveRequests, startDate, endDate]);

  const loadLeaveRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get employee ID
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!empData) return;

      // Load leave requests
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', empData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRequests: LeaveRequest[] = (data || []).map(req => ({
        id: req.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        startDate: req.start_date,
        endDate: req.end_date,
        type: req.leave_type,
        status: req.status,
        reason: req.reason,
        createdAt: req.created_at,
      }));

      setLeaveRequests(mappedRequests);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      Alert.alert('Error', 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = () => {
    const marked: any = {};

    // Mark approved leave days
    leaveRequests
      .filter(req => req.status === 'approved')
      .forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          marked[dateStr] = {
            color: '#4CAF50',
            textColor: '#FFFFFF',
            marked: true,
          };
        }
      });

    // Mark pending leave days
    leaveRequests
      .filter(req => req.status === 'pending')
      .forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!marked[dateStr]) {
            marked[dateStr] = {
              color: '#FFA726',
              textColor: '#FFFFFF',
              marked: true,
            };
          }
        }
      });

    // Mark selected dates for new request
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        marked[dateStr] = {
          ...marked[dateStr],
          selected: true,
          selectedColor: theme.primary,
        };
      }
    } else if (startDate) {
      marked[startDate] = {
        ...marked[startDate],
        selected: true,
        selectedColor: theme.primary,
      };
    }

    setMarkedDates(marked);
  };

  const handleDayPress = (day: DateData) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate('');
    } else {
      if (new Date(day.dateString) < new Date(startDate)) {
        setStartDate(day.dateString);
        setEndDate('');
      } else {
        setEndDate(day.dateString);
      }
    }
  };

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate || !user) {
      Alert.alert('Error', 'Please select start and end dates');
      return;
    }

    try {
      setSubmitting(true);

      // Get employee ID
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!empData) {
        Alert.alert('Error', 'Employee profile not found');
        return;
      }

      // Create leave request
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: empData.id,
          start_date: startDate,
          end_date: endDate,
          leave_type: leaveType,
          reason: reason || null,
          status: 'pending',
        });

      if (error) throw error;

      Alert.alert('Success', 'Leave request submitted successfully');
      resetForm();
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      Alert.alert('Error', 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowRequestModal(false);
    setStartDate('');
    setEndDate('');
    setLeaveType('vacation');
    setReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#FF6B6B';
      case 'pending':
        return '#FFA726';
      default:
        return theme.textSecondary;
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'sun.max';
      case 'sick':
        return 'cross.case';
      case 'personal':
        return 'person';
      default:
        return 'calendar';
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Leave Management</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.requestButton]}
            onPress={() => setShowRequestModal(true)}
          >
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
            <Text style={buttonStyles.primaryText}>Request Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Overview */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Calendar</Text>
          <Calendar
            markedDates={markedDates}
            markingType="period"
            theme={{
              backgroundColor: theme.card,
              calendarBackground: theme.card,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              monthTextColor: theme.text,
              arrowColor: theme.primary,
            }}
          />
          
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Approved</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFA726' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Leave Requests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Leave Requests</Text>
          
          {leaveRequests.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No leave requests yet
              </Text>
            </View>
          ) : (
            leaveRequests.map((request) => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.card }]}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestTypeContainer}>
                    <IconSymbol 
                      name={getLeaveTypeIcon(request.type)} 
                      size={24} 
                      color={theme.primary} 
                    />
                    <Text style={[styles.requestType, { color: theme.text }]}>
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.dateRow}>
                    <IconSymbol name="calendar" size={16} color={theme.textSecondary} />
                    <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </Text>
                  </View>
                  <Text style={[styles.daysText, { color: theme.text }]}>
                    {calculateDays(request.startDate, request.endDate)} days
                  </Text>
                </View>

                {request.reason && (
                  <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
                    {request.reason}
                  </Text>
                )}

                <Text style={[styles.submittedText, { color: theme.textSecondary }]}>
                  Submitted {formatDate(request.createdAt)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Request Leave Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Request Leave</Text>
              <TouchableOpacity onPress={resetForm}>
                <IconSymbol name="xmark" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Leave Type Selection */}
              <Text style={[styles.label, { color: theme.text }]}>Leave Type *</Text>
              <View style={styles.typeSelector}>
                {(['vacation', 'sick', 'personal', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      leaveType === type && { borderColor: theme.primary, backgroundColor: theme.primary + '20' }
                    ]}
                    onPress={() => setLeaveType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: theme.text },
                      leaveType === type && { color: theme.primary, fontWeight: '600' }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Selection */}
              <Text style={[styles.label, { color: theme.text }]}>Select Dates *</Text>
              <Text style={[styles.hint, { color: theme.textSecondary }]}>
                Tap to select start date, then tap again for end date
              </Text>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType="period"
                theme={{
                  backgroundColor: theme.card,
                  calendarBackground: theme.card,
                  textSectionTitleColor: theme.text,
                  selectedDayBackgroundColor: theme.primary,
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: theme.primary,
                  dayTextColor: theme.text,
                  textDisabledColor: theme.textSecondary,
                  monthTextColor: theme.text,
                  arrowColor: theme.primary,
                }}
              />

              {startDate && endDate && (
                <View style={[styles.selectedDatesCard, { backgroundColor: theme.background }]}>
                  <Text style={[styles.selectedDatesText, { color: theme.text }]}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </Text>
                  <Text style={[styles.selectedDaysText, { color: theme.primary }]}>
                    {calculateDays(startDate, endDate)} days
                  </Text>
                </View>
              )}

              {/* Reason */}
              <Text style={[styles.label, { color: theme.text }]}>Reason (Optional)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={reason}
                onChangeText={setReason}
                placeholder="Provide a reason for your leave request..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[buttonStyles.primary, styles.submitButton]}
                onPress={handleSubmitRequest}
                disabled={submitting || !startDate || !endDate}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={buttonStyles.primaryText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
    fontSize: 12,
  },
  emptyCard: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  requestCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestType: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestDetails: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
  },
  daysText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reasonText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  submittedText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 24,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 14,
  },
  selectedDatesCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  selectedDatesText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDaysText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
  },
});
