
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Shift, TimeEntry, LeaveRequest, ShiftRequest, AvailabilityDay } from '@/types';

const KEYS = {
  USER: '@user',
  SHIFTS: '@shifts',
  TIME_ENTRIES: '@time_entries',
  LEAVE_REQUESTS: '@leave_requests',
  IS_AUTHENTICATED: '@is_authenticated',
  SHIFT_REQUESTS: '@shift_requests',
  AVAILABILITY: '@availability',
};

// User storage
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    console.log('User saved successfully');
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
    console.log('User removed successfully');
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

// Authentication status
export const setAuthenticated = async (isAuth: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.IS_AUTHENTICATED, JSON.stringify(isAuth));
  } catch (error) {
    console.error('Error setting authentication status:', error);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const authStatus = await AsyncStorage.getItem(KEYS.IS_AUTHENTICATED);
    return authStatus ? JSON.parse(authStatus) : false;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Shifts storage
export const saveShifts = async (shifts: Shift[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts));
    console.log('Shifts saved successfully');
  } catch (error) {
    console.error('Error saving shifts:', error);
  }
};

export const getShifts = async (): Promise<Shift[]> => {
  try {
    const shiftsJson = await AsyncStorage.getItem(KEYS.SHIFTS);
    return shiftsJson ? JSON.parse(shiftsJson) : [];
  } catch (error) {
    console.error('Error getting shifts:', error);
    return [];
  }
};

// Time entries storage
export const saveTimeEntry = async (entry: TimeEntry): Promise<void> => {
  try {
    const entries = await getTimeEntries();
    const updatedEntries = [...entries, entry];
    await AsyncStorage.setItem(KEYS.TIME_ENTRIES, JSON.stringify(updatedEntries));
    console.log('Time entry saved successfully');
  } catch (error) {
    console.error('Error saving time entry:', error);
  }
};

export const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>): Promise<void> => {
  try {
    const entries = await getTimeEntries();
    const updatedEntries = entries.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    await AsyncStorage.setItem(KEYS.TIME_ENTRIES, JSON.stringify(updatedEntries));
    console.log('Time entry updated successfully');
  } catch (error) {
    console.error('Error updating time entry:', error);
  }
};

export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(KEYS.TIME_ENTRIES);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Error getting time entries:', error);
    return [];
  }
};

// Leave requests storage
export const saveLeaveRequest = async (request: LeaveRequest): Promise<void> => {
  try {
    const requests = await getLeaveRequests();
    const updatedRequests = [...requests, request];
    await AsyncStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(updatedRequests));
    console.log('Leave request saved successfully');
  } catch (error) {
    console.error('Error saving leave request:', error);
  }
};

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const requestsJson = await AsyncStorage.getItem(KEYS.LEAVE_REQUESTS);
    return requestsJson ? JSON.parse(requestsJson) : [];
  } catch (error) {
    console.error('Error getting leave requests:', error);
    return [];
  }
};

// Shift requests storage
export const saveShiftRequest = async (request: ShiftRequest): Promise<void> => {
  try {
    const requests = await getShiftRequests();
    const updatedRequests = [...requests, request];
    await AsyncStorage.setItem(KEYS.SHIFT_REQUESTS, JSON.stringify(updatedRequests));
    console.log('Shift request saved successfully');
  } catch (error) {
    console.error('Error saving shift request:', error);
  }
};

export const getShiftRequests = async (): Promise<ShiftRequest[]> => {
  try {
    const requestsJson = await AsyncStorage.getItem(KEYS.SHIFT_REQUESTS);
    return requestsJson ? JSON.parse(requestsJson) : [];
  } catch (error) {
    console.error('Error getting shift requests:', error);
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
    console.log('Shift request updated successfully');
  } catch (error) {
    console.error('Error updating shift request:', error);
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
    console.log('Availability saved successfully');
  } catch (error) {
    console.error('Error saving availability:', error);
  }
};

export const getAvailability = async (): Promise<AvailabilityDay[]> => {
  try {
    const availabilityJson = await AsyncStorage.getItem(KEYS.AVAILABILITY);
    return availabilityJson ? JSON.parse(availabilityJson) : [];
  } catch (error) {
    console.error('Error getting availability:', error);
    return [];
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
