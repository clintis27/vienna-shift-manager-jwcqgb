
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { getUser, getShiftRequests, updateShiftRequest, saveShifts, getShifts } from '@/utils/storage';
import { notifyApproval, notifyShiftChange } from '@/utils/notifications';
import { User, ShiftRequest, Shift, EmployeeCategory } from '@/types';
import { getCategoryColor, getCategoryName, mockUsers } from '@/utils/mockData';
import { Calendar, DateData } from 'react-native-calendars';

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showManageShiftsModal, setShowManageShiftsModal] = useState(false);
  
  // Add shift form state
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [shiftNotes, setShiftNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    let allRequests = await getShiftRequests();
    
    // Filter requests based on admin category
    if (userData?.role === 'admin' && userData.category) {
      allRequests = allRequests.filter(r => r.category === userData.category);
    }

    // Show only pending requests
    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    setRequests(pendingRequests);
    
    // Load all shifts for this category
    let shifts = await getShifts();
    if (userData?.role === 'admin' && userData.category) {
      shifts = shifts.filter(s => s.category === userData.category);
    }
    setAllShifts(shifts);
    
    console.log('Loaded shift requests:', pendingRequests.length);
    console.log('Loaded shifts:', shifts.length);
  };

  const handleApprove = async (request: ShiftRequest) => {
    Alert.alert(
      'Approve Request',
      `Approve shift request for ${request.userName} on ${request.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            // Update request status
            await updateShiftRequest(request.id, { status: 'approved' });

            // Create a new shift
            const shifts = await getShifts();
            const newShift: Shift = {
              id: `shift-${Date.now()}`,
              userId: request.userId,
              userName: request.userName,
              department: getCategoryName(request.category),
              category: request.category,
              startTime: request.startTime,
              endTime: request.endTime,
              date: request.date,
              status: 'scheduled',
              position: 'Staff',
              color: getCategoryColor(request.category),
              notes: request.notes,
            };
            await saveShifts([...shifts, newShift]);

            // Send notifications
            const shiftDetails = `${request.date} ${request.startTime}-${request.endTime}`;
            await notifyApproval(request.userId, 'shift', 'approved', shiftDetails);
            await notifyShiftChange(request.userId, request.userName, 'new', shiftDetails);

            Alert.alert('Success', 'Shift request approved and scheduled!');
            await loadData();
          },
        },
      ]
    );
  };

  const handleReject = async (request: ShiftRequest) => {
    Alert.alert(
      'Reject Request',
      `Reject shift request for ${request.userName} on ${request.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updateShiftRequest(request.id, { status: 'rejected' });

            // Send notification
            const shiftDetails = `${request.date} ${request.startTime}-${request.endTime}`;
            await notifyApproval(request.userId, 'shift', 'rejected', shiftDetails);

            Alert.alert('Request Rejected', 'The shift request has been rejected.');
            await loadData();
          },
        },
      ]
    );
  };

  const handleAddShift = async () => {
    if (!selectedEmployee || !selectedDate) {
      Alert.alert('Error', 'Please select an employee and date');
      return;
    }

    if (!user?.category) {
      Alert.alert('Error', 'Admin category not found');
      return;
    }

    const shifts = await getShifts();
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      userId: selectedEmployee.id,
      userName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      department: getCategoryName(user.category),
      category: user.category,
      startTime,
      endTime,
      date: selectedDate,
      status: 'scheduled',
      position: 'Staff',
      color: getCategoryColor(user.category),
      notes: shiftNotes,
    };

    await saveShifts([...shifts, newShift]);

    // Send notification to employee
    const shiftDetails = `${selectedDate} ${startTime}-${endTime}`;
    await notifyShiftChange(selectedEmployee.id, newShift.userName, 'new', shiftDetails);

    Alert.alert('Success', 'Shift added successfully!');
    
    // Reset form
    setSelectedEmployee(null);
    setSelectedDate('');
    setStartTime('08:00');
    setEndTime('16:00');
    setShiftNotes('');
    setShowAddShiftModal(false);
    
    await loadData();
  };

  const handleDeleteShift = async (shift: Shift) => {
    Alert.alert(
      'Delete Shift',
      `Are you sure you want to delete the shift for ${shift.userName} on ${shift.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const shifts = await getShifts();
            const updatedShifts = shifts.filter(s => s.id !== shift.id);
            await saveShifts(updatedShifts);

            // Send notification to employee
            const shiftDetails = `${shift.date} ${shift.startTime}-${shift.endTime}`;
            await notifyShiftChange(shift.userId, shift.userName, 'cancelled', shiftDetails);

            Alert.alert('Success', 'Shift deleted successfully!');
            await loadData();
          },
        },
      ]
    );
  };

  const getEmployeesForCategory = (): User[] => {
    if (!user?.category) return [];
    return mockUsers.filter(u => u.category === user.category && u.role === 'employee');
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Admin Panel
          </Text>
          {user?.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) }]}>
              <Text style={[styles.categoryText, { color: theme.card }]}>
                {getCategoryName(user.category).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[buttonStyles.pastelBlue, styles.actionBtn]}
          onPress={() => setShowAddShiftModal(true)}
        >
          <IconSymbol name="plus.circle.fill" size={20} color={theme.text} />
          <Text style={[buttonStyles.text, { color: theme.text }]}>
            Add Shift
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.pastelPurple, styles.actionBtn]}
          onPress={() => setShowManageShiftsModal(true)}
        >
          <IconSymbol name="list.bullet" size={20} color={theme.text} />
          <Text style={[buttonStyles.text, { color: theme.text }]}>
            Manage Shifts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pending Requests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Pending Shift Requests ({requests.length})
          </Text>

          {requests.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <IconSymbol name="checkmark.circle" size={64} color={theme.success} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                All Caught Up!
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No pending shift requests at the moment
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.requestHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(request.category) }]} />
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestName, { color: theme.text }]}>
                      {request.userName}
                    </Text>
                    <Text style={[styles.requestCategory, { color: theme.textSecondary }]}>
                      {getCategoryName(request.category)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="calendar" size={16} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {formatDate(request.date)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {request.startTime} - {request.endTime}
                    </Text>
                  </View>
                </View>

                {request.notes && (
                  <View style={[styles.notesContainer, { backgroundColor: theme.background }]}>
                    <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                      {request.notes}
                    </Text>
                  </View>
                )}

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[buttonStyles.pastelMint, styles.actionButton]}
                    onPress={() => handleApprove(request)}
                  >
                    <IconSymbol name="checkmark" size={20} color={theme.text} />
                    <Text style={[buttonStyles.text, { color: theme.text }]}>
                      Approve
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.pastelPink, styles.actionButton]}
                    onPress={() => handleReject(request)}
                  >
                    <IconSymbol name="xmark" size={20} color={theme.text} />
                    <Text style={[buttonStyles.text, { color: theme.text }]}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Shift Modal */}
      <Modal
        visible={showAddShiftModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddShiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Add New Shift
              </Text>
              <TouchableOpacity onPress={() => setShowAddShiftModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Employee Selection */}
              <Text style={[styles.label, { color: theme.text }]}>Select Employee</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeList}>
                {getEmployeesForCategory().map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.employeeCard,
                      { backgroundColor: theme.background },
                      selectedEmployee?.id === emp.id && { 
                        backgroundColor: getCategoryColor(user?.category || 'breakfast'),
                        borderWidth: 2,
                        borderColor: theme.text,
                      }
                    ]}
                    onPress={() => setSelectedEmployee(emp)}
                  >
                    <Text style={[
                      styles.employeeName,
                      { color: theme.text },
                      selectedEmployee?.id === emp.id && { fontWeight: '700' }
                    ]}>
                      {emp.firstName} {emp.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Date Selection */}
              <Text style={[styles.label, { color: theme.text }]}>Select Date</Text>
              <Calendar
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: getCategoryColor(user?.category || 'breakfast') }
                }}
                theme={{
                  backgroundColor: theme.card,
                  calendarBackground: theme.card,
                  textSectionTitleColor: theme.text,
                  selectedDayBackgroundColor: getCategoryColor(user?.category || 'breakfast'),
                  selectedDayTextColor: theme.card,
                  todayTextColor: getCategoryColor(user?.category || 'breakfast'),
                  dayTextColor: theme.text,
                  textDisabledColor: theme.textSecondary,
                  monthTextColor: theme.text,
                  arrowColor: theme.text,
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />

              {/* Time Selection */}
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={[styles.label, { color: theme.text }]}>Start Time</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="08:00"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
                <View style={styles.timeInput}>
                  <Text style={[styles.label, { color: theme.text }]}>End Time</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="16:00"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>

              {/* Notes */}
              <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                value={shiftNotes}
                onChangeText={setShiftNotes}
                placeholder="Add any notes about this shift..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />

              {/* Add Button */}
              <TouchableOpacity
                style={[buttonStyles.pastelMint, styles.submitButton]}
                onPress={handleAddShift}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color={theme.text} />
                <Text style={[buttonStyles.text, { color: theme.text }]}>
                  Add Shift
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manage Shifts Modal */}
      <Modal
        visible={showManageShiftsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManageShiftsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Manage Shifts
              </Text>
              <TouchableOpacity onPress={() => setShowManageShiftsModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {allShifts.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.background }]}>
                  <IconSymbol name="calendar.badge.exclamationmark" size={64} color={theme.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No Shifts Found
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    Add shifts to get started
                  </Text>
                </View>
              ) : (
                allShifts.map((shift) => (
                  <View
                    key={shift.id}
                    style={[styles.shiftCard, { backgroundColor: theme.background }]}
                  >
                    <View style={styles.shiftHeader}>
                      <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(shift.category) }]} />
                      <View style={styles.shiftInfo}>
                        <Text style={[styles.shiftName, { color: theme.text }]}>
                          {shift.userName}
                        </Text>
                        <Text style={[styles.shiftDate, { color: theme.textSecondary }]}>
                          {formatDate(shift.date)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: theme.card }]}
                        onPress={() => handleDeleteShift(shift)}
                      >
                        <IconSymbol name="trash" size={20} color={theme.error} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.shiftDetails}>
                      <View style={styles.detailRow}>
                        <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                        <Text style={[styles.detailText, { color: theme.text }]}>
                          {shift.startTime} - {shift.endTime}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: theme.card }]}>
                        <Text style={[styles.statusText, { color: theme.text }]}>
                          {shift.status}
                        </Text>
                      </View>
                    </View>

                    {shift.notes && (
                      <Text style={[styles.shiftNotes, { color: theme.textSecondary }]}>
                        {shift.notes}
                      </Text>
                    )}
                  </View>
                ))
              )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scrollContent: {
    padding: 24,
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
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  requestCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 15,
    fontWeight: '500',
  },
  notesContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalBody: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  employeeList: {
    marginBottom: 8,
  },
  employeeCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shiftCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  shiftNotes: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
