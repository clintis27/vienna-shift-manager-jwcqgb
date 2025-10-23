
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { colors, darkColors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  Switch,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { getCategoryName, getCategoryColor } from '@/utils/mockData';
import { User, NotificationPreferences } from '@/types';
import { getUser, removeUser, setAuthenticated, clearAllData, saveUser } from '@/utils/storage';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    shiftChanges: true,
    reminders: true,
    approvals: true,
  });
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? darkColors : colors;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
      if (userData?.notificationPreferences) {
        setNotificationPrefs(userData.notificationPreferences);
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const handleNotificationPrefChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);
    
    if (user) {
      const updatedUser = { ...user, notificationPreferences: newPrefs };
      await saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await removeUser();
            await setAuthenticated(false);
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all local data including shifts, time entries, and notifications. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? currentColors.terracotta : currentColors.sage;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentColors.text }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: getCategoryColor(user?.category || 'breakfast') }]}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
            <Text style={[styles.avatarText, { color: currentColors.text }]}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.name, { color: currentColors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.email, { color: currentColors.textSecondary }]}>
            {user?.email || 'user@hotel.com'}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Text style={[styles.badgeText, { color: currentColors.text }]}>
                {getCategoryName(user?.category || 'breakfast')}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getRoleBadgeColor(user?.role || 'employee') }]}>
              <Text style={[styles.badgeText, { color: currentColors.text }]}>
                {user?.role === 'admin' ? 'Admin' : 'Employee'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Notifications
          </Text>
          
          <View style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <IconSymbol name="bell.fill" size={20} color={currentColors.sage} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                    Shift Changes
                  </Text>
                  <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                    Get notified about schedule updates
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationPrefs.shiftChanges}
                onValueChange={(value) => handleNotificationPrefChange('shiftChanges', value)}
                trackColor={{ false: currentColors.border, true: currentColors.sage }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <IconSymbol name="clock.fill" size={20} color={currentColors.dustyBlue} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                    Reminders
                  </Text>
                  <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                    Receive shift reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationPrefs.reminders}
                onValueChange={(value) => handleNotificationPrefChange('reminders', value)}
                trackColor={{ false: currentColors.border, true: currentColors.sage }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={currentColors.terracotta} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: currentColors.text }]}>
                    Approvals
                  </Text>
                  <Text style={[styles.settingDescription, { color: currentColors.textSecondary }]}>
                    Request approval notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationPrefs.approvals}
                onValueChange={(value) => handleNotificationPrefChange('approvals', value)}
                trackColor={{ false: currentColors.border, true: currentColors.sage }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Actions
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.card }]}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <IconSymbol name="doc.text.fill" size={22} color={currentColors.sage} />
            <Text style={[styles.actionText, { color: currentColors.text }]}>
              View Reports
            </Text>
            <IconSymbol name="chevron.right" size={18} color={currentColors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.card }]}
            onPress={handleClearData}
          >
            <IconSymbol name="trash.fill" size={22} color={currentColors.terracotta} />
            <Text style={[styles.actionText, { color: currentColors.text }]}>
              Clear All Data
            </Text>
            <IconSymbol name="chevron.right" size={18} color={currentColors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: currentColors.terracotta }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square.fill" size={22} color={currentColors.text} />
            <Text style={[styles.logoutText, { color: currentColors.text }]}>
              Logout
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    boxShadow: '0px 8px 24px rgba(45, 45, 45, 0.08)',
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  settingCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    boxShadow: '0px 4px 16px rgba(45, 45, 45, 0.04)',
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    boxShadow: '0px 4px 16px rgba(45, 45, 45, 0.04)',
    elevation: 1,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    boxShadow: '0px 6px 20px rgba(212, 165, 154, 0.3)',
    elevation: 3,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
