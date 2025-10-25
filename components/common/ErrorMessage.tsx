
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, darkColors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  isDark?: boolean;
}

export default function ErrorMessage({ 
  message, 
  onRetry,
  isDark = false 
}: ErrorMessageProps) {
  const theme = isDark ? darkColors : colors;

  return (
    <View style={styles.container}>
      <IconSymbol 
        name="exclamationmark.triangle" 
        size={48} 
        color={theme.error || '#FF6B6B'} 
      />
      <Text style={[styles.message, { color: theme.text }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
