
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
import * as DocumentPicker from 'expo-document-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { getUserFullName, getUserInitials } from '@/utils/userHelpers';
import { formatDate } from '@/utils/dateHelpers';
import { getCategoryName, getCategoryColor } from '@/utils/mockData';
import { supabase } from '@/app/integrations/supabase/client';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { clearAllData, saveUser } from '@/utils/storage';
import { NotificationPreferences, SickLeaveCertificate, Document } from '@/types';

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
  const [documentType, setDocumentType] = useState<'certificate' | 'contract' | 'id' | 'other'>('certificate');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [certificates, setCertificates] = useState<SickLeaveCertificate[]>([]);

  // For sick leave certificates
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [selectedCertFile, setSelectedCertFile] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      setNotificationPrefs(user.notificationPreferences || notificationPrefs);
      loadUserDocuments();
      loadCertificates();
    }
  }, [user]);

  const loadUserDocuments = async () => {
    if (!user) return;

    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!empData) return;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', empData.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const mappedDocs: Document[] = (data || []).map(doc => ({
        id: doc.id,
        employeeId: doc.employee_id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        filePath: doc.file_path,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        description: doc.description,
        status: doc.status,
        uploadedAt: doc.uploaded_at,
        reviewedAt: doc.reviewed_at,
        reviewedBy: doc.reviewed_by,
      }));

      setDocuments(mappedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadCertificates = async () => {
    if (!user) return;

    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!empData) return;

      const { data, error } = await supabase
        .from('sick_leave_certificates')
        .select('*')
        .eq('employee_id', empData.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const mappedCerts: SickLeaveCertificate[] = (data || []).map(cert => ({
        id: cert.id,
        employeeId: cert.employee_id,
        fileName: cert.file_name,
        filePath: cert.file_path,
        fileSize: cert.file_size,
        mimeType: cert.mime_type,
        startDate: cert.start_date,
        endDate: cert.end_date,
        notes: cert.notes,
        status: cert.status,
        uploadedAt: cert.uploaded_at,
        reviewedAt: cert.reviewed_at,
        reviewedBy: cert.reviewed_by,
      }));

      setCertificates(mappedCerts);
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
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handlePickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedCertFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking certificate:', error);
      Alert.alert('Error', 'Failed to pick certificate');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !user) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    try {
      setUploadLoading(true);

      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!empData) {
        Alert.alert('Error', 'Employee profile not found');
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: selectedFile.mimeType,
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: empData.id,
          document_type: documentType,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.mimeType,
          description: description || null,
          status: 'pending',
        });

      if (dbError) throw dbError;

      Alert.alert('Success', 'Document uploaded successfully. Admin will review it shortly.');
      resetUploadForm();
      await loadUserDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadCertificate = async () => {
    if (!selectedCertFile || !startDate || !endDate || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setCertLoading(true);

      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!empData) {
        Alert.alert('Error', 'Employee profile not found');
        return;
      }

      const fileExt = selectedCertFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const response = await fetch(selectedCertFile.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('sick-leave-certificates')
        .upload(filePath, blob, {
          contentType: selectedCertFile.mimeType,
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('sick_leave_certificates')
        .insert({
          employee_id: empData.id,
          file_name: selectedCertFile.name,
          file_path: filePath,
          file_size: selectedCertFile.size,
          mime_type: selectedCertFile.mimeType,
          start_date: startDate,
          end_date: endDate,
          notes: notes || null,
          status: 'pending',
        });

      if (dbError) throw dbError;

      Alert.alert('Success', 'Sick leave certificate uploaded successfully');
      resetCertForm();
      await loadCertificates();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      Alert.alert('Error', 'Failed to upload certificate');
    } finally {
      setCertLoading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadModalVisible(false);
    setSelectedFile(null);
    setDocumentType('certificate');
    setDescription('');
  };

  const resetCertForm = () => {
    setCertModalVisible(false);
    setSelectedCertFile(null);
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        {/* Documents & Certificates Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Documents & Certificates
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.primary }]}
            onPress={() => setUploadModalVisible(true)}
          >
            <IconSymbol name="doc.badge.plus" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: '#FF6B6B', marginTop: 8 }]}
            onPress={() => setCertModalVisible(true)}
          >
            <IconSymbol name="cross.case" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload Sick Leave Certificate</Text>
          </TouchableOpacity>

          {/* Documents List */}
          {documents.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>My Documents</Text>
              {documents.map((doc) => (
                <View key={doc.id} style={[styles.documentCard, { borderColor: theme.border }]}>
                  <View style={styles.documentHeader}>
                    <IconSymbol name="doc" size={20} color={theme.primary} />
                    <Text style={[styles.documentName, { color: theme.text }]}>{doc.fileName}</Text>
                  </View>
                  <Text style={[styles.documentType, { color: theme.textSecondary }]}>
                    {doc.documentType.toUpperCase()}
                  </Text>
                  {doc.description && (
                    <Text style={[styles.documentDesc, { color: theme.textSecondary }]}>
                      {doc.description}
                    </Text>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
                    <Text style={styles.statusText}>{doc.status}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Certificates List */}
          {certificates.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>Sick Leave Certificates</Text>
              {certificates.map((cert) => (
                <View key={cert.id} style={[styles.documentCard, { borderColor: theme.border }]}>
                  <View style={styles.documentHeader}>
                    <IconSymbol name="cross.case" size={20} color="#FF6B6B" />
                    <Text style={[styles.documentName, { color: theme.text }]}>{cert.fileName}</Text>
                  </View>
                  <Text style={[styles.certificateDate, { color: theme.textSecondary }]}>
                    {formatDate(cert.startDate)} - {formatDate(cert.endDate)}
                  </Text>
                  {cert.notes && (
                    <Text style={[styles.documentDesc, { color: theme.textSecondary }]}>
                      {cert.notes}
                    </Text>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cert.status) }]}>
                    <Text style={styles.statusText}>{cert.status}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {documents.length === 0 && certificates.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No documents uploaded yet
            </Text>
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

      {/* Upload Document Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetUploadForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Upload Document
              </Text>
              <TouchableOpacity onPress={resetUploadForm}>
                <IconSymbol name="xmark" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filePickerButton, { backgroundColor: theme.background }]}
                onPress={handlePickDocument}
              >
                <IconSymbol name="doc" size={24} color={theme.primary} />
                <Text style={[styles.filePickerText, { color: theme.text }]}>
                  {selectedFile ? selectedFile.name : 'Select File (.pdf, .jpg, .png, .docx)'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.text }]}>Document Type *</Text>
              <View style={styles.typeSelector}>
                {(['certificate', 'contract', 'id', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      documentType === type && { borderColor: theme.primary, backgroundColor: theme.primary + '20' }
                    ]}
                    onPress={() => setDocumentType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: theme.text },
                      documentType === type && { color: theme.primary, fontWeight: '600' }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Add a description..."
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
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
                  onPress={handleUploadDocument}
                  disabled={uploadLoading || !selectedFile}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upload Certificate Modal */}
      <Modal
        visible={certModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetCertForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Upload Sick Leave Certificate
              </Text>
              <TouchableOpacity onPress={resetCertForm}>
                <IconSymbol name="xmark" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filePickerButton, { backgroundColor: theme.background }]}
                onPress={handlePickCertificate}
              >
                <IconSymbol name="doc" size={24} color={theme.primary} />
                <Text style={[styles.filePickerText, { color: theme.text }]}>
                  {selectedCertFile ? selectedCertFile.name : 'Select Certificate (.pdf, .jpg, .png)'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.text }]}>Start Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={startDate}
                onChangeText={setStartDate}
              />

              <Text style={[styles.label, { color: theme.text }]}>End Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={endDate}
                onChangeText={setEndDate}
              />

              <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Add any notes..."
                placeholderTextColor={theme.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.border }]}
                  onPress={resetCertForm}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={handleUploadCertificate}
                  disabled={certLoading || !selectedCertFile || !startDate || !endDate}
                >
                  {certLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                      Upload
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  documentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  documentType: {
    fontSize: 12,
    marginBottom: 4,
  },
  documentDesc: {
    fontSize: 12,
    marginBottom: 8,
  },
  certificateDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
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
  actions: {
    padding: 16,
    paddingBottom: 100,
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
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 24,
    paddingTop: 0,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  filePickerText: {
    fontSize: 14,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
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
