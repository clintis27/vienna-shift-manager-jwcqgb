
import { StyleSheet } from 'react-native';
import { colors, darkColors } from './commonStyles';

// Breakfast Theme - Plant Shop Style (Green/Natural)
export const breakfastTheme = {
  light: {
    primary: '#7BA05B',
    secondary: '#F4D03F',
    background: '#F5F9F3',
    card: '#FFFFFF',
    cardSecondary: '#E8F5E1',
    accent: '#9BC17D',
    text: '#2D3E1F',
    textSecondary: '#6B7C5A',
    border: '#D4E5CC',
    shadow: 'rgba(123, 160, 91, 0.15)',
  },
  dark: {
    primary: '#7BA05B',
    secondary: '#F4D03F',
    background: '#1A1F16',
    card: '#252B20',
    cardSecondary: '#2D3528',
    accent: '#9BC17D',
    text: '#E8F5E1',
    textSecondary: '#A8B89A',
    border: '#3A4532',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Front Desk Theme - Transport Card Style (Coral/Teal)
export const frontDeskTheme = {
  light: {
    primary: '#FF6B5A',
    secondary: '#7DD3C0',
    background: '#F8FAFB',
    card: '#FFFFFF',
    cardSecondary: '#E8F4F2',
    accent: '#FFB4A8',
    text: '#2D3E4E',
    textSecondary: '#6B7C8C',
    border: '#D4E5E8',
    shadow: 'rgba(255, 107, 90, 0.15)',
  },
  dark: {
    primary: '#FF6B5A',
    secondary: '#7DD3C0',
    background: '#1A1F22',
    card: '#252B2E',
    cardSecondary: '#2D3538',
    accent: '#FFB4A8',
    text: '#E8F4F6',
    textSecondary: '#A8B8C0',
    border: '#3A4548',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Housekeeping Theme - Air Quality Data Style (Blue/Gray)
export const housekeepingTheme = {
  light: {
    primary: '#6B9AC4',
    secondary: '#F4D03F',
    background: '#F5F8FA',
    card: '#FFFFFF',
    cardSecondary: '#E8F1F8',
    accent: '#94B8D9',
    text: '#2D3E4E',
    textSecondary: '#6B7C8C',
    border: '#D4E1E8',
    shadow: 'rgba(107, 154, 196, 0.15)',
  },
  dark: {
    primary: '#6B9AC4',
    secondary: '#F4D03F',
    background: '#1A1F24',
    card: '#252B32',
    cardSecondary: '#2D353C',
    accent: '#94B8D9',
    text: '#E8F1F8',
    textSecondary: '#A8B8C8',
    border: '#3A4550',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const getCategoryTheme = (category: string, isDark: boolean) => {
  switch (category) {
    case 'breakfast':
      return isDark ? breakfastTheme.dark : breakfastTheme.light;
    case 'frontdesk':
      return isDark ? frontDeskTheme.dark : frontDeskTheme.light;
    case 'housekeeping':
      return isDark ? housekeepingTheme.dark : housekeepingTheme.light;
    default:
      return isDark ? breakfastTheme.dark : breakfastTheme.light;
  }
};

// Layout styles for each category
export const breakfastStyles = StyleSheet.create({
  container: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroCard: {
    borderRadius: 32,
    padding: 28,
    marginBottom: 20,
  },
  actionCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  shiftCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  imageCard: {
    borderRadius: 28,
    overflow: 'hidden',
    aspectRatio: 1,
  },
});

export const frontDeskStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    gap: 12,
  },
  shiftCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  listItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
});

export const housekeepingStyles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  actionCard: {
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  shiftCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  dataCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
});

export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'breakfast':
      return breakfastStyles;
    case 'frontdesk':
      return frontDeskStyles;
    case 'housekeeping':
      return housekeepingStyles;
    default:
      return breakfastStyles;
  }
};
