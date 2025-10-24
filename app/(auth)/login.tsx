
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { colors, darkColors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { validateLogin } from '@/utils/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { saveUser, setAuthenticated } from '@/utils/storage';
import React, { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? darkColors : colors;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('=== Login Started ===');
      console.log('Email:', email);
      
      const user = await validateLogin(email, password);
      
      if (user) {
        console.log('User validated:', user.email, 'Category:', user.category);
        
        // Save user data
        await saveUser(user);
        console.log('User data saved');
        
        // Set authentication status
        await setAuthenticated(true);
        console.log('Authentication status set to true');
        
        // Small delay to ensure state is saved
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to home
        console.log('Navigating to home...');
        router.replace('/(tabs)/(home)');
        console.log('=== Login Complete ===');
      } else {
        console.log('Login failed: Invalid credentials');
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Biometric authentication is not available on this device');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No biometric data enrolled on this device');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Use default admin credentials for biometric login
        await quickLogin('admin@hotel.com', 'admin123');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      console.log('=== Quick Login Started ===');
      console.log('Email:', demoEmail);
      
      const user = await validateLogin(demoEmail, demoPassword);
      
      if (user) {
        console.log('User validated:', user.email, 'Category:', user.category);
        
        await saveUser(user);
        console.log('User data saved');
        
        await setAuthenticated(true);
        console.log('Authentication status set to true');
        
        // Small delay to ensure state is saved
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Navigating to home...');
        router.replace('/(tabs)/(home)');
        console.log('=== Quick Login Complete ===');
      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error) {
      console.error('Quick login error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: currentColors.sage }]}>
              <IconSymbol name="building.2.fill" size={40} color={currentColors.text} />
            </View>
            <Text style={[styles.title, { color: currentColors.text }]}>
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>
              Sign in to continue to Hotel House of Vienna
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentColors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentColors.card,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={currentColors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentColors.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentColors.card,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }
                ]}
                placeholder="Enter your password"
                placeholderTextColor={currentColors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton, 
                { backgroundColor: currentColors.sage },
                loading && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={[styles.loginButtonText, { color: currentColors.text }]}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
              <Text style={[styles.dividerText, { color: currentColors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
            </View>

            <TouchableOpacity
              style={[
                styles.biometricButton,
                {
                  backgroundColor: currentColors.card,
                  borderColor: currentColors.border,
                }
              ]}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <IconSymbol name="faceid" size={24} color={currentColors.text} />
              <Text style={[styles.biometricButtonText, { color: currentColors.text }]}>
                Sign in with Face ID
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: currentColors.textSecondary }]}>
              Don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.footerLink, { color: currentColors.sage }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          <View style={[styles.demoCard, { backgroundColor: currentColors.card }]}>
            <Text style={[styles.demoTitle, { color: currentColors.text }]}>
              Demo Accounts - Try Different Layouts!
            </Text>
            <Text style={[styles.demoSubtitle, { color: currentColors.textSecondary }]}>
              Each category has a unique design
            </Text>
            
            <TouchableOpacity 
              style={[styles.quickLoginButton, { backgroundColor: '#7BA05B20', borderColor: '#7BA05B' }]}
              onPress={() => quickLogin('breakfast-admin@hotel.com', 'admin123')}
              disabled={loading}
            >
              <View style={styles.quickLoginContent}>
                <IconSymbol name="cup.and.saucer.fill" size={20} color="#7BA05B" />
                <View style={styles.quickLoginText}>
                  <Text style={[styles.quickLoginTitle, { color: currentColors.text }]}>
                    Breakfast (Plant Shop Style)
                  </Text>
                  <Text style={[styles.quickLoginEmail, { color: currentColors.textSecondary }]}>
                    breakfast-admin@hotel.com
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickLoginButton, { backgroundColor: '#FF6B5A20', borderColor: '#FF6B5A' }]}
              onPress={() => quickLogin('frontdesk-admin@hotel.com', 'admin123')}
              disabled={loading}
            >
              <View style={styles.quickLoginContent}>
                <IconSymbol name="person.2.fill" size={20} color="#FF6B5A" />
                <View style={styles.quickLoginText}>
                  <Text style={[styles.quickLoginTitle, { color: currentColors.text }]}>
                    Front Desk (Transport Card Style)
                  </Text>
                  <Text style={[styles.quickLoginEmail, { color: currentColors.textSecondary }]}>
                    frontdesk-admin@hotel.com
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickLoginButton, { backgroundColor: '#6B9AC420', borderColor: '#6B9AC4' }]}
              onPress={() => quickLogin('housekeeping-admin@hotel.com', 'admin123')}
              disabled={loading}
            >
              <View style={styles.quickLoginContent}>
                <IconSymbol name="bed.double.fill" size={20} color="#6B9AC4" />
                <View style={styles.quickLoginText}>
                  <Text style={[styles.quickLoginTitle, { color: currentColors.text }]}>
                    Housekeeping (Air Quality Style)
                  </Text>
                  <Text style={[styles.quickLoginEmail, { color: currentColors.textSecondary }]}>
                    housekeeping-admin@hotel.com
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { marginVertical: 16 }]}>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
            </View>

            <Text style={[styles.demoText, { color: currentColors.textSecondary }]}>
              Password for all: admin123
            </Text>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0px 8px 24px rgba(184, 197, 184, 0.3)',
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  loginButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0px 6px 20px rgba(184, 197, 184, 0.3)',
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 18,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  demoCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 32,
    boxShadow: '0px 4px 16px rgba(45, 45, 45, 0.04)',
    elevation: 1,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  demoSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  quickLoginButton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  quickLoginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quickLoginText: {
    flex: 1,
    gap: 2,
  },
  quickLoginTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  quickLoginEmail: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  demoText: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
