
import { useState, useEffect, useCallback } from 'react';
import { TimeEntry } from '@/types';
import { getTimeEntries, saveTimeEntry, updateTimeEntry } from '@/utils/storage';
import * as Location from 'expo-location';

export function useTimeTracking(userId: string) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (!locationPermission) return undefined;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return undefined;
    }
  }, [locationPermission]);

  const loadTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      const entries = await getTimeEntries();
      const userEntries = entries.filter(e => e.userId === userId);
      setTimeEntries(userEntries);
      
      const active = userEntries.find(e => !e.clockOut);
      setCurrentEntry(active || null);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTimeEntries();
    requestLocationPermission();
  }, [loadTimeEntries, requestLocationPermission]);

  const clockIn = useCallback(async (shiftId: string) => {
    try {
      const location = await getCurrentLocation();
      const entry: TimeEntry = {
        id: Date.now().toString(),
        userId,
        shiftId,
        clockIn: new Date().toISOString(),
        location,
      };
      
      await saveTimeEntry(entry);
      setCurrentEntry(entry);
      await loadTimeEntries();
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  }, [userId, getCurrentLocation, loadTimeEntries]);

  const clockOut = useCallback(async () => {
    if (!currentEntry) return;

    try {
      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(currentEntry.clockIn);
      const totalHours = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      await updateTimeEntry(currentEntry.id, {
        clockOut: clockOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
      });
      
      setCurrentEntry(null);
      await loadTimeEntries();
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
  }, [currentEntry, loadTimeEntries]);

  const startBreak = useCallback(async () => {
    if (!currentEntry) return;

    try {
      await updateTimeEntry(currentEntry.id, {
        breakStart: new Date().toISOString(),
      });
      await loadTimeEntries();
    } catch (error) {
      console.error('Error starting break:', error);
      throw error;
    }
  }, [currentEntry, loadTimeEntries]);

  const endBreak = useCallback(async () => {
    if (!currentEntry) return;

    try {
      await updateTimeEntry(currentEntry.id, {
        breakEnd: new Date().toISOString(),
      });
      await loadTimeEntries();
    } catch (error) {
      console.error('Error ending break:', error);
      throw error;
    }
  }, [currentEntry, loadTimeEntries]);

  return {
    timeEntries,
    currentEntry,
    loading,
    locationPermission,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    loadTimeEntries,
  };
}
