
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { saveNotification, savePushToken, getUser } from './storage';
import { Notification } from '@/types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your actual project ID
    })).data;
    
    console.log('Push token:', token);
    await savePushToken(token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Create and save a notification
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'shift_change' | 'reminder' | 'approval' | 'info' | 'warning',
  data?: any
): Promise<void> {
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
  console.log('Notification created:', notification.title);
}

// Send local notification
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

// Send notification for shift change
export async function notifyShiftChange(
  userId: string,
  userName: string,
  changeType: 'new' | 'updated' | 'cancelled' | 'swapped',
  shiftDetails: string
): Promise<void> {
  const user = await getUser();
  if (!user || !user.notificationPreferences?.shiftChanges) {
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
}

// Send notification for approval
export async function notifyApproval(
  userId: string,
  requestType: 'shift' | 'leave',
  status: 'approved' | 'rejected',
  details: string
): Promise<void> {
  const user = await getUser();
  if (!user || !user.notificationPreferences?.approvals) {
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
}

// Send reminder notification
export async function notifyReminder(
  userId: string,
  reminderType: 'shift_starting' | 'shift_ending' | 'break_time',
  details: string
): Promise<void> {
  const user = await getUser();
  if (!user || !user.notificationPreferences?.reminders) {
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
}
