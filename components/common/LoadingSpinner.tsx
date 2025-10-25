
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, darkColors } from '@/styles/commonStyles';

interface LoadingSpinnerProps {
  message?: string;
  isDark?: boolean;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ 
  message, 
  isDark = false,
  size = 'large' 
}: LoadingSpinnerProps) {
  const theme = isDark ? darkColors : colors;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.primary} />
      {message && (
        <Text style={[styles.message, { color: theme.text }]}>
          {message}
        </Text>
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
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});
