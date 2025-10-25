
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, darkColors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  isDark?: boolean;
}

export default function EmptyState({ 
  icon, 
  title, 
  message,
  isDark = false 
}: EmptyStateProps) {
  const theme = isDark ? darkColors : colors;

  return (
    <View style={styles.container}>
      <IconSymbol 
        name={icon} 
        size={64} 
        color={theme.textSecondary} 
      />
      <Text style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
