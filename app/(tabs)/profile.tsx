
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
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { getUserFullName, getUserInitials } from '@/utils/userHelpers';
import { formatDate } from '@/utils/dateHelpers';
import { getCategoryName, getCategoryColor } from '@/utils/mockData';
import { supabase } from '@/app/integrations/supabase/client';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { clearAllData, saveUser } from '@/utils/storage';
import { NotificationPreferences, SickLeaveCertificate, Employee } from '@/types';

export default function ProfileScreen() {
  const { user, logout, loadUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    shiftChanges: true,
    reminders: true,
    approvals: true,
    pushEnabled: true,
  });

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [certificates, setCertificates] = useState<SickLeaveCertificate[]>([]);

  useEffect(() => {
    if (user) {
      setNotificationPrefs(user.notificationPreferences || notificationPrefs);
      loadCertificates(user.id);
    }
  }, [user]);

  const loadCertificates = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('sick_leave_certificates')
        .select('*')
        .eq('employee_id', employeeId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const handleNotificationPrefChange = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    const updatedPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(updatedPrefs);

    if (user) {
      const updatedUser = {
        ...user,
        notificationPreferences: updatedPrefs,
      };
      await saveUser(updatedUser);
    }

    if (key === 'pushEnabled' && value) {
      await registerForPushNotificationsAsync();
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadCertificate = async () => {
    if (!selectedFile || !startDate || !endDate || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploadLoading(true);

      const fileExt = selectedFile.uri.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `sick-leave-certificates/${fileName}`;

      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('sick_leave_certificates')
        .insert([
          {
            employee_id: user.id,
            file_name: fileName,
            file_path: filePath,
            file_size: selectedFile.fileSize,
            mime_type: selectedFile.mimeType,
            start_date: startDate,
            end_date: endDate,
            notes: notes,
            status: 'pending',
          },
        ]);

      if (dbError) throw dbError;

      Alert.alert('Success', 'Certificate uploaded successfully');
      resetUploadForm();
      await loadCertificates(user.id);
    } catch (error) {
      console.error('Error uploading certificate:', error);
      Alert.alert('Error', 'Failed to upload certificate');
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadModalVisible(false);
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
              await logout();
              router.replace('/(auth)/login');
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
      'This will remove all local data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All local data cleared');
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
        return '#FF6B6B';
      case 'manager':
        return '#4ECDC4';
      case 'employee':
        return theme.primary;
      default:
        return theme.textSecondary;
    }
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

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {getUserFullName(user)}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user.email}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
          {user.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(user.category) },
              ]}
            >
              <Text style={styles.categoryText}>
                {getCategoryName(user.category)}
              </Text>
            </View>
          )}
        </View>

        {/* Notification Preferences */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notification Preferences
          </Text>
          
          <View style={styles.preferenceRow}>
            <Text style={[styles.preferenceLabel, { color: theme.text }]}>
              Shift Changes
            </Text>
            <Switch
              value={notificationPrefs.shiftChanges}
              onValueChange={(value) =>
                handleNotificationPrefChange('shiftChanges', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={[styles.preferenceLabel, { color: theme.text }]}>
              Reminders
            </Text>
            <Switch
              value={notificationPrefs.reminders}
              onValueChange={(value) =>
                handleNotificationPrefChange('reminders', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={[styles.preferenceLabel, { color: theme.text }]}>
              Approvals
            </Text>
            <Switch
              value={notificationPrefs.approvals}
              onValueChange={(value) =>
                handleNotificationPrefChange('approvals', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={[styles.preferenceLabel, { color: theme.text }]}>
              Push Notifications
            </Text>
            <Switch
              value={notificationPrefs.pushEnabled}
              onValueChange={(value) =>
                handleNotificationPrefChange('pushEnabled', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
        </View>

        {/* Sick Leave Certificates */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Sick Leave Certificates
            </Text>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: theme.primary }]}
              onPress={() => setUploadModalVisible(true)}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {certificates.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No certificates uploaded yet
            </Text>
          ) : (
            certificates.map((cert) => (
              <View key={cert.id} style={[styles.certificateCard, { borderColor: theme.border }]}>
                <View style={styles.certificateHeader}>
                  <Text style={[styles.certificateDate, { color: theme.text }]}>
                    {formatDate(cert.startDate)} - {formatDate(cert.endDate)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(cert.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{cert.status}</Text>
                  </View>
                </View>
                <Text style={[styles.certificateFile, { color: theme.textSecondary }]}>
                  {cert.fileName}
                </Text>
                {cert.notes && (
                  <Text style={[styles.certificateNotes, { color: theme.textSecondary }]}>
                    {cert.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={handleClearData}
          >
            <IconSymbol name="trash" size={20} color={theme.text} />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Clear Local Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
            <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetUploadForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Upload Sick Leave Certificate
            </Text>

            <TouchableOpacity
              style={[styles.filePickerButton, { backgroundColor: theme.background }]}
              onPress={handlePickDocument}
            >
              <IconSymbol name="doc" size={24} color={theme.primary} />
              <Text style={[styles.filePickerText, { color: theme.text }]}>
                {selectedFile ? selectedFile.fileName || 'File selected' : 'Select File'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Start Date (YYYY-MM-DD)"
              placeholderTextColor={theme.textSecondary}
              value={startDate}
              onChangeText={setStartDate}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="End Date (YYYY-MM-DD)"
              placeholderTextColor={theme.textSecondary}
              value={endDate}
              onChangeText={setEndDate}
            />

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={resetUploadForm}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleUploadCertificate}
                disabled={uploadLoading}
              >
                {uploadLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Upload
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  uploadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  certificateCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificateDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  certificateFile: {
    fontSize: 12,
    marginBottom: 4,
  },
  certificateNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filePickerText: {
    fontSize: 16,
    marginLeft: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
