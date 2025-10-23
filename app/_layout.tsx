
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, Alert } from 'react-native';
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

  useEffect(() => {
    const initializeApp = async () => {
      if (!loaded) {
        return;
      }

      try {
        console.log('Initializing app...');
        const isAuth = await isAuthenticated();
        console.log('Is authenticated:', isAuth);
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        
        // Set ready state
        setIsReady(true);
        
        // Navigate based on auth status
        setTimeout(() => {
          if (isAuth) {
            router.replace('/(tabs)/(home)');
          } else {
            router.replace('/(auth)/login');
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
        await SplashScreen.hideAsync();
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

  if (!loaded || !isReady) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: 'rgb(25, 118, 210)',
      background: 'rgb(245, 245, 245)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(33, 33, 33)',
      border: 'rgb(224, 224, 224)',
      notification: 'rgb(211, 47, 47)',
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: 'rgb(66, 165, 245)',
      background: 'rgb(18, 18, 18)',
      card: 'rgb(30, 30, 30)',
      text: 'rgb(255, 255, 255)',
      border: 'rgb(44, 44, 44)',
      notification: 'rgb(239, 83, 80)',
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}
      >
        <WidgetProvider>
          <GestureHandlerRootView>
            <Stack screenOptions={{ headerShown: false }}>
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
