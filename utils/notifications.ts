
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { saveNotification, savePushToken, getUser } from './storage';
import { Notification } from '@/types';

// Configure notification handler with all available options
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications with comprehensive error handling
 * @returns Promise<string | undefined> - Push token or undefined if registration fails
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  try {
    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return undefined;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
        console.log('Android notification channel configured successfully');
      } catch (channelError) {
        console.error('Error setting up Android notification channel:', channelError);
        // Continue execution - channel setup failure shouldn't prevent token registration
      }
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    console.log('Current notification permission status:', existingStatus);

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      try {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
        console.log('Permission request result:', status);
      } catch (permissionError) {
        console.error('Error requesting notification permissions:', permissionError);
        Alert.alert(
          'Permission Error',
          'Failed to request notification permissions. Please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
        return undefined;
      }
    }
    
    // Check if permissions were granted
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      Alert.alert(
        'Notifications Disabled',
        'Push notifications are disabled. Please enable them in your device settings to receive important updates.',
        [{ text: 'OK' }]
      );
      return undefined;
    }
    
    try {
      // Get project ID from multiple sources with fallback
      const projectId = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId ?? 
        process.env.EXPO_PUBLIC_PROJECT_ID;
      
      if (!projectId) {
        console.warn('Project ID not found - using development mode');
        // In development, we can still get a token without project ID
      }
      
      // Get Expo push token
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || undefined,
      });
      
      token = pushTokenData.data;
      console.log('Successfully obtained push token:', token);
      
      // Save token to storage
      try {
        await savePushToken(token);
        console.log('Push token saved to storage');
      } catch (storageError) {
        console.error('Error saving push token to storage:', storageError);
        // Token is still valid even if storage fails
      }
      
    } catch (tokenError: any) {
      console.error('Error getting push token:', tokenError);
      
      // Provide user-friendly error messages based on error type
      if (tokenError.message?.includes('network')) {
        Alert.alert(
          'Network Error',
          'Unable to register for push notifications due to network issues. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (tokenError.message?.includes('projectId')) {
        console.warn('Project ID issue - notifications will work in development mode');
      } else {
        console.warn('Push token error (non-critical):', tokenError.message);
      }
      
      // Return undefined but don't throw - app should continue to work
      return undefined;
    }
  } catch (error: any) {
    console.error('Unexpected error in registerForPushNotificationsAsync:', error);
    Alert.alert(
      'Notification Setup Error',
      'An unexpected error occurred while setting up notifications. Some features may not work correctly.',
      [{ text: 'OK' }]
    );
    return undefined;
  }

  return token;
}

/**
 * Create and save a notification with error handling
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'shift_change' | 'reminder' | 'approval' | 'info' | 'warning',
  data?: any
): Promise<void> {
  try {
    if (!userId || !title || !message) {
      console.error('Invalid notification parameters:', { userId, title, message });
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      data,
    };

    await saveNotification(notification);
    console.log('Notification created successfully:', notification.title);
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notification creation failure shouldn't crash the app
  }
}

/**
 * Send local notification with error handling
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    if (!title || !body) {
      console.error('Invalid local notification parameters');
      return;
    }

    // Check if we have permission to send notifications
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Cannot send local notification - permissions not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
    
    console.log('Local notification sent successfully');
  } catch (error) {
    console.error('Error sending local notification:', error);
    // Don't throw - notification failure shouldn't crash the app
  }
}

/**
 * Send notification for shift change with error handling
 */
export async function notifyShiftChange(
  userId: string,
  userName: string,
  changeType: 'new' | 'updated' | 'cancelled' | 'swapped',
  shiftDetails: string
): Promise<void> {
  try {
    if (!userId || !userName || !changeType || !shiftDetails) {
      console.error('Invalid shift change notification parameters');
      return;
    }

    const user = await getUser();
    if (!user) {
      console.log('No user found - skipping notification');
      return;
    }

    if (!user.notificationPreferences?.shiftChanges) {
      console.log('Shift change notifications disabled for user');
      return;
    }

    const titles = {
      new: 'New Shift Assigned',
      updated: 'Shift Updated',
      cancelled: 'Shift Cancelled',
      swapped: 'Shift Swapped',
    };

    const messages = {
      new: `You have been assigned a new shift: ${shiftDetails}`,
      updated: `Your shift has been updated: ${shiftDetails}`,
      cancelled: `Your shift has been cancelled: ${shiftDetails}`,
      swapped: `Your shift has been swapped: ${shiftDetails}`,
    };

    await createNotification(
      userId,
      titles[changeType],
      messages[changeType],
      'shift_change',
      { changeType, shiftDetails }
    );

    if (user.notificationPreferences?.pushEnabled) {
      await sendLocalNotification(titles[changeType], messages[changeType]);
    }
  } catch (error) {
    console.error('Error sending shift change notification:', error);
    // Don't throw - notification failure shouldn't crash the app
  }
}

/**
 * Send notification for approval with error handling
 */
export async function notifyApproval(
  userId: string,
  requestType: 'shift' | 'leave',
  status: 'approved' | 'rejected',
  details: string
): Promise<void> {
  try {
    if (!userId || !requestType || !status || !details) {
      console.error('Invalid approval notification parameters');
      return;
    }

    const user = await getUser();
    if (!user) {
      console.log('No user found - skipping notification');
      return;
    }

    if (!user.notificationPreferences?.approvals) {
      console.log('Approval notifications disabled for user');
      return;
    }

    const title = status === 'approved' 
      ? `${requestType === 'shift' ? 'Shift' : 'Leave'} Request Approved`
      : `${requestType === 'shift' ? 'Shift' : 'Leave'} Request Rejected`;

    const message = `Your ${requestType} request has been ${status}: ${details}`;

    await createNotification(
      userId,
      title,
      message,
      'approval',
      { requestType, status, details }
    );

    if (user.notificationPreferences?.pushEnabled) {
      await sendLocalNotification(title, message);
    }
  } catch (error) {
    console.error('Error sending approval notification:', error);
    // Don't throw - notification failure shouldn't crash the app
  }
}

/**
 * Send reminder notification with error handling
 */
export async function notifyReminder(
  userId: string,
  reminderType: 'shift_starting' | 'shift_ending' | 'break_time',
  details: string
): Promise<void> {
  try {
    if (!userId || !reminderType || !details) {
      console.error('Invalid reminder notification parameters');
      return;
    }

    const user = await getUser();
    if (!user) {
      console.log('No user found - skipping notification');
      return;
    }

    if (!user.notificationPreferences?.reminders) {
      console.log('Reminder notifications disabled for user');
      return;
    }

    const titles = {
      shift_starting: 'Shift Starting Soon',
      shift_ending: 'Shift Ending Soon',
      break_time: 'Break Time',
    };

    await createNotification(
      userId,
      titles[reminderType],
      details,
      'reminder',
      { reminderType, details }
    );

    if (user.notificationPreferences?.pushEnabled) {
      await sendLocalNotification(titles[reminderType], details);
    }
  } catch (error) {
    console.error('Error sending reminder notification:', error);
    // Don't throw - notification failure shouldn't crash the app
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Get detailed notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return {
      granted: permissions.granted,
      canAskAgain: permissions.canAskAgain,
      status: permissions.status,
    };
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    return {
      granted: false,
      canAskAgain: true,
      status: 'undetermined',
    };
  }
}

/**
 * Schedule a notification for a specific date/time
 */
export async function scheduleNotification(
  title: string,
  body: string,
  triggerDate: Date,
  data?: any
): Promise<string | undefined> {
  try {
    if (!title || !body || !triggerDate) {
      console.error('Invalid schedule notification parameters');
      return undefined;
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Cannot schedule notification - permissions not granted');
      return undefined;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    console.log('Notification scheduled successfully:', identifier);
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return undefined;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(identifier: string): Promise<boolean> {
  try {
    if (!identifier) {
      console.error('Invalid notification identifier');
      return false;
    }

    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('Notification cancelled successfully:', identifier);
    return true;
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
    return false;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled notifications cancelled successfully');
    return true;
  } catch (error) {
    console.error('Error cancelling all scheduled notifications:', error);
    return false;
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.Notification[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${notifications.length} scheduled notifications`);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Dismiss all notifications from notification center
 */
export async function dismissAllNotifications(): Promise<boolean> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('All notifications dismissed successfully');
    return true;
  } catch (error) {
    console.error('Error dismissing all notifications:', error);
    return false;
  }
}
</write file>

Now let me update the profile screen to provide better feedback when enabling push notifications:

<write file="app/(tabs)/profile.tsx">
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
import { registerForPushNotificationsAsync, getNotificationPermissionStatus } from '@/utils/notifications';
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
  const [registeringNotifications, setRegisteringNotifications] = useState(false);

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
    // If enabling push notifications, register for them first
    if (key === 'pushEnabled' && value) {
      setRegisteringNotifications(true);
      
      try {
        // Check current permission status
        const permissionStatus = await getNotificationPermissionStatus();
        
        if (!permissionStatus.granted && !permissionStatus.canAskAgain) {
          Alert.alert(
            'Notifications Disabled',
            'Push notifications are disabled in your device settings. Please enable them in Settings > Notifications to receive updates.',
            [{ text: 'OK' }]
          );
          setRegisteringNotifications(false);
          return;
        }

        // Attempt to register for push notifications
        const token = await registerForPushNotificationsAsync();
        
        if (!token) {
          Alert.alert(
            'Registration Failed',
            'Unable to register for push notifications. Please check your permissions and try again.',
            [{ text: 'OK' }]
          );
          setRegisteringNotifications(false);
          return;
        }

        Alert.alert(
          'Success',
          'Push notifications have been enabled successfully!',
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Error registering for push notifications:', error);
        Alert.alert(
          'Error',
          'An error occurred while enabling push notifications. Please try again.',
          [{ text: 'OK' }]
        );
        setRegisteringNotifications(false);
        return;
      } finally {
        setRegisteringNotifications(false);
      }
    }

    // Update preferences
    const updatedPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(updatedPrefs);

    if (user) {
      try {
        const updatedUser = {
          ...user,
          notificationPreferences: updatedPrefs,
        };
        await saveUser(updatedUser);
        console.log('Notification preferences updated successfully');
      } catch (error) {
        console.error('Error saving notification preferences:', error);
        Alert.alert(
          'Error',
          'Failed to save notification preferences. Please try again.',
          [{ text: 'OK' }]
        );
      }
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
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleUploadCertificate = async () => {
    if (!selectedFile || !startDate || !endDate || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert('Error', 'Please use the format YYYY-MM-DD for dates');
      return;
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Error', 'Start date must be before end date');
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
      Alert.alert('Error', 'Failed to upload certificate. Please try again.');
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
              Alert.alert('Error', 'Failed to clear data. Please try again.');
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
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                Shift Changes
              </Text>
              <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>
                Get notified about new, updated, or cancelled shifts
              </Text>
            </View>
            <Switch
              value={notificationPrefs.shiftChanges}
              onValueChange={(value) =>
                handleNotificationPrefChange('shiftChanges', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              disabled={registeringNotifications}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                Reminders
              </Text>
              <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>
                Receive reminders about upcoming shifts
              </Text>
            </View>
            <Switch
              value={notificationPrefs.reminders}
              onValueChange={(value) =>
                handleNotificationPrefChange('reminders', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              disabled={registeringNotifications}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                Approvals
              </Text>
              <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>
                Get notified when requests are approved or rejected
              </Text>
            </View>
            <Switch
              value={notificationPrefs.approvals}
              onValueChange={(value) =>
                handleNotificationPrefChange('approvals', value)
              }
              trackColor={{ false: theme.border, true: theme.primary }}
              disabled={registeringNotifications}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>
                Push Notifications
              </Text>
              <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>
                Enable push notifications on this device
              </Text>
            </View>
            {registeringNotifications ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Switch
                value={notificationPrefs.pushEnabled}
                onValueChange={(value) =>
                  handleNotificationPrefChange('pushEnabled', value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            )}
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
                disabled={uploadLoading}
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
  preferenceInfo: {
    flex: 1,
    marginRight: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    lineHeight: 18,
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
