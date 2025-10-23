
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
import { notifyApproval, notifyShiftChange } from '@/utils/notifications';
import { User, ShiftRequest, Shift } from '@/types';
import { getCategoryColor, getCategoryName } from '@/utils/mockData';

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ShiftRequest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    let allRequests = await getShiftRequests();
    
    // Filter requests based on admin category
    if (userData?.role === 'admin' && userData.category) {
      allRequests = allRequests.filter(r => r.category === userData.category);
    }

    // Show only pending requests
    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    setRequests(pendingRequests);
    
    console.log('Loaded shift requests:', pendingRequests.length);
  };

  const handleApprove = async (request: ShiftRequest) => {
    Alert.alert(
      'Approve Request',
      `Approve shift request for ${request.userName} on ${request.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            // Update request status
            await updateShiftRequest(request.id, { status: 'approved' });

            // Create a new shift
            const shifts = await getShifts();
            const newShift: Shift = {
              id: `shift-${Date.now()}`,
              userId: request.userId,
              userName: request.userName,
              department: getCategoryName(request.category),
              category: request.category,
              startTime: request.startTime,
              endTime: request.endTime,
              date: request.date,
              status: 'scheduled',
              position: 'Staff',
              color: getCategoryColor(request.category),
              notes: request.notes,
            };
            await saveShifts([...shifts, newShift]);

            // Send notifications
            const shiftDetails = `${request.date} ${request.startTime}-${request.endTime}`;
            await notifyApproval(request.userId, 'shift', 'approved', shiftDetails);
            await notifyShiftChange(request.userId, request.userName, 'new', shiftDetails);

            Alert.alert('Success', 'Shift request approved and scheduled!');
            await loadData();
          },
        },
      ]
    );
  };

  const handleReject = async (request: ShiftRequest) => {
    Alert.alert(
      'Reject Request',
      `Reject shift request for ${request.userName} on ${request.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updateShiftRequest(request.id, { status: 'rejected' });

            // Send notification
            const shiftDetails = `${request.date} ${request.startTime}-${request.endTime}`;
            await notifyApproval(request.userId, 'shift', 'rejected', shiftDetails);

            Alert.alert('Request Rejected', 'The shift request has been rejected.');
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Admin Panel
        </Text>
        {user?.category && (
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) }]}>
            <Text style={[styles.categoryText, { color: theme.card }]}>
              {getCategoryName(user.category).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pending Requests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Pending Shift Requests ({requests.length})
          </Text>

          {requests.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <IconSymbol name="checkmark.circle" size={64} color={theme.success} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                All Caught Up!
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No pending shift requests at the moment
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.requestHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(request.category) }]} />
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestName, { color: theme.text }]}>
                      {request.userName}
                    </Text>
                    <Text style={[styles.requestCategory, { color: theme.textSecondary }]}>
                      {getCategoryName(request.category)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="calendar" size={16} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {new Date(request.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="clock" size={16} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {request.startTime} - {request.endTime}
                    </Text>
                  </View>
                </View>

                {request.notes && (
                  <View style={[styles.notesContainer, { backgroundColor: theme.background }]}>
                    <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                      {request.notes}
                    </Text>
                  </View>
                )}

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[buttonStyles.pastelMint, styles.actionButton]}
                    onPress={() => handleApprove(request)}
                  >
                    <IconSymbol name="checkmark" size={20} color={theme.text} />
                    <Text style={[buttonStyles.text, { color: theme.text }]}>
                      Approve
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[buttonStyles.pastelPink, styles.actionButton]}
                    onPress={() => handleReject(request)}
                  >
                    <IconSymbol name="xmark" size={20} color={theme.text} />
                    <Text style={[buttonStyles.text, { color: theme.text }]}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
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
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  requestCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 15,
    fontWeight: '500',
  },
  notesContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
