
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
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { getUser, getShiftRequests, updateShiftRequest, saveShifts, getShifts } from '@/utils/storage';
import { getCategoryColor, getCategoryName } from '@/utils/mockData';
import { User, ShiftRequest, Shift } from '@/types';

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    let allRequests = await getShiftRequests();
    
    if (userData?.role === 'admin' && userData.category) {
      allRequests = allRequests.filter(r => r.category === userData.category);
    }

    setRequests(allRequests);

    const pending = allRequests.filter(r => r.status === 'pending').length;
    const approved = allRequests.filter(r => r.status === 'approved').length;
    const rejected = allRequests.filter(r => r.status === 'rejected').length;

    setStats({ pending, approved, rejected });
    console.log('Admin loaded requests:', allRequests.length);
  };

  const handleApprove = async (request: ShiftRequest) => {
    await updateShiftRequest(request.id, 'approved');
    
    const shifts = await getShifts();
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      userId: request.employeeId,
      date: request.date,
      startTime: '09:00',
      endTime: '17:00',
      department: getCategoryName(request.category),
      position: 'Staff',
      status: 'scheduled',
      category: request.category,
      color: getCategoryColor(request.category),
    };
    
    await saveShifts([...shifts, newShift]);
    await loadData();
    
    Alert.alert('Success', 'Shift request approved and scheduled');
  };

  const handleReject = async (request: ShiftRequest) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this shift request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updateShiftRequest(request.id, 'rejected');
            await loadData();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.success;
      case 'rejected':
        return theme.error;
      default:
        return theme.warning;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Hotel House of Vienna
          </Text>
          {user?.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) }]}>
              <Text style={[styles.categoryText, { color: theme.text }]}>
                {getCategoryName(user.category)} Admin
              </Text>
            </View>
          )}
        </View>

        {/* Add Shift Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, styles.addButton]}
          onPress={() => Alert.alert('Coming Soon', 'Manual shift creation will be available soon')}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <Text style={[buttonStyles.textWhite, { marginLeft: 8 }]}>Add Shift</Text>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.pastelBlue }]}>
              <IconSymbol name="house" size={24} color={theme.text} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Morning Shift</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.pastelPink }]}>
              <IconSymbol name="plus.circle" size={24} color={theme.text} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Afternoon Shift</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.pastelMint }]}>
              <IconSymbol name="moon" size={24} color={theme.text} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Night Shift</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.pastelPurple }]}>
              <IconSymbol name="doc.text" size={24} color={theme.text} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Night Shift</Text>
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Pending Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.map(request => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.requestHeader}>
                  <View style={[styles.requestIcon, { backgroundColor: theme.pastelYellow }]}>
                    <IconSymbol name="person" size={20} color={theme.text} />
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestEmployee, { color: theme.text }]}>
                      Employee #{request.employeeId.slice(-4)}
                    </Text>
                    <Text style={[styles.requestDate, { color: theme.textSecondary }]}>
                      {new Date(request.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.pastelMint }]}
                    onPress={() => handleApprove(request)}
                    activeOpacity={0.8}
                  >
                    <IconSymbol name="checkmark" size={18} color={theme.text} />
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                    onPress={() => handleReject(request)}
                    activeOpacity={0.8}
                  >
                    <IconSymbol name="xmark" size={18} color={theme.error} />
                    <Text style={[styles.actionButtonText, { color: theme.error }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Activity
            </Text>
            {processedRequests.slice(0, 10).map(request => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.requestHeader}>
                  <View style={[
                    styles.requestIcon,
                    { backgroundColor: request.status === 'approved' ? theme.pastelMint : theme.error + '20' }
                  ]}>
                    <IconSymbol 
                      name={request.status === 'approved' ? 'checkmark' : 'xmark'} 
                      size={20} 
                      color={request.status === 'approved' ? theme.text : theme.error} 
                    />
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestEmployee, { color: theme.text }]}>
                      Employee #{request.employeeId.slice(-4)}
                    </Text>
                    <Text style={[styles.requestDate, { color: theme.textSecondary }]}>
                      {new Date(request.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) + '20' }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                      {request.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol name="tray" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Requests</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Shift requests will appear here
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestEmployee: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
