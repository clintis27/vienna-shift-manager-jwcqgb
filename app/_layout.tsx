
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, Alert, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useNetworkState } from 'expo-network';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { supabase } from '@/app/integrations/supabase/client';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('=== App Initialization Started ===');
        
        // Wait for fonts to load
        if (!loaded) {
          console.log('Waiting for fonts to load...');
          return;
        }

        console.log('Fonts loaded successfully');

        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Session check complete:', session ? 'User logged in' : 'No session');
        }

        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Hide splash screen
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden');

        // Mark app as ready
        setAppReady(true);
        console.log('=== App Initialization Complete ===');
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Even on error, try to hide splash and mark as ready
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
        setAppReady(true);
      }
    };

    initializeApp();
  }, [loaded]);

  // Network status monitoring
  useEffect(() => {
    if (
      networkState.isConnected === false &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        '🔌 You are offline',
        'You can keep using the app! Your changes will be saved locally and synced when you are back online.'
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // Show loading screen while initializing
  if (!loaded || !appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B8C5B8" />
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
});
