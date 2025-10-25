
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
