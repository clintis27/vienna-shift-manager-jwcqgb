
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { getUser, setAuthenticated } from '@/utils/storage';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    console.log('Index: Component mounted, checking authentication...');
    checkAuthAndRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Index: Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN' && session) {
        setHasSession(true);
        await setAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setHasSession(false);
        await setAuthenticated(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      console.log('Index: Checking Supabase session...');
      
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Index: Error getting session:', error);
        setHasSession(false);
        await setAuthenticated(false);
      } else if (session) {
        console.log('Index: Valid session found for user:', session.user.email);
        setHasSession(true);
        await setAuthenticated(true);
        
        // Sync user data to AsyncStorage if needed
        const localUser = await getUser();
        if (!localUser) {
          console.log('Index: No local user found, session exists - user may need to complete profile');
        }
      } else {
        console.log('Index: No session found');
        setHasSession(false);
        await setAuthenticated(false);
      }
    } catch (error) {
      console.error('Index: Error during auth check:', error);
      setHasSession(false);
      await setAuthenticated(false);
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

  const destination = hasSession ? '/(tabs)/(home)' : '/(auth)/login';
  console.log('Index: Redirecting to:', destination);
  
  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
});
