
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Shift, TimeEntry, LeaveRequest, ShiftRequest, AvailabilityDay, Notification, MonthlyReport } from '@/types';

const KEYS = {
  USER: '@user',
  SHIFTS: '@shifts',
  TIME_ENTRIES: '@time_entries',
  LEAVE_REQUESTS: '@leave_requests',
  IS_AUTHENTICATED: '@is_authenticated',
  SHIFT_REQUESTS: '@shift_requests',
  AVAILABILITY: '@availability',
  NOTIFICATIONS: '@notifications',
  MONTHLY_REPORTS: '@monthly_reports',
  PUSH_TOKEN: '@push_token',
};

// User storage
export const saveUser = async (user: User): Promise<void> => {
  try {
    const userJson = JSON.stringify(user);
    await AsyncStorage.setItem(KEYS.USER, userJson);
    console.log('Storage: User saved successfully');
  } catch (error) {
    console.error('Storage: Error saving user:', error);
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(KEYS.USER);
    if (userJson) {
      const user = JSON.parse(userJson);
      console.log('Storage: User retrieved:', user.email);
      return user;
    }
    console.log('Storage: No user found');
    return null;
  } catch (error) {
    console.error('Storage: Error getting user:', error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
    console.log('Storage: User removed successfully');
  } catch (error) {
    console.error('Storage: Error removing user:', error);
    throw error;
  }
};

// Authentication status
export const setAuthenticated = async (isAuth: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.IS_AUTHENTICATED, JSON.stringify(isAuth));
    console.log('Storage: Authentication status set to:', isAuth);
  } catch (error) {
    console.error('Storage: Error setting authentication status:', error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const authStatus = await AsyncStorage.getItem(KEYS.IS_AUTHENTICATED);
    const isAuth = authStatus ? JSON.parse(authStatus) : false;
    console.log('Storage: Authentication status:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('Storage: Error checking authentication status:', error);
    return false;
  }
};

// Shifts storage
export const saveShifts = async (shifts: Shift[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts));
    console.log('Storage: Shifts saved successfully');
  } catch (error) {
    console.error('Storage: Error saving shifts:', error);
    throw error;
  }
};

export const getShifts = async (): Promise<Shift[]> => {
  try {
    const shiftsJson = await AsyncStorage.getItem(KEYS.SHIFTS);
    return shiftsJson ? JSON.parse(shiftsJson) : [];
  } catch (error) {
    console.error('Storage: Error getting shifts:', error);
    return [];
  }
};

// Time entries storage
export const saveTimeEntry = async (entry: TimeEntry): Promise<void> => {
  try {
    const entries = await getTimeEntries();
    const updatedEntries = [...entries, entry];
    await AsyncStorage.setItem(KEYS.TIME_ENTRIES, JSON.stringify(updatedEntries));
    console.log('Storage: Time entry saved successfully');
  } catch (error) {
    console.error('Storage: Error saving time entry:', error);
    throw error;
  }
};

export const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>): Promise<void> => {
  try {
    const entries = await getTimeEntries();
    const updatedEntries = entries.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    await AsyncStorage.setItem(KEYS.TIME_ENTRIES, JSON.stringify(updatedEntries));
    console.log('Storage: Time entry updated successfully');
  } catch (error) {
    console.error('Storage: Error updating time entry:', error);
    throw error;
  }
};

export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(KEYS.TIME_ENTRIES);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Storage: Error getting time entries:', error);
    return [];
  }
};

// Leave requests storage
export const saveLeaveRequest = async (request: LeaveRequest): Promise<void> => {
  try {
    const requests = await getLeaveRequests();
    const updatedRequests = [...requests, request];
    await AsyncStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(updatedRequests));
    console.log('Storage: Leave request saved successfully');
  } catch (error) {
    console.error('Storage: Error saving leave request:', error);
    throw error;
  }
};

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const requestsJson = await AsyncStorage.getItem(KEYS.LEAVE_REQUESTS);
    return requestsJson ? JSON.parse(requestsJson) : [];
  } catch (error) {
    console.error('Storage: Error getting leave requests:', error);
    return [];
  }
};

// Shift requests storage
export const saveShiftRequest = async (request: ShiftRequest): Promise<void> => {
  try {
    const requests = await getShiftRequests();
    const updatedRequests = [...requests, request];
    await AsyncStorage.setItem(KEYS.SHIFT_REQUESTS, JSON.stringify(updatedRequests));
    console.log('Storage: Shift request saved successfully');
  } catch (error) {
    console.error('Storage: Error saving shift request:', error);
    throw error;
  }
};

export const getShiftRequests = async (): Promise<ShiftRequest[]> => {
  try {
    const requestsJson = await AsyncStorage.getItem(KEYS.SHIFT_REQUESTS);
    return requestsJson ? JSON.parse(requestsJson) : [];
  } catch (error) {
    console.error('Storage: Error getting shift requests:', error);
    return [];
  }
};

export const updateShiftRequest = async (requestId: string, updates: Partial<ShiftRequest>): Promise<void> => {
  try {
    const requests = await getShiftRequests();
    const updatedRequests = requests.map(request => 
      request.id === requestId ? { ...request, ...updates } : request
    );
    await AsyncStorage.setItem(KEYS.SHIFT_REQUESTS, JSON.stringify(updatedRequests));
    console.log('Storage: Shift request updated successfully');
  } catch (error) {
    console.error('Storage: Error updating shift request:', error);
    throw error;
  }
};

// Availability storage
export const saveAvailability = async (availability: AvailabilityDay): Promise<void> => {
  try {
    const availabilities = await getAvailability();
    const existingIndex = availabilities.findIndex(
      a => a.userId === availability.userId && a.date === availability.date
    );
    
    let updatedAvailabilities;
    if (existingIndex >= 0) {
      updatedAvailabilities = [...availabilities];
      updatedAvailabilities[existingIndex] = availability;
    } else {
      updatedAvailabilities = [...availabilities, availability];
    }
    
    await AsyncStorage.setItem(KEYS.AVAILABILITY, JSON.stringify(updatedAvailabilities));
    console.log('Storage: Availability saved successfully');
  } catch (error) {
    console.error('Storage: Error saving availability:', error);
    throw error;
  }
};

export const getAvailability = async (): Promise<AvailabilityDay[]> => {
  try {
    const availabilityJson = await AsyncStorage.getItem(KEYS.AVAILABILITY);
    return availabilityJson ? JSON.parse(availabilityJson) : [];
  } catch (error) {
    console.error('Storage: Error getting availability:', error);
    return [];
  }
};

// Notifications storage
export const saveNotification = async (notification: Notification): Promise<void> => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = [notification, ...notifications];
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
    console.log('Storage: Notification saved successfully');
  } catch (error) {
    console.error('Storage: Error saving notification:', error);
    throw error;
  }
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const notificationsJson = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
    return notificationsJson ? JSON.parse(notificationsJson) : [];
  } catch (error) {
    console.error('Storage: Error getting notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
    console.log('Storage: Notification marked as read');
  } catch (error) {
    console.error('Storage: Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
    console.log('Storage: All notifications marked as read');
  } catch (error) {
    console.error('Storage: Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
    console.log('Storage: Notification deleted');
  } catch (error) {
    console.error('Storage: Error deleting notification:', error);
    throw error;
  }
};

// Monthly reports storage
export const saveMonthlyReport = async (report: MonthlyReport): Promise<void> => {
  try {
    const reports = await getMonthlyReports();
    const existingIndex = reports.findIndex(
      r => r.userId === report.userId && r.month === report.month
    );
    
    let updatedReports;
    if (existingIndex >= 0) {
      updatedReports = [...reports];
      updatedReports[existingIndex] = report;
    } else {
      updatedReports = [...reports, report];
    }
    
    await AsyncStorage.setItem(KEYS.MONTHLY_REPORTS, JSON.stringify(updatedReports));
    console.log('Storage: Monthly report saved successfully');
  } catch (error) {
    console.error('Storage: Error saving monthly report:', error);
    throw error;
  }
};

export const getMonthlyReports = async (): Promise<MonthlyReport[]> => {
  try {
    const reportsJson = await AsyncStorage.getItem(KEYS.MONTHLY_REPORTS);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error('Storage: Error getting monthly reports:', error);
    return [];
  }
};

// Push token storage
export const savePushToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PUSH_TOKEN, token);
    console.log('Storage: Push token saved successfully');
  } catch (error) {
    console.error('Storage: Error saving push token:', error);
    throw error;
  }
};

export const getPushToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error('Storage: Error getting push token:', error);
    return null;
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('Storage: All data cleared successfully');
  } catch (error) {
    console.error('Storage: Error clearing data:', error);
    throw error;
  }
};
