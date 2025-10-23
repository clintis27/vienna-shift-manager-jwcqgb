
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Vienna Hotel Colors
export const colors = {
  background: '#F5F5F5',        // Light Gray
  text: '#212121',              // Dark Gray
  textSecondary: '#757575',     // Medium Gray
  primary: '#1976D2',           // Deep Blue - Vienna hotel color
  secondary: '#FFC107',         // Gold - Vienna hotel color
  accent: '#448AFF',            // Light Blue
  card: '#FFFFFF',              // White
  highlight: '#BBDEFB',         // Very Light Blue
  error: '#D32F2F',             // Red for errors
  success: '#388E3C',           // Green for success
  warning: '#F57C00',           // Orange for warnings
  border: '#E0E0E0',            // Light border
  shadow: 'rgba(0, 0, 0, 0.1)', // Shadow color
};

// Dark mode colors
export const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#42A5F5',
  secondary: '#FFD54F',
  accent: '#82B1FF',
  card: '#1E1E1E',
  highlight: '#1565C0',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  border: '#2C2C2C',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  textOutline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  shadow: {
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 5,
  },
});
