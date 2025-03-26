
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Check connectivity to Supabase
export const checkSupabaseConnectivity = async (): Promise<boolean> => {
  try {
    // Instead of querying a specific table that might not exist,
    // we'll use a simple authentication check which doesn't require specific table access
    const start = Date.now();
    
    // Call getSession without arguments
    const { error } = await supabase.auth.getSession();
    
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
      console.log("Found existing session:", sessionData.session.user.id);
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        return {
          id: userData.user.id,
          email: userData.user.email || '',
          createdAt: new Date(userData.user.created_at || Date.now()).toLocaleDateString()
        };
      }
    }
    
    console.log("No session found, creating anonymous account");
    // If not authenticated, create anonymous account
    return await signInAnonymously();
  } catch (error) {
    console.error("Authentication error:", error);
    
    // Fallback to a local mock user if authentication fails
    const offlineUser = localStorage.getItem('offline_user');
    if (offlineUser) {
      console.log("Using cached offline user");
      return JSON.parse(offlineUser);
    }
    
    // Create and store a new offline user as last resort
    console.log("Creating new offline user");
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
    // First check connectivity
    const isConnected = await checkSupabaseConnectivity();
    if (!isConnected) {
      throw new Error("No connection to authentication service");
    }
    
    // Use direct domain name instead of anonymous-safecampapp.com which seems to be invalid
    const randomEmail = `guest-${uuidv4().substring(0, 8)}@nomad.camp`;
    const randomPassword = uuidv4();
    
    console.log("Attempting anonymous sign-up with email:", randomEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: randomEmail,
      password: randomPassword,
    });
    
    if (error) {
      console.error("Anonymous sign-up error:", error);
      throw error;
    }
    
    console.log("Anonymous sign-up successful:", data.user?.id);
    
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
    
    // Try to sign in with existing anonymous credentials
    const storedEmail = localStorage.getItem('anonymous_email');
    const storedPassword = localStorage.getItem('anonymous_password');
    
    if (storedEmail && storedPassword) {
      try {
        console.log("Trying to sign in with existing anonymous credentials");
        const { data, error } = await supabase.auth.signInWithPassword({
          email: storedEmail,
          password: storedPassword,
        });
        
        if (!error && data.user) {
          console.log("Signed in with existing anonymous credentials");
          return {
            id: data.user.id,
            email: data.user.email || storedEmail,
            createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
          };
        }
      } catch (signInError) {
        console.error("Error signing in with existing credentials:", signInError);
      }
    }
    
    // Fallback to a local mock user if anonymous sign-in fails
    console.log("Creating offline mock user as last resort");
    const mockUser = {
      id: `offline-${uuidv4()}`,
      email: 'guest@nomad.camp',
      createdAt: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('offline_user', JSON.stringify(mockUser));
    return mockUser;
  }
};
