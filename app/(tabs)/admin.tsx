
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
import { getCategoryColor, getCategoryName } from '@/utils/mockData';
import { notifyApproval, notifyShiftChange } from '@/utils/notifications';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { Calendar, DateData } from 'react-native-calendars';
import React, { useState, useEffect, useCallback } from 'react';
import { getUser, getShiftRequests, updateShiftRequest, saveShifts, getShifts } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShiftRequest, Shift, EmployeeCategory, Employee } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';

export default function AdminScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = isDark ? darkColors : colors;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getUser();
      setUser(currentUser);

      if (currentUser?.role === 'admin') {
        // Load employees from Supabase
        await loadEmployees();
        
        // Load shift requests
        const allRequests = await getShiftRequests();
        const filteredRequests = currentUser.category
          ? allRequests.filter(r => r.category === currentUser.category)
          : allRequests;
        setRequests(filteredRequests);

        // Load shifts
        const allShifts = await getShifts();
        const filteredShifts = currentUser.category
          ? allShifts.filter(s => s.category === currentUser.category)
          : allShifts;
        setShifts(filteredShifts);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error loading employees:', error);
        return;
      }

      if (data) {
        const mappedEmployees: Employee[] = data.map(emp => ({
          id: emp.id,
          userId: emp.user_id || undefined,
          email: emp.email,
          firstName: emp.first_name,
          lastName: emp.last_name,
          role: emp.role as 'admin' | 'manager' | 'employee',
          category: emp.category as EmployeeCategory | undefined,
          department: emp.department || undefined,
          phoneNumber: emp.phone_number || undefined,
          avatarUrl: emp.avatar_url || undefined,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at,
        }));
        setEmployees(mappedEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleApprove = async (request: ShiftRequest) => {
    try {
      const updatedRequest = { ...request, status: 'approved' as const };
      await updateShiftRequest(updatedRequest);

      // Create a shift from the approved request
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
        notes: request.notes,
        color: getCategoryColor(request.category),
      };

      const allShifts = await getShifts();
      await saveShifts([...allShifts, newShift]);

      await notifyApproval(request.userId, 'shift', 'approved', `Shift on ${formatDate(request.date)}`);
      
      Alert.alert('Success', 'Shift request approved');
      loadData();
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const handleReject = async (request: ShiftRequest) => {
    try {
      const updatedRequest = { ...request, status: 'rejected' as const };
      await updateShiftRequest(updatedRequest);
      await notifyApproval(request.userId, 'shift', 'rejected', `Shift on ${formatDate(request.date)}`);
      
      Alert.alert('Success', 'Shift request rejected');
      loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const handleAddShift = async () => {
    if (!selectedEmployee || !selectedDate || !startTime || !endTime || !position) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const category = selectedEmployee.category || 'breakfast';
      
      // Add shift to Supabase
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          employee_id: selectedEmployee.id,
          department: selectedEmployee.department || getCategoryName(category),
          category: category,
          start_time: startTime,
          end_time: endTime,
          date: selectedDate,
          status: 'scheduled',
          position: position,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding shift:', error);
        Alert.alert('Error', 'Failed to add shift');
        return;
      }

      // Also save to local storage for backward compatibility
      const newShift: Shift = {
        id: data.id,
        userId: selectedEmployee.userId || selectedEmployee.id,
        userName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        department: selectedEmployee.department || getCategoryName(category),
        category: category,
        startTime: startTime,
        endTime: endTime,
        date: selectedDate,
        status: 'scheduled',
        position: position,
        notes: notes,
        color: getCategoryColor(category),
      };

      const allShifts = await getShifts();
      await saveShifts([...allShifts, newShift]);

      if (selectedEmployee.userId) {
        await notifyShiftChange(
          selectedEmployee.userId,
          `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
          'new',
          `${position} on ${formatDate(selectedDate)} from ${startTime} to ${endTime}`
        );
      }

      Alert.alert('Success', 'Shift added successfully');
      setShowAddShiftModal(false);
      resetShiftForm();
      loadData();
    } catch (error) {
      console.error('Error adding shift:', error);
      Alert.alert('Error', 'Failed to add shift');
    }
  };

  const handleDeleteShift = async (shift: Shift) => {
    Alert.alert(
      'Delete Shift',
      'Are you sure you want to delete this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from Supabase
              const { error } = await supabase
                .from('shifts')
                .delete()
                .eq('id', shift.id);

              if (error) {
                console.error('Error deleting shift:', error);
              }

              // Delete from local storage
              const allShifts = await getShifts();
              const updatedShifts = allShifts.filter(s => s.id !== shift.id);
              await saveShifts(updatedShifts);

              await notifyShiftChange(shift.userId, shift.userName, 'cancelled', `${shift.position} on ${formatDate(shift.date)}`);
              
              Alert.alert('Success', 'Shift deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting shift:', error);
              Alert.alert('Error', 'Failed to delete shift');
            }
          },
        },
      ]
    );
  };

  const resetShiftForm = () => {
    setSelectedDate('');
    setSelectedEmployee(null);
    setStartTime('09:00');
    setEndTime('17:00');
    setPosition('');
    setNotes('');
  };

  const getEmployeesForCategory = () => {
    if (!user?.category) {
      return employees;
    }
    return employees.filter(emp => emp.category === user.category);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'approved':
        return '#66BB6A';
      case 'rejected':
        return '#EF5350';
      default:
        return currentColors.text;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={currentColors.error} />
          <Text style={[styles.errorText, { color: currentColors.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.errorSubtext, { color: currentColors.textSecondary }]}>
            You need admin privileges to access this page
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableEmployees = getEmployeesForCategory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentColors.text }]}>Admin Panel</Text>
          {user.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) + '20' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(user.category) }]}>
                {getCategoryName(user.category)}
              </Text>
            </View>
          )}
        </View>

        {/* Employees Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Employees ({availableEmployees.length})
            </Text>
          </View>
          
          {availableEmployees.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <IconSymbol name="person.2" size={32} color={currentColors.textSecondary} />
              <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                No employees found
              </Text>
            </View>
          ) : (
            availableEmployees.map((employee) => (
              <View key={employee.id} style={[styles.employeeCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.employeeInfo}>
                  <View style={[styles.employeeAvatar, { backgroundColor: currentColors.primary + '20' }]}>
                    <Text style={[styles.employeeInitials, { color: currentColors.primary }]}>
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.employeeDetails}>
                    <Text style={[styles.employeeName, { color: currentColors.text }]}>
                      {employee.firstName} {employee.lastName}
                    </Text>
                    <Text style={[styles.employeeEmail, { color: currentColors.textSecondary }]}>
                      {employee.email}
                    </Text>
                    {employee.department && (
                      <Text style={[styles.employeeDepartment, { color: currentColors.textSecondary }]}>
                        {employee.department}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: employee.role === 'admin' ? '#EF5350' : '#66BB6A' }]}>
                  <Text style={styles.roleBadgeText}>{employee.role}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Shift Requests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Shift Requests
            </Text>
          </View>

          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <IconSymbol name="checkmark.circle" size={32} color={currentColors.textSecondary} />
              <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                No pending requests
              </Text>
            </View>
          ) : (
            requests
              .filter(r => r.status === 'pending')
              .map((request) => (
                <View key={request.id} style={[styles.requestCard, { backgroundColor: currentColors.card }]}>
                  <View style={styles.requestHeader}>
                    <Text style={[styles.requestName, { color: currentColors.text }]}>
                      {request.userName}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(request.category) + '20' }]}>
                      <Text style={[styles.categoryText, { color: getCategoryColor(request.category) }]}>
                        {getCategoryName(request.category)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestDetails}>
                    <View style={styles.requestRow}>
                      <IconSymbol name="calendar" size={16} color={currentColors.textSecondary} />
                      <Text style={[styles.requestText, { color: currentColors.textSecondary }]}>
                        {formatDate(request.date)}
                      </Text>
                    </View>
                    <View style={styles.requestRow}>
                      <IconSymbol name="clock" size={16} color={currentColors.textSecondary} />
                      <Text style={[styles.requestText, { color: currentColors.textSecondary }]}>
                        {request.startTime} - {request.endTime}
                      </Text>
                    </View>
                  </View>
                  {request.notes && (
                    <Text style={[styles.requestNotes, { color: currentColors.textSecondary }]}>
                      {request.notes}
                    </Text>
                  )}
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[buttonStyles.secondary, styles.actionButton, { borderColor: '#EF5350' }]}
                      onPress={() => handleReject(request)}
                    >
                      <Text style={[buttonStyles.secondaryText, { color: '#EF5350' }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.actionButton, { backgroundColor: '#66BB6A' }]}
                      onPress={() => handleApprove(request)}
                    >
                      <Text style={buttonStyles.primaryText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* Manage Shifts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Manage Shifts
            </Text>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.addButton]}
              onPress={() => setShowAddShiftModal(true)}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={buttonStyles.primaryText}>Add Shift</Text>
            </TouchableOpacity>
          </View>

          {shifts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: currentColors.card }]}>
              <IconSymbol name="calendar" size={32} color={currentColors.textSecondary} />
              <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                No shifts scheduled
              </Text>
            </View>
          ) : (
            shifts.slice(0, 10).map((shift) => (
              <View key={shift.id} style={[styles.shiftCard, { backgroundColor: currentColors.card }]}>
                <View style={styles.shiftHeader}>
                  <View>
                    <Text style={[styles.shiftName, { color: currentColors.text }]}>
                      {shift.userName}
                    </Text>
                    <Text style={[styles.shiftPosition, { color: currentColors.textSecondary }]}>
                      {shift.position}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteShift(shift)}
                  >
                    <IconSymbol name="trash" size={20} color="#EF5350" />
                  </TouchableOpacity>
                </View>
                <View style={styles.shiftDetails}>
                  <View style={styles.shiftRow}>
                    <IconSymbol name="calendar" size={16} color={currentColors.textSecondary} />
                    <Text style={[styles.shiftText, { color: currentColors.textSecondary }]}>
                      {formatDate(shift.date)}
                    </Text>
                  </View>
                  <View style={styles.shiftRow}>
                    <IconSymbol name="clock" size={16} color={currentColors.textSecondary} />
                    <Text style={[styles.shiftText, { color: currentColors.textSecondary }]}>
                      {shift.startTime} - {shift.endTime}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shift.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(shift.status) }]}>
                    {shift.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Shift Modal */}
      <Modal
        visible={showAddShiftModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddShiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Add New Shift</Text>
              <TouchableOpacity onPress={() => setShowAddShiftModal(false)}>
                <IconSymbol name="xmark" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Employee Selection */}
              <Text style={[styles.label, { color: currentColors.text }]}>Employee *</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}
                onPress={() => setShowEmployeeSelector(true)}
              >
                <Text style={[styles.inputText, { color: selectedEmployee ? currentColors.text : currentColors.textSecondary }]}>
                  {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Select Employee'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color={currentColors.textSecondary} />
              </TouchableOpacity>

              {/* Date Selection */}
              <Text style={[styles.label, { color: currentColors.text }]}>Date *</Text>
              <Calendar
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: currentColors.primary },
                }}
                theme={{
                  backgroundColor: currentColors.card,
                  calendarBackground: currentColors.card,
                  textSectionTitleColor: currentColors.text,
                  selectedDayBackgroundColor: currentColors.primary,
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: currentColors.primary,
                  dayTextColor: currentColors.text,
                  textDisabledColor: currentColors.textSecondary,
                  monthTextColor: currentColors.text,
                  arrowColor: currentColors.primary,
                }}
              />

              {/* Time Selection */}
              <Text style={[styles.label, { color: currentColors.text }]}>Start Time *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                placeholderTextColor={currentColors.textSecondary}
              />

              <Text style={[styles.label, { color: currentColors.text }]}>End Time *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                placeholderTextColor={currentColors.textSecondary}
              />

              {/* Position */}
              <Text style={[styles.label, { color: currentColors.text }]}>Position *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={position}
                onChangeText={setPosition}
                placeholder="e.g., Server, Housekeeper, Receptionist"
                placeholderTextColor={currentColors.textSecondary}
              />

              {/* Notes */}
              <Text style={[styles.label, { color: currentColors.text }]}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes..."
                placeholderTextColor={currentColors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[buttonStyles.primary, styles.submitButton]}
                onPress={handleAddShift}
              >
                <Text style={buttonStyles.primaryText}>Add Shift</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Employee Selector Modal */}
      <Modal
        visible={showEmployeeSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmployeeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Select Employee</Text>
              <TouchableOpacity onPress={() => setShowEmployeeSelector(false)}>
                <IconSymbol name="xmark" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {availableEmployees.map((employee) => (
                <TouchableOpacity
                  key={employee.id}
                  style={[
                    styles.employeeSelectorItem,
                    { backgroundColor: currentColors.background },
                    selectedEmployee?.id === employee.id && { borderColor: currentColors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => {
                    setSelectedEmployee(employee);
                    setShowEmployeeSelector(false);
                  }}
                >
                  <View style={[styles.employeeAvatar, { backgroundColor: currentColors.primary + '20' }]}>
                    <Text style={[styles.employeeInitials, { color: currentColors.primary }]}>
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.employeeDetails}>
                    <Text style={[styles.employeeName, { color: currentColors.text }]}>
                      {employee.firstName} {employee.lastName}
                    </Text>
                    <Text style={[styles.employeeEmail, { color: currentColors.textSecondary }]}>
                      {employee.department || 'No department'}
                    </Text>
                  </View>
                  {selectedEmployee?.id === employee.id && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={currentColors.primary} />
                  )}
                </TouchableOpacity>
              ))}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  employeeCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeInitials: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  employeeDepartment: {
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  requestName: {
    fontSize: 18,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 12,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requestText: {
    fontSize: 14,
  },
  requestNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  shiftCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shiftPosition: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  shiftDetails: {
    marginBottom: 12,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  shiftText: {
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  employeeSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
