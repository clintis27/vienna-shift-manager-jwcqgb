
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Modern Pastel Colors - Inspired by the design images
export const colors = {
  background: '#FFFFFF',           // Pure White
  backgroundSecondary: '#F8F9FA',  // Very Light Gray
  text: '#1A1A1A',                 // Almost Black
  textSecondary: '#8E8E93',        // iOS Gray
  textTertiary: '#C7C7CC',         // Light Gray
  
  // Pastel Gradient Colors
  pastelBlue: '#A8D5FF',           // Light Blue
  pastelPink: '#FFB3D9',           // Light Pink
  pastelMint: '#B3F5D1',           // Mint Green
  pastelPurple: '#D4B3FF',         // Light Purple
  pastelYellow: '#FFE5B3',         // Light Yellow
  pastelPeach: '#FFD4B3',          // Light Peach
  
  // Solid Accent Colors
  primary: '#007AFF',              // iOS Blue
  secondary: '#5856D6',            // iOS Purple
  accent: '#34C759',               // iOS Green
  
  card: '#FFFFFF',                 // White
  cardSecondary: '#F2F2F7',        // Light Gray Card
  
  error: '#FF3B30',                // iOS Red
  success: '#34C759',              // iOS Green
  warning: '#FF9500',              // iOS Orange
  
  border: '#E5E5EA',               // Light Border
  shadow: 'rgba(0, 0, 0, 0.08)',   // Subtle Shadow
  
  // Category Colors (for hotel departments)
  breakfast: '#FFE5B3',            // Light Yellow
  housekeeping: '#B3F5D1',         // Mint Green
  frontDesk: '#A8D5FF',            // Light Blue
};

// Dark mode colors
export const darkColors = {
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#98989D',
  textTertiary: '#48484A',
  
  pastelBlue: '#4A90E2',
  pastelPink: '#E85D9F',
  pastelMint: '#5FD68A',
  pastelPurple: '#9B7FE8',
  pastelYellow: '#FFB84D',
  pastelPeach: '#FF9F66',
  
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  accent: '#30D158',
  
  card: '#1C1C1E',
  cardSecondary: '#2C2C2E',
  
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  
  border: '#38383A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  breakfast: '#8B7355',
  housekeeping: '#4A8B6F',
  frontDesk: '#4A6B8B',
};

export const buttonStyles = StyleSheet.create({
  // Pastel Gradient Buttons
  pastelBlue: {
    backgroundColor: colors.pastelBlue,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(168, 213, 255, 0.4)',
    elevation: 4,
  },
  pastelPink: {
    backgroundColor: colors.pastelPink,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(255, 179, 217, 0.4)',
    elevation: 4,
  },
  pastelMint: {
    backgroundColor: colors.pastelMint,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(179, 245, 209, 0.4)',
    elevation: 4,
  },
  pastelPurple: {
    backgroundColor: colors.pastelPurple,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(212, 179, 255, 0.4)',
    elevation: 4,
  },
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(0, 122, 255, 0.3)',
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(88, 86, 214, 0.3)',
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  textWhite: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  textOutline: {
    color: colors.primary,
    fontSize: 17,
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
    padding: 24,
  },
  // Modern Card with Subtle Shadow
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  // Card with Border (Alternative Style)
  cardBordered: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Floating Card with More Shadow
  cardFloating: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
    elevation: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  textSmall: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 17,
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
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  shadow: {
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
    elevation: 4,
  },
  shadowLarge: {
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.12)',
    elevation: 6,
  },
});
