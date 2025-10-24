
import { getCategoryName, getCategoryColor } from '@/utils/mockData';
import { colors, darkColors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { User, NotificationPreferences, SickLeaveCertificate, Employee } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUser, removeUser, setAuthenticated, clearAllData, saveUser } from '@/utils/storage';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [certificates, setCertificates] = useState<SickLeaveCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = isDark ? darkColors : colors;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      console.log('Profile: Loading user data...');
      const currentUser = await getUser();
      console.log('Profile: User loaded:', currentUser?.email);
      setUser(currentUser);

      if (currentUser) {
        // Load employee data from Supabase
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', currentUser.email)
          .single();

        if (empError) {
          console.log('Profile: No employee data in Supabase (using mock data)');
        } else if (empData) {
          console.log('Profile: Employee data loaded from Supabase');
          const mappedEmployee: Employee = {
            id: empData.id,
            userId: empData.user_id || undefined,
            email: empData.email,
            firstName: empData.first_name,
            lastName: empData.last_name,
            role: empData.role as 'admin' | 'manager' | 'employee',
            category: empData.category || undefined,
            department: empData.department || undefined,
            phoneNumber: empData.phone_number || undefined,
            avatarUrl: empData.avatar_url || undefined,
            createdAt: empData.created_at,
            updatedAt: empData.updated_at,
          };
          setEmployee(mappedEmployee);

          // Load sick leave certificates
          await loadCertificates(empData.id);
        }
      }
    } catch (error) {
      console.error('Profile: Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('sick_leave_certificates')
        .select('*')
        .eq('employee_id', employeeId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Profile: Error loading certificates:', error);
        return;
      }

      if (data) {
        const mappedCerts: SickLeaveCertificate[] = data.map(cert => ({
          id: cert.id,
          employeeId: cert.employee_id,
          fileName: cert.file_name,
          filePath: cert.file_path,
          fileSize: cert.file_size || undefined,
          mimeType: cert.mime_type || undefined,
          startDate: cert.start_date,
          endDate: cert.end_date,
          notes: cert.notes || undefined,
          status: cert.status as 'pending' | 'approved' | 'rejected',
          uploadedAt: cert.uploaded_at,
          reviewedAt: cert.reviewed_at || undefined,
          reviewedBy: cert.reviewed_by || undefined,
        }));
        setCertificates(mappedCerts);
      }
    } catch (error) {
      console.error('Profile: Error loading certificates:', error);
    }
  };

  const handleNotificationPrefChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    const updatedPrefs = {
      ...user.notificationPreferences,
      [key]: value,
    };

    const updatedUser = {
      ...user,
      notificationPreferences: updatedPrefs,
    };

    setUser(updatedUser);
    await saveUser(updatedUser);

    if (key === 'pushEnabled' && value) {
      await registerForPushNotificationsAsync();
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Profile: Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadCertificate = async () => {
    if (!employee || !selectedFile || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields and select a file');
      return;
    }

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = selectedFile.uri.split('.').pop();
      const fileName = `${employee.id}/${Date.now()}.${fileExt}`;
      
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sick-leave-certificates')
        .upload(fileName, blob, {
          contentType: selectedFile.mimeType || 'image/jpeg',
        });

      if (uploadError) {
        console.error('Profile: Error uploading file:', uploadError);
        Alert.alert('Error', 'Failed to upload file');
        return;
      }

      // Create certificate record
      const { data: certData, error: certError } = await supabase
        .from('sick_leave_certificates')
        .insert({
          employee_id: employee.id,
          file_name: selectedFile.fileName || `certificate_${Date.now()}`,
          file_path: uploadData.path,
          file_size: selectedFile.fileSize,
          mime_type: selectedFile.mimeType,
          start_date: startDate,
          end_date: endDate,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (certError) {
        console.error('Profile: Error creating certificate record:', certError);
        Alert.alert('Error', 'Failed to save certificate information');
        return;
      }

      Alert.alert('Success', 'Sick leave certificate uploaded successfully');
      setShowUploadModal(false);
      resetUploadForm();
      await loadCertificates(employee.id);
    } catch (error) {
      console.error('Profile: Error uploading certificate:', error);
      Alert.alert('Error', 'Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setStartDate('');
    setEndDate('');
    setNotes('');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== Logout Started ===');
              
              // Clear user data
              await removeUser();
              console.log('User data removed');
              
              // Set authentication to false
              await setAuthenticated(false);
              console.log('Authentication status set to false');
              
              // Sign out from Supabase (if using Supabase auth)
              try {
                await supabase.auth.signOut();
                console.log('Supabase session cleared');
              } catch (supabaseError) {
                console.log('Supabase signout skipped (using mock auth)');
              }
              
              // Small delay to ensure state is saved
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Navigate to login
              console.log('Navigating to login...');
              router.replace('/(auth)/login');
              console.log('=== Logout Complete ===');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all local data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data cleared. Please login again.');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#EF5350';
      case 'manager':
        return '#FFA726';
      case 'employee':
        return '#66BB6A';
      default:
        return currentColors.primary;
    }
  };

  const getUserName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`;
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
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: currentColors.text }]}>No user data found</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: currentColors.primary }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.retryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: currentColors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: currentColors.primary }]}>
              {getUserInitials()}
            </Text>
          </View>
          <Text style={[styles.name, { color: currentColors.text }]}>{getUserName()}</Text>
          <Text style={[styles.email, { color: currentColors.textSecondary }]}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
            <Text style={styles.roleBadgeText}>{user.role}</Text>
          </View>
          {user.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) + '20' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(user.category) }]}>
                {getCategoryName(user.category)}
              </Text>
            </View>
          )}
        </View>

        {/* Sick Leave Certificates Section */}
        {user.role === 'employee' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Sick Leave Certificates
              </Text>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: currentColors.primary }]}
                onPress={() => setShowUploadModal(true)}
              >
                <IconSymbol name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            {certificates.length === 0 ? (
              <View style={[styles.card, { backgroundColor: currentColors.card }]}>
                <IconSymbol name="doc.text" size={32} color={currentColors.textSecondary} />
                <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                  No certificates uploaded
                </Text>
              </View>
            ) : (
              certificates.map((cert) => (
                <View key={cert.id} style={[styles.certificateCard, { backgroundColor: currentColors.card }]}>
                  <View style={styles.certificateHeader}>
                    <IconSymbol name="doc.text.fill" size={24} color={currentColors.primary} />
                    <View style={styles.certificateInfo}>
                      <Text style={[styles.certificateName, { color: currentColors.text }]}>
                        {cert.fileName}
                      </Text>
                      <Text style={[styles.certificateDate, { color: currentColors.textSecondary }]}>
                        {formatDate(cert.startDate)} - {formatDate(cert.endDate)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cert.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(cert.status) }]}>
                        {cert.status}
                      </Text>
                    </View>
                  </View>
                  {cert.notes && (
                    <Text style={[styles.certificateNotes, { color: currentColors.textSecondary }]}>
                      {cert.notes}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Notification Preferences
          </Text>
          
          <View style={[styles.card, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                  Enable push notifications
                </Text>
              </View>
              <Switch
                value={user.notificationPreferences?.pushEnabled ?? true}
                onValueChange={(value) => handleNotificationPrefChange('pushEnabled', value)}
                trackColor={{ false: currentColors.border, true: currentColors.primary + '80' }}
                thumbColor={user.notificationPreferences?.pushEnabled ? currentColors.primary : '#f4f3f4'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                  Shift Changes
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                  Notify about schedule changes
                </Text>
              </View>
              <Switch
                value={user.notificationPreferences?.shiftChanges ?? true}
                onValueChange={(value) => handleNotificationPrefChange('shiftChanges', value)}
                trackColor={{ false: currentColors.border, true: currentColors.primary + '80' }}
                thumbColor={user.notificationPreferences?.shiftChanges ? currentColors.primary : '#f4f3f4'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                  Reminders
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                  Shift start/end reminders
                </Text>
              </View>
              <Switch
                value={user.notificationPreferences?.reminders ?? true}
                onValueChange={(value) => handleNotificationPrefChange('reminders', value)}
                trackColor={{ false: currentColors.border, true: currentColors.primary + '80' }}
                thumbColor={user.notificationPreferences?.reminders ? currentColors.primary : '#f4f3f4'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                  Approvals
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                  Request approval notifications
                </Text>
              </View>
              <Switch
                value={user.notificationPreferences?.approvals ?? true}
                onValueChange={(value) => handleNotificationPrefChange('approvals', value)}
                trackColor={{ false: currentColors.border, true: currentColors.primary + '80' }}
                thumbColor={user.notificationPreferences?.approvals ? currentColors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Account</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.card }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={24} color="#EF5350" />
            <Text style={[styles.actionButtonText, { color: '#EF5350' }]}>Logout</Text>
          </TouchableOpacity>

          {user.role === 'admin' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: currentColors.card }]}
              onPress={handleClearData}
            >
              <IconSymbol name="trash" size={24} color="#EF5350" />
              <Text style={[styles.actionButtonText, { color: '#EF5350' }]}>Clear All Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Upload Certificate Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                Upload Sick Leave Certificate
              </Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <IconSymbol name="xmark" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* File Selection */}
              <Text style={[styles.label, { color: currentColors.text }]}>Document *</Text>
              <TouchableOpacity
                style={[styles.fileButton, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}
                onPress={handlePickDocument}
              >
                <IconSymbol name="doc.badge.plus" size={24} color={currentColors.primary} />
                <Text style={[styles.fileButtonText, { color: selectedFile ? currentColors.text : currentColors.textSecondary }]}>
                  {selectedFile ? selectedFile.fileName || 'File selected' : 'Select Document'}
                </Text>
              </TouchableOpacity>

              {/* Date Range */}
              <Text style={[styles.label, { color: currentColors.text }]}>Start Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={currentColors.textSecondary}
              />

              <Text style={[styles.label, { color: currentColors.text }]}>End Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={currentColors.textSecondary}
              />

              {/* Notes */}
              <Text style={[styles.label, { color: currentColors.text }]}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: currentColors.background, borderColor: currentColors.border, color: currentColors.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional information..."
                placeholderTextColor={currentColors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: currentColors.primary }]}
                onPress={handleUploadCertificate}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Upload Certificate</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
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
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  certificateCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  certificateDate: {
    fontSize: 14,
  },
  certificateNotes: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
    fontSize: 20,
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
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  fileButtonText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
