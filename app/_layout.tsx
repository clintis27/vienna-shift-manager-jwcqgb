
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, Alert, ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useNetworkState } from 'expo-network';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { isAuthenticated } from '@/utils/storage';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isReady, setIsReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (!loaded) {
        return;
      }

      try {
        console.log('=== App Initialization Started ===');
        
        // Check authentication status
        const isAuth = await isAuthenticated();
        console.log('Authentication status:', isAuth);
        
        setAuthChecked(true);
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden');
        
        // Set ready state
        setIsReady(true);
        
        console.log('=== App Initialization Complete ===');
      } catch (error) {
        console.error('Error initializing app:', error);
        // Ensure we still hide splash and set ready even on error
        setAuthChecked(true);
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
      }
    };

    initializeApp();
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        '🔌 You are offline',
        'You can keep using the app! Your changes will be saved locally and synced when you are back online.'
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded || !isReady || !authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B8C5B8" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: 'rgb(184, 197, 184)',
      background: 'rgb(250, 250, 250)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(45, 45, 45)',
      border: 'rgb(230, 230, 230)',
      notification: 'rgb(212, 165, 154)',
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: 'rgb(184, 197, 184)',
      background: 'rgb(18, 18, 18)',
      card: 'rgb(37, 37, 37)',
      text: 'rgb(245, 245, 245)',
      border: 'rgb(60, 60, 60)',
      notification: 'rgb(212, 165, 154)',
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}
      >
        <WidgetProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <SystemBars style="auto" />
          </GestureHandlerRootView>
        </WidgetProvider>
      </ThemeProvider>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2D2D2D',
  },
});
