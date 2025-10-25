
import { colors, darkColors } from '@/styles/commonStyles';
import { router } from 'expo-router';
import { getCategoryName, getCategoryColor } from '@/utils/mockData';
import { supabase } from '@/app/integrations/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import { User, NotificationPreferences, SickLeaveCertificate, Employee } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { getUser, removeUser, setAuthenticated, clearAllData, saveUser } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<SickLeaveCertificate[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadReason, setUploadReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    shiftReminders: true,
    scheduleChanges: true,
    leaveApprovals: true,
    generalAnnouncements: true,
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Profile: Loading user data...');
      const userData = await getUser();
      if (userData) {
        console.log('Profile: User loaded:', userData.email);
        setUser(userData);
        if (userData.notificationPreferences) {
          setNotificationPrefs(userData.notificationPreferences);
        }
        if (userData.role === 'employee' && userData.id) {
          await loadCertificates(userData.id);
        }
      } else {
        console.log('Profile: No user data found');
      }
    } catch (error) {
      console.error('Profile: Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async (employeeId: string) => {
    try {
      console.log('Profile: Loading certificates for employee:', employeeId);
      // In a real app, fetch from Supabase
      // For now, using mock data
      setCertificates([]);
    } catch (error) {
      console.error('Profile: Error loading certificates:', error);
    }
  };

  const handleNotificationPrefChange = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    try {
      const updatedPrefs = { ...notificationPrefs, [key]: value };
      setNotificationPrefs(updatedPrefs);

      if (user) {
        const updatedUser = { ...user, notificationPreferences: updatedPrefs };
        await saveUser(updatedUser);
        setUser(updatedUser);
        console.log('Profile: Notification preferences updated');
      }

      if (value && key === 'shiftReminders') {
        await registerForPushNotificationsAsync();
      }
    } catch (error) {
      console.error('Profile: Error updating notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedDocument(result.assets[0].uri);
        console.log('Profile: Document selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Profile: Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadCertificate = async () => {
    if (!selectedDocument || !uploadReason.trim()) {
      Alert.alert('Error', 'Please select a document and provide a reason');
      return;
    }

    setUploadLoading(true);
    try {
      console.log('Profile: Uploading certificate...');
      // In a real app, upload to Supabase Storage
      Alert.alert('Success', 'Certificate uploaded successfully');
      resetUploadForm();
      if (user?.id) {
        await loadCertificates(user.id);
      }
    } catch (error) {
      console.error('Profile: Error uploading certificate:', error);
      Alert.alert('Error', 'Failed to upload certificate');
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUploadForm = () => {
    setShowUploadModal(false);
    setSelectedDocument(null);
    setUploadReason('');
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
              console.log('Profile: Logging out...');
              
              // Sign out from Supabase
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Profile: Supabase logout error:', error);
              }
              
              // Clear local storage
              await removeUser();
              await setAuthenticated(false);
              
              console.log('Profile: Logout successful');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Profile: Error during logout:', error);
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
      'This will delete all local data including shifts, time entries, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Profile: Clearing all data...');
              await clearAllData();
              Alert.alert('Success', 'All data cleared successfully');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Profile: Error clearing data:', error);
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
        return '#D4A59A';
      case 'manager':
        return '#B8C5B8';
      case 'employee':
        return '#8B9A8B';
      default:
        return theme.textSecondary;
    }
  };

  const getUserName = () => {
    if (!user) return 'User';
    return user.name || user.email.split('@')[0];
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      default:
        return theme.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={60} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            No user data found
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{getUserName()}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
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
              <Text style={styles.categoryText}>{getCategoryName(user.category)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notification Preferences
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <IconSymbol name="bell.fill" size={20} color={theme.primary} />
                <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                  Shift Reminders
                </Text>
              </View>
              <Switch
                value={notificationPrefs.shiftReminders}
                onValueChange={value =>
                  handleNotificationPrefChange('shiftReminders', value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <IconSymbol name="calendar.badge.clock" size={20} color={theme.primary} />
                <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                  Schedule Changes
                </Text>
              </View>
              <Switch
                value={notificationPrefs.scheduleChanges}
                onValueChange={value =>
                  handleNotificationPrefChange('scheduleChanges', value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={theme.primary} />
                <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                  Leave Approvals
                </Text>
              </View>
              <Switch
                value={notificationPrefs.leaveApprovals}
                onValueChange={value =>
                  handleNotificationPrefChange('leaveApprovals', value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={[styles.preferenceRow, { borderBottomWidth: 0 }]}>
              <View style={styles.preferenceInfo}>
                <IconSymbol name="megaphone.fill" size={20} color={theme.primary} />
                <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                  General Announcements
                </Text>
              </View>
              <Switch
                value={notificationPrefs.generalAnnouncements}
                onValueChange={value =>
                  handleNotificationPrefChange('generalAnnouncements', value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>
        </View>

        {user.role === 'employee' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Sick Leave Certificates
              </Text>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowUploadModal(true)}
              >
                <IconSymbol name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {certificates.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No certificates uploaded yet
                </Text>
              ) : (
                certificates.map(cert => (
                  <View key={cert.id} style={styles.certificateRow}>
                    <View style={styles.certificateInfo}>
                      <IconSymbol name="doc.fill" size={20} color={theme.primary} />
                      <View style={styles.certificateDetails}>
                        <Text style={[styles.certificateReason, { color: theme.text }]}>
                          {cert.reason}
                        </Text>
                        <Text style={[styles.certificateDate, { color: theme.textSecondary }]}>
                          {formatDate(cert.uploadDate)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(cert.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{cert.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions</Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square.fill" size={20} color={theme.error} />
            <Text style={[styles.actionButtonText, { color: theme.error }]}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={handleClearData}
          >
            <IconSymbol name="trash.fill" size={20} color={theme.error} />
            <Text style={[styles.actionButtonText, { color: theme.error }]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetUploadForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Upload Sick Leave Certificate
              </Text>
              <TouchableOpacity onPress={resetUploadForm}>
                <IconSymbol name="xmark.circle.fill" size={28} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              placeholder="Reason for sick leave"
              placeholderTextColor={theme.textSecondary}
              value={uploadReason}
              onChangeText={setUploadReason}
              multiline
            />

            <TouchableOpacity
              style={[styles.pickButton, { backgroundColor: theme.background }]}
              onPress={handlePickDocument}
            >
              <IconSymbol name="doc.badge.plus" size={20} color={theme.primary} />
              <Text style={[styles.pickButtonText, { color: theme.text }]}>
                {selectedDocument ? 'Document Selected' : 'Select Document'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.primary },
                uploadLoading && styles.disabledButton,
              ]}
              onPress={handleUploadCertificate}
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Upload Certificate</Text>
              )}
            </TouchableOpacity>
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
    paddingHorizontal: 24,
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
    fontWeight: 'bold',
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
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
  certificateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  certificateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  certificateDetails: {
    marginLeft: 12,
    flex: 1,
  },
  certificateReason: {
    fontSize: 16,
    fontWeight: '500',
  },
  certificateDate: {
    fontSize: 14,
    marginTop: 2,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
