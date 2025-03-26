
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Check connectivity to Supabase
export const checkSupabaseConnectivity = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('health_check').select('*', { count: 'exact', head: true });
    const elapsed = Date.now() - start;
    
    console.log(`Supabase connectivity check: ${error ? 'failed' : 'succeeded'} in ${elapsed}ms`);
    
    return !error;
  } catch (e) {
    console.error("Supabase connectivity check error:", e);
    return false;
  }
};

// Ensure user is authenticated, creating an anonymous account if necessary
export const ensureAuthenticated = async (): Promise<User> => {
  try {
    // Check if user is already authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    
    if (sessionData?.session) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        return {
          id: userData.user.id,
          email: userData.user.email || '',
          createdAt: new Date(userData.user.created_at || Date.now()).toLocaleDateString()
        };
      }
    }
    
    // If not authenticated, create anonymous account
    return await signInAnonymously();
  } catch (error) {
    console.error("Authentication error:", error);
    
    // Fallback to a local mock user if authentication fails
    const offlineUser = localStorage.getItem('offline_user');
    if (offlineUser) {
      return JSON.parse(offlineUser);
    }
    
    // Create and store a new offline user as last resort
    const mockUser = {
      id: `offline-${uuidv4()}`,
      email: 'guest@safecampapp.com',
      createdAt: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('offline_user', JSON.stringify(mockUser));
    return mockUser;
  }
};

// Sign in anonymously
export const signInAnonymously = async (): Promise<User> => {
  try {
    const randomEmail = `anonymous-${uuidv4()}@safecampapp.com`;
    const randomPassword = uuidv4();
    
    const { data, error } = await supabase.auth.signUp({
      email: randomEmail,
      password: randomPassword,
    });
    
    if (error) throw error;
    
    localStorage.setItem('anonymous_email', randomEmail);
    localStorage.setItem('anonymous_password', randomPassword);
    
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || randomEmail,
        createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
      };
    }
    
    throw new Error("Failed to create anonymous user");
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    
    // Fallback to a local mock user if anonymous sign-in fails
    const mockUser = {
      id: `offline-${uuidv4()}`,
      email: 'guest@safecampapp.com',
      createdAt: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('offline_user', JSON.stringify(mockUser));
    return mockUser;
  }
};
