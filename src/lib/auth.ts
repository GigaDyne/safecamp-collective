
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

// Local storage key for anonymous auth
const ANONYMOUS_AUTH_KEY = "anonymous_auth";

// Check if user is authenticated
export const ensureAuthenticated = async (): Promise<User | undefined> => {
  // Check if already authenticated
  const { data, error } = await supabase.auth.getUser();
  
  if (!error && data.user) {
    // Convert Supabase User to our User type
    return {
      id: data.user.id,
      email: data.user.email || '',
      createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
    };
  }
  
  // Try to sign in with stored anonymous credentials
  const anonEmail = localStorage.getItem('anonymous_email');
  const anonPassword = localStorage.getItem('anonymous_password');
  
  if (anonEmail && anonPassword) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: anonEmail,
      password: anonPassword,
    });
    
    if (!error && data.user) {
      // Convert Supabase User to our User type
      return {
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
      };
    }
  }
  
  // Create new anonymous user using the imported function
  const { data: signInData, error: signInError } = await signInAnonymously();
  
  if (signInError) {
    throw new Error('Failed to authenticate anonymously');
  }
  
  return signInData?.user ? {
    id: signInData.user.id,
    email: signInData.user.email || '',
    createdAt: new Date(signInData.user.created_at || Date.now()).toLocaleDateString()
  } : undefined;
};

// Export the signInAnonymously function
export { signInAnonymously } from "@/lib/supabase";
