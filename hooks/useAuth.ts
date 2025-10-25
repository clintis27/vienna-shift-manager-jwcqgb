
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { User } from '@/types';
import { getUser, saveUser, removeUser, setAuthenticated } from '@/utils/storage';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    loadUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event);
        setSession(session);
        
        if (session) {
          await loadUser();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const userData = await getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await removeUser();
      await setAuthenticated(false);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    loadUser,
    logout,
  };
}
