
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { isAuthenticated } from '@/utils/storage';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Index: Checking authentication...');
      const authStatus = await isAuthenticated();
      console.log('Index: Auth status:', authStatus);
      setIsAuth(authStatus);
    } catch (error) {
      console.error('Index: Error checking auth:', error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#B8C5B8" />
      </View>
    );
  }

  console.log('Index: Redirecting to:', isAuth ? '/(tabs)/(home)' : '/(auth)/login');
  return <Redirect href={isAuth ? '/(tabs)/(home)' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
});
