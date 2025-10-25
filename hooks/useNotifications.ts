
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types';
import {
  getNotifications,
  saveNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/utils/storage';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notifs = await getNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback(async (notification: Notification) => {
    try {
      await saveNotification(notification);
      await loadNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, [loadNotifications]);

  const deleteNotif = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllRead,
    deleteNotif,
  };
}
