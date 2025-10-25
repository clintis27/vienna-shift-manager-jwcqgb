
import React, { useEffect } from 'react';
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
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { formatTime, formatDate } from '@/utils/dateHelpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function TimeTrackingScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const {
    timeEntries,
    currentEntry,
    loading,
    locationPermission,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
  } = useTimeTracking(user?.id || '');

  const handleClockIn = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to clock in.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await clockIn('current-shift-id');
      Alert.alert('Success', 'Clocked in successfully!');
    } catch (error) {
      console.error('Clock in error:', error);
      Alert.alert('Error', 'Failed to clock in. Please try again.');
    }
  };

  const handleClockOut = async () => {
    Alert.alert(
      'Clock Out',
      'Are you sure you want to clock out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock Out',
          onPress: async () => {
            try {
              await clockOut();
              Alert.alert('Success', 'Clocked out successfully!');
            } catch (error) {
              console.error('Clock out error:', error);
              Alert.alert('Error', 'Failed to clock out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBreakStart = async () => {
    try {
      await startBreak();
      Alert.alert('Success', 'Break started');
    } catch (error) {
      console.error('Break start error:', error);
      Alert.alert('Error', 'Failed to start break. Please try again.');
    }
  };

  const handleBreakEnd = async () => {
    try {
      await endBreak();
      Alert.alert('Success', 'Break ended');
    } catch (error) {
      console.error('Break end error:', error);
      Alert.alert('Error', 'Failed to end break. Please try again.');
    }
  };

  const getElapsedTime = () => {
    if (!currentEntry) return '00:00:00';

    const start = new Date(currentEntry.clockIn);
    const now = new Date();
    const diff = now.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingSpinner isDark={isDark} message="Loading time entries..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statusTitle, { color: theme.text }]}>
            Current Status
          </Text>
          
          {currentEntry ? (
            <>
              <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Clocked In</Text>
              </View>
              
              <Text style={[styles.elapsedTime, { color: theme.text }]}>
                {getElapsedTime()}
              </Text>
              
              <Text style={[styles.clockInTime, { color: theme.textSecondary }]}>
                Clocked in at {new Date(currentEntry.clockIn).toLocaleTimeString()}
              </Text>

              {currentEntry.location && (
                <View style={styles.locationInfo}>
                  <IconSymbol name="location" size={16} color={theme.textSecondary} />
                  <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                    Location tracked
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={[styles.statusBadge, { backgroundColor: theme.textSecondary }]}>
                <Text style={styles.statusText}>Not Clocked In</Text>
              </View>
              <Text style={[styles.statusMessage, { color: theme.textSecondary }]}>
                Clock in to start tracking your time
              </Text>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!currentEntry ? (
            <TouchableOpacity
              style={[buttonStyles.primary, { backgroundColor: theme.primary }]}
              onPress={handleClockIn}
            >
              <IconSymbol name="clock" size={20} color="#FFFFFF" />
              <Text style={buttonStyles.primaryText}>Clock In</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[buttonStyles.primary, { backgroundColor: '#FF6B6B' }]}
                onPress={handleClockOut}
              >
                <IconSymbol name="clock" size={20} color="#FFFFFF" />
                <Text style={buttonStyles.primaryText}>Clock Out</Text>
              </TouchableOpacity>

              {!currentEntry.breakStart ? (
                <TouchableOpacity
                  style={[buttonStyles.secondary, { borderColor: theme.primary }]}
                  onPress={handleBreakStart}
                >
                  <IconSymbol name="pause.circle" size={20} color={theme.primary} />
                  <Text style={[buttonStyles.secondaryText, { color: theme.primary }]}>
                    Start Break
                  </Text>
                </TouchableOpacity>
              ) : !currentEntry.breakEnd ? (
                <TouchableOpacity
                  style={[buttonStyles.secondary, { borderColor: theme.primary }]}
                  onPress={handleBreakEnd}
                >
                  <IconSymbol name="play.circle" size={20} color={theme.primary} />
                  <Text style={[buttonStyles.secondaryText, { color: theme.primary }]}>
                    End Break
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>

        {/* Recent Entries */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Time Entries
          </Text>

          {timeEntries.length === 0 ? (
            <EmptyState
              icon="clock"
              title="No Time Entries"
              message="Your time tracking history will appear here"
              isDark={isDark}
            />
          ) : (
            timeEntries.slice(0, 10).map((entry) => (
              <View
                key={entry.id}
                style={[styles.entryCard, { borderColor: theme.border }]}
              >
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryDate, { color: theme.text }]}>
                    {formatDate(entry.clockIn)}
                  </Text>
                  {entry.totalHours && (
                    <Text style={[styles.entryHours, { color: theme.primary }]}>
                      {entry.totalHours}h
                    </Text>
                  )}
                </View>
                
                <View style={styles.entryTimes}>
                  <View style={styles.entryTime}>
                    <IconSymbol name="arrow.right.circle" size={16} color="#4CAF50" />
                    <Text style={[styles.entryTimeText, { color: theme.textSecondary }]}>
                      In: {new Date(entry.clockIn).toLocaleTimeString()}
                    </Text>
                  </View>
                  
                  {entry.clockOut && (
                    <View style={styles.entryTime}>
                      <IconSymbol name="arrow.left.circle" size={16} color="#FF6B6B" />
                      <Text style={[styles.entryTimeText, { color: theme.textSecondary }]}>
                        Out: {new Date(entry.clockOut).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>

                {entry.breakStart && entry.breakEnd && (
                  <Text style={[styles.breakInfo, { color: theme.textSecondary }]}>
                    Break: {new Date(entry.breakStart).toLocaleTimeString()} -{' '}
                    {new Date(entry.breakEnd).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  statusCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  elapsedTime: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clockInTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actions: {
    paddingHorizontal: 16,
    gap: 12,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryHours: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryTimes: {
    gap: 4,
  },
  entryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTimeText: {
    fontSize: 12,
  },
  breakInfo: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
