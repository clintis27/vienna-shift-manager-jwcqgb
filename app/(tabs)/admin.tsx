
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { getUser, getShiftRequests, updateShiftRequest, saveShifts, getShifts } from '@/utils/storage';
import { User, ShiftRequest, Shift } from '@/types';
import { getCategoryColor, getCategoryName } from '@/utils/mockData';

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);
    
    if (userData && userData.role === 'admin' && userData.category) {
      const requests = await getShiftRequests();
      // Filter requests by admin's category
      const categoryRequests = requests.filter(req => req.category === userData.category);
      setShiftRequests(categoryRequests);
      console.log(`Loaded ${categoryRequests.length} requests for ${userData.category}`);
    }
  };

  const handleApprove = async (request: ShiftRequest) => {
    Alert.alert(
      'Approve Shift Request',
      `Approve shift for ${request.userName} on ${new Date(request.date).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            // Update request status
            await updateShiftRequest(request.id, { status: 'approved' });
            
            // Create actual shift
            const shift: Shift = {
              id: `shift-${Date.now()}`,
              userId: request.userId,
              userName: request.userName,
              department: getCategoryName(request.category),
              category: request.category,
              startTime: request.startTime,
              endTime: request.endTime,
              date: request.date,
              status: 'scheduled',
              position: getCategoryName(request.category) + ' Staff',
              color: getCategoryColor(request.category),
            };
            
            const shifts = await getShifts();
            await saveShifts([...shifts, shift]);
            
            Alert.alert('Success', 'Shift request approved and scheduled!');
            loadData();
          },
        },
      ]
    );
  };

  const handleReject = async (request: ShiftRequest) => {
    Alert.alert(
      'Reject Shift Request',
      `Reject shift for ${request.userName} on ${new Date(request.date).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updateShiftRequest(request.id, { status: 'rejected' });
            Alert.alert('Success', 'Shift request rejected.');
            loadData();
          },
        },
      ]
    );
  };

  const filteredRequests = shiftRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.warning;
      case 'approved':
        return theme.success;
      case 'rejected':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.centerContent}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            This screen is only available to administrators.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {getCategoryName(user.category || 'breakfast')} Admin
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage shift requests for your team
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.warning }]}>
            <Text style={[styles.statNumber, { color: theme.card }]}>
              {shiftRequests.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.card }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.success }]}>
            <Text style={[styles.statNumber, { color: theme.card }]}>
              {shiftRequests.filter(r => r.status === 'approved').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.card }]}>Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.error }]}>
            <Text style={[styles.statNumber, { color: theme.card }]}>
              {shiftRequests.filter(r => r.status === 'rejected').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.card }]}>Rejected</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filter === f ? theme.primary : theme.card,
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText,
                { color: filter === f ? theme.card : theme.text }
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Requests List */}
        <View style={styles.requestsList}>
          {filteredRequests.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <IconSymbol name="calendar" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No {filter !== 'all' ? filter : ''} requests
              </Text>
            </View>
          ) : (
            filteredRequests.map(request => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.card }]}>
                <View style={styles.requestInfo}>
                  <View style={styles.requestHeader}>
                    <Text style={[styles.requestName, { color: theme.text }]}>
                      {request.userName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                      <Text style={[styles.statusText, { color: theme.card }]}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <IconSymbol name="calendar" size={16} color={theme.textSecondary} />
                      <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                        {new Date(request.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                      <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                        {request.startTime} - {request.endTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {request.status === 'pending' && (
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.success }]}
                      onPress={() => handleApprove(request)}
                    >
                      <IconSymbol name="checkmark" size={20} color={theme.card} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.error }]}
                      onPress={() => handleReject(request)}
                    >
                      <IconSymbol name="xmark" size={20} color={theme.card} />
                    </TouchableOpacity>
                  </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestsList: {
    gap: 12,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  requestDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
