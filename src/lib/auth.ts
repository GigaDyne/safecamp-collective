
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

// Function to sign in anonymously
export const signInAnonymously = async () => {
  try {
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
    
    return { data, error };
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
