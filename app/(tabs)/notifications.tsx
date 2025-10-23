
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/utils/storage';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
    console.log('Loaded notifications:', notifs.length);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    await loadNotifications();
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(notificationId);
            await loadNotifications();
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shift_change':
        return 'calendar';
      case 'reminder':
        return 'bell';
      case 'approval':
        return 'checkmark.circle';
      case 'warning':
        return 'exclamationmark.triangle';
      default:
        return 'info.circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'shift_change':
        return theme.pastelBlue;
      case 'reminder':
        return theme.pastelPink;
      case 'approval':
        return theme.success;
      case 'warning':
        return theme.warning;
      default:
        return theme.pastelMint;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: theme.pastelBlue }]}
            onPress={handleMarkAllAsRead}
          >
            <Text style={[styles.markAllText, { color: theme.text }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && { backgroundColor: theme.pastelBlue },
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: theme.text },
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && { backgroundColor: theme.pastelBlue },
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              { color: theme.text },
              filter === 'unread' && styles.filterTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol name="bell.slash" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Notifications
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {filter === 'unread'
                ? 'You&apos;re all caught up!'
                : 'You&apos;ll see notifications here'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                { backgroundColor: theme.card },
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => handleMarkAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getNotificationColor(notification.type) },
                  ]}
                >
                  <IconSymbol
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={theme.text}
                  />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: theme.textTertiary }]}>
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(notification.id)}
                >
                  <IconSymbol name="trash" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

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
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterTextActive: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
