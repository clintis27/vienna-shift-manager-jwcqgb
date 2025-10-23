
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';
import { getUser, removeUser, setAuthenticated, clearAllData } from '@/utils/storage';
import { User } from '@/types';
import { getCategoryName, getCategoryColor } from '@/utils/mockData';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
    console.log('User loaded:', userData?.firstName);
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
            console.log('User logged out');
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all local data including shifts and time entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            console.log('All data cleared');
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return theme.error;
      case 'manager':
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.card }]}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role || 'employee') }]}>
              <Text style={[styles.roleText, { color: theme.card }]}>
                {user?.role?.toUpperCase()}
              </Text>
            </View>
            {user?.category && (
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(user.category) }]}>
                <Text style={[styles.categoryText, { color: theme.card }]}>
                  {getCategoryName(user.category).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Information</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            {user?.category && (
              <>
                <View style={styles.infoRow}>
                  <IconSymbol name="tag" size={20} color={theme.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                      Category
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {getCategoryName(user.category)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              </>
            )}

            <View style={styles.infoRow}>
              <IconSymbol name="building.2" size={20} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Department
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {user?.department || 'Not assigned'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <IconSymbol name="phone" size={20} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Phone Number
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {user?.phoneNumber || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={20} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Member Since
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented')}
          >
            <IconSymbol name="bell" size={24} color={theme.text} />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Notifications
            </Text>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented')}
          >
            <IconSymbol name="lock" size={24} color={theme.text} />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Privacy & Security
            </Text>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented')}
          >
            <IconSymbol name="questionmark.circle" size={24} color={theme.text} />
            <Text style={[styles.settingText, { color: theme.text }]}>
              Help & Support
            </Text>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.warning }]}
            onPress={handleClearData}
          >
            <IconSymbol name="trash" size={20} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Clear All Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color={theme.card} />
            <Text style={[styles.actionButtonText, { color: theme.card }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: theme.textSecondary }]}>
            Hotel House of Vienna
          </Text>
          <Text style={[styles.appInfoText, { color: theme.textSecondary }]}>
            Shift Manager v1.0.0
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
  profileHeader: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
