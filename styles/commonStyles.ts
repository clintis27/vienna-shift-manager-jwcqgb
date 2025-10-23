
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Soft Pastel Colors - Inspired by the minimalist design image
export const colors = {
  // Base Colors
  background: '#F5F3F0',              // Warm Off-White
  backgroundSecondary: '#FAFAF8',     // Very Light Cream
  text: '#2D2D2D',                    // Soft Black
  textSecondary: '#8B8B8B',           // Medium Gray
  textTertiary: '#B8B8B8',            // Light Gray
  
  // Pastel Accent Colors (Muted & Soft)
  sage: '#B8C5B8',                    // Sage Green
  terracotta: '#D4A59A',              // Terracotta/Dusty Rose
  cream: '#E8DDD0',                   // Warm Cream
  dustyBlue: '#C4D4D9',               // Dusty Blue
  softPeach: '#E8C4B8',               // Soft Peach
  mintCream: '#D4E4D8',               // Mint Cream
  
  // Functional Colors (Muted)
  primary: '#B8C5B8',                 // Sage Green
  secondary: '#D4A59A',               // Terracotta
  accent: '#C4D4D9',                  // Dusty Blue
  
  card: '#FFFFFF',                    // Pure White
  cardSecondary: '#FAFAF8',           // Light Cream
  
  error: '#D4A59A',                   // Soft Terracotta (muted error)
  success: '#B8C5B8',                 // Sage Green
  warning: '#E8C4B8',                 // Soft Peach
  
  border: '#E8E6E3',                  // Very Light Gray
  shadow: 'rgba(45, 45, 45, 0.06)',   // Subtle Shadow
  
  // Category Colors (for hotel departments)
  breakfast: '#E8C4B8',               // Soft Peach
  housekeeping: '#B8C5B8',            // Sage Green
  frontDesk: '#C4D4D9',               // Dusty Blue
};

// Dark mode colors (muted dark palette)
export const darkColors = {
  background: '#1A1A1A',
  backgroundSecondary: '#252525',
  text: '#F5F3F0',
  textSecondary: '#A8A8A8',
  textTertiary: '#6B6B6B',
  
  sage: '#8B9B8B',
  terracotta: '#A8857A',
  cream: '#B8ADA0',
  dustyBlue: '#94A4A9',
  softPeach: '#B89488',
  mintCream: '#A4B4A8',
  
  primary: '#8B9B8B',
  secondary: '#A8857A',
  accent: '#94A4A9',
  
  card: '#252525',
  cardSecondary: '#2D2D2D',
  
  error: '#A8857A',
  success: '#8B9B8B',
  warning: '#B89488',
  
  border: '#3A3A3A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  breakfast: '#B89488',
  housekeeping: '#8B9B8B',
  frontDesk: '#94A4A9',
};

export const buttonStyles = StyleSheet.create({
  // Soft Pastel Buttons
  sage: {
    backgroundColor: colors.sage,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 20px rgba(184, 197, 184, 0.25)',
    elevation: 3,
  },
  terracotta: {
    backgroundColor: colors.terracotta,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 20px rgba(212, 165, 154, 0.25)',
    elevation: 3,
  },
  cream: {
    backgroundColor: colors.cream,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 20px rgba(232, 221, 208, 0.25)',
    elevation: 3,
  },
  dustyBlue: {
    backgroundColor: colors.dustyBlue,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 20px rgba(196, 212, 217, 0.25)',
    elevation: 3,
  },
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 20px rgba(184, 197, 184, 0.3)',
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 20px rgba(212, 165, 154, 0.3)',
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textOutline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
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
  // Soft Card with Minimal Shadow
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 16px rgba(45, 45, 45, 0.04)',
    elevation: 1,
  },
  // Card with Subtle Border
  cardBordered: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Elevated Card
  cardFloating: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0px 8px 24px rgba(45, 45, 45, 0.06)',
    elevation: 2,
  },
  // Large Hero Card
  cardHero: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 28,
    marginBottom: 24,
    boxShadow: '0px 12px 32px rgba(45, 45, 45, 0.08)',
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  textSmall: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  shadow: {
    boxShadow: '0px 6px 20px rgba(45, 45, 45, 0.06)',
    elevation: 2,
  },
  shadowLarge: {
    boxShadow: '0px 12px 32px rgba(45, 45, 45, 0.08)',
    elevation: 4,
  },
});
