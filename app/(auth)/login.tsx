
import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { validateLogin } from '@/utils/mockData';
import { saveUser, setAuthenticated } from '@/utils/storage';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    console.log('Attempting login...');

    // Simulate API call
    setTimeout(async () => {
      const user = validateLogin(email, password);
      
      if (user) {
        await saveUser(user);
        await setAuthenticated(true);
        console.log('Login successful, navigating to home');
        router.replace('/(tabs)/(home)');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometric Not Available',
          'Please set up biometric authentication on your device'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometrics',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        console.log('Biometric authentication successful');
        // For demo, use the first mock user
        const user = validateLogin('employee@vienna.com', 'password123');
        if (user) {
          await saveUser(user);
          await setAuthenticated(true);
          router.replace('/(tabs)/(home)');
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
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
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
              <IconSymbol name="building.2" size={48} color={theme.card} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Hotel House of Vienna
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Shift Manager
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <IconSymbol name="envelope" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="lock" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol
                  name={showPassword ? 'eye.slash' : 'eye'}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, { color: theme.card }]}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: theme.border }]}
              onPress={handleBiometricLogin}
            >
              <IconSymbol name="faceid" size={24} color={theme.primary} />
              <Text style={[styles.biometricText, { color: theme.primary }]}>
                Login with Biometrics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.linkText, { color: theme.primary }]}>
                Don&apos;t have an account? Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          <View style={[styles.demoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.demoTitle, { color: theme.text }]}>Demo Credentials:</Text>
            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
              Admin: admin@vienna.com
            </Text>
            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
              Manager: manager@vienna.com
            </Text>
            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
              Employee: employee@vienna.com
            </Text>
            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
              Password: any 6+ characters
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
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  demoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
