
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

// Function to sign in anonymously
export const signInAnonymously = async () => {
  try {
    // Check if we already have stored credentials
    const storedEmail = localStorage.getItem('anonymous_email');
    const storedPassword = localStorage.getItem('anonymous_password');
    
    if (storedEmail && storedPassword) {
      // Try to sign in with stored credentials
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: storedEmail,
          password: storedPassword
        });
        
        if (!error) {
          console.log("Successfully signed in with anonymous credentials");
          return { data, error: null };
        }
        
        // If sign in fails, we'll create a new anonymous account below
        console.log("Stored anonymous credentials are invalid, creating new account");
      } catch (e) {
        console.error("Error signing in with stored anonymous credentials:", e);
        // Continue to create a new account
      }
    }
    
    // Generate a random email and password for anonymous auth
    const randomEmail = `anonymous-${Math.random().toString(36).substring(2)}@nomad.camp`;
    const randomPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    // Store credentials in localStorage for future sessions
    localStorage.setItem('anonymous_email', randomEmail);
    localStorage.setItem('anonymous_password', randomPassword);
    
    // Create a new user
    const { data, error } = await supabase.auth.signUp({
      email: randomEmail,
      password: randomPassword,
    });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
    
    // Create a mock user for offline mode
    const mockUser: User = {
      id: `offline-${Math.random().toString(36).substring(2)}`,
      email: 'offline@nomad.camp',
      createdAt: new Date().toLocaleDateString()
    };
    
    // Store offline user in localStorage
    localStorage.setItem('offline_user', JSON.stringify(mockUser));
    
    return { 
      data: { user: mockUser },
      error: null
    };
  }
};

// Check if user is authenticated
export const ensureAuthenticated = async (): Promise<User | undefined> => {
  try {
    // Check if already authenticated with Supabase
    const { data, error } = await supabase.auth.getUser();
    
    if (!error && data.user) {
      // Convert Supabase User to our User type
      return {
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
      };
    }
    
    // Check for offline user
    const offlineUser = localStorage.getItem('offline_user');
    if (offlineUser) {
      return JSON.parse(offlineUser) as User;
    }
    
    // Return undefined - auth will be handled by AuthProvider
    return undefined;
  } catch (error) {
    console.error("Auth check error:", error);
    
    // Check for offline user
    const offlineUser = localStorage.getItem('offline_user');
    if (offlineUser) {
      return JSON.parse(offlineUser) as User;
    }
    
    return undefined;
  }
};

// Check connectivity to Supabase
export const checkSupabaseConnectivity = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('health_check').select('count', { count: 'exact', head: true });
    const elapsed = Date.now() - start;
    
    console.log(`Supabase connectivity check: ${error ? 'failed' : 'succeeded'} in ${elapsed}ms`);
    
    return !error;
  } catch (e) {
    console.error("Supabase connectivity check error:", e);
    return false;
  }
};
