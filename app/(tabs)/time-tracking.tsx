
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { getUser, getTimeEntries, saveTimeEntry, updateTimeEntry } from '@/utils/storage';
import { TimeEntry, User } from '@/types';

export default function TimeTrackingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    loadData();
    requestLocationPermission();

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    const entries = await getTimeEntries();
    const activeEntry = entries.find(e => !e.clockOut && e.userId === userData?.id);
    if (activeEntry) {
      setCurrentEntry(activeEntry);
      setIsOnBreak(!!activeEntry.breakStart && !activeEntry.breakEnd);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for time tracking'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      console.log('Location obtained:', loc.coords);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleClockIn = async () => {
    if (!location) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: user?.id || '',
      shiftId: 'shift-today',
      clockIn: new Date().toISOString(),
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };

    await saveTimeEntry(newEntry);
    setCurrentEntry(newEntry);
    console.log('Clocked in:', newEntry);
    Alert.alert('Success', 'You have clocked in successfully!');
  };

  const handleClockOut = async () => {
    if (!currentEntry) {
      console.log('No active entry to clock out');
      return;
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(currentEntry.clockIn);
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    await updateTimeEntry(currentEntry.id, {
      clockOut: clockOutTime.toISOString(),
      totalHours: parseFloat(totalHours.toFixed(2)),
    });

    console.log('Clocked out:', { totalHours });
    Alert.alert(
      'Clocked Out',
      `Total hours worked: ${totalHours.toFixed(2)} hours`,
      [{ text: 'OK', onPress: () => setCurrentEntry(null) }]
    );
  };

  const handleBreakStart = async () => {
    if (!currentEntry) {
      console.log('No active entry for break');
      return;
    }

    await updateTimeEntry(currentEntry.id, {
      breakStart: new Date().toISOString(),
    });

    setIsOnBreak(true);
    console.log('Break started');
    Alert.alert('Break Started', 'Enjoy your break!');
  };

  const handleBreakEnd = async () => {
    if (!currentEntry) {
      console.log('No active entry for break end');
      return;
    }

    await updateTimeEntry(currentEntry.id, {
      breakEnd: new Date().toISOString(),
    });

    setIsOnBreak(false);
    console.log('Break ended');
    Alert.alert('Break Ended', 'Welcome back!');
  };

  const getElapsedTime = () => {
    if (!currentEntry) {
      return '00:00:00';
    }

    const start = new Date(currentEntry.clockIn);
    const diff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Time */}
        <View style={[styles.timeCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.currentTimeLabel, { color: theme.textSecondary }]}>
            Current Time
          </Text>
          <Text style={[styles.currentTime, { color: theme.text }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={[styles.currentDate, { color: theme.textSecondary }]}>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Status Card */}
        {currentEntry ? (
          <View style={[styles.statusCard, { backgroundColor: theme.success }]}>
            <View style={styles.statusHeader}>
              <IconSymbol name="checkmark.circle.fill" size={32} color={theme.card} />
              <Text style={[styles.statusTitle, { color: theme.card }]}>
                {isOnBreak ? 'On Break' : 'Clocked In'}
              </Text>
            </View>
            <Text style={[styles.elapsedTime, { color: theme.card }]}>
              {getElapsedTime()}
            </Text>
            <Text style={[styles.statusSubtitle, { color: theme.card }]}>
              Since {new Date(currentEntry.clockIn).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ) : (
          <View style={[styles.statusCard, { backgroundColor: theme.card, borderWidth: 2, borderColor: theme.border }]}>
            <IconSymbol name="clock" size={48} color={theme.textSecondary} />
            <Text style={[styles.notClockedText, { color: theme.textSecondary }]}>
              Not Clocked In
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!currentEntry ? (
            <TouchableOpacity
              style={[buttonStyles.primary, styles.mainButton, { backgroundColor: theme.primary }]}
              onPress={handleClockIn}
            >
              <IconSymbol name="play.circle.fill" size={24} color={theme.card} />
              <Text style={[styles.buttonText, { color: theme.card }]}>Clock In</Text>
            </TouchableOpacity>
          ) : (
            <>
              {!isOnBreak ? (
                <>
                  <TouchableOpacity
                    style={[buttonStyles.secondary, styles.actionButton, { backgroundColor: theme.warning }]}
                    onPress={handleBreakStart}
                  >
                    <IconSymbol name="pause.circle.fill" size={24} color={theme.text} />
                    <Text style={[styles.buttonText, { color: theme.text }]}>Start Break</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.actionButton, { backgroundColor: theme.error }]}
                    onPress={handleClockOut}
                  >
                    <IconSymbol name="stop.circle.fill" size={24} color={theme.card} />
                    <Text style={[styles.buttonText, { color: theme.card }]}>Clock Out</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[buttonStyles.primary, styles.mainButton, { backgroundColor: theme.success }]}
                  onPress={handleBreakEnd}
                >
                  <IconSymbol name="play.circle.fill" size={24} color={theme.card} />
                  <Text style={[styles.buttonText, { color: theme.card }]}>End Break</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Location Info */}
        {location && (
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={styles.infoRow}>
              <IconSymbol name="location.fill" size={20} color={theme.primary} />
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Location Tracking Active
              </Text>
            </View>
            <Text style={[styles.infoText, { color: theme.text }]}>
              Lat: {location.coords.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.infoText, { color: theme.text }]}>
              Lon: {location.coords.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: theme.highlight }]}>
          <IconSymbol name="info.circle" size={20} color={theme.primary} />
          <Text style={[styles.infoBoxText, { color: theme.text }]}>
            Your location is tracked for time entries to ensure accurate attendance records.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  timeCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  currentTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  currentDate: {
    fontSize: 16,
  },
  statusCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  elapsedTime: {
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  notClockedText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
