
import { saveUser, setAuthenticated } from '@/utils/storage';
import { colors, darkColors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateLogin } from '@/utils/mockData';
import * as LocalAuthentication from 'expo-local-authentication';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    console.log('Login: Attempting login for:', email);

    try {
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Login: Supabase auth error:', error);
        
        // If Supabase auth fails, try mock data for demo purposes
        console.log('Login: Trying mock authentication...');
        const user = validateLogin(email, password);
        
        if (user) {
          console.log('Login: Mock authentication successful');
          await saveUser(user);
          await setAuthenticated(true);
          Alert.alert('Success', 'Logged in successfully (Demo Mode)');
          router.replace('/(tabs)/(home)');
        } else {
          Alert.alert('Error', error.message || 'Invalid email or password');
        }
      } else if (data.session) {
        console.log('Login: Supabase authentication successful');
        
        // Try to get user from mock data to populate profile
        const mockUser = validateLogin(email, password);
        if (mockUser) {
          await saveUser(mockUser);
        }
        
        await setAuthenticated(true);
        Alert.alert('Success', 'Logged in successfully');
        router.replace('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Login: Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device or not set up.'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        console.log('Login: Biometric authentication successful');
        // For demo, use a default account
        await quickLogin('employee@hotel.com', 'password123');
      }
    } catch (error) {
      console.error('Login: Biometric error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      console.log('Login: Quick login for:', demoEmail);
      
      // Try Supabase first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        console.log('Login: Supabase quick login failed, using mock data');
        // Fall back to mock data
        const user = validateLogin(demoEmail, demoPassword);
        if (user) {
          await saveUser(user);
          await setAuthenticated(true);
          router.replace('/(tabs)/(home)');
        } else {
          Alert.alert('Error', 'Demo account not found');
        }
      } else if (data.session) {
        console.log('Login: Supabase quick login successful');
        const mockUser = validateLogin(demoEmail, demoPassword);
        if (mockUser) {
          await saveUser(mockUser);
        }
        await setAuthenticated(true);
        router.replace('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Login: Quick login error:', error);
      Alert.alert('Error', 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <IconSymbol name="building.2.fill" size={60} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>
              Hotel House of Vienna
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Shift Manager
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <IconSymbol name="envelope.fill" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                buttonStyles.primary,
                { backgroundColor: theme.primary },
                loading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={buttonStyles.primaryText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondary, { borderColor: theme.border }]}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <IconSymbol name="faceid" size={20} color={theme.primary} />
              <Text style={[buttonStyles.secondaryText, { color: theme.primary }]}>
                Login with Biometrics
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
                Quick Demo Login
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.demoButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => quickLogin('employee@hotel.com', 'password123')}
              disabled={loading}
            >
              <Text style={[styles.demoButtonText, { color: theme.text }]}>
                Employee Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => quickLogin('admin@hotel.com', 'admin123')}
              disabled={loading}
            >
              <Text style={[styles.demoButtonText, { color: theme.text }]}>
                Admin Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
              disabled={loading}
            >
              <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                Don&apos;t have an account?{' '}
                <Text style={{ color: theme.primary, fontWeight: '600' }}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(184, 197, 184, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  demoButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
