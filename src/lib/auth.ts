
import { supabase, User } from "@/lib/supabase";

// Local storage key for anonymous auth
const ANONYMOUS_AUTH_KEY = "anonymous_auth";

// Check if user is authenticated
export const ensureAuthenticated = async (): Promise<User | undefined> => {
  // Check if already authenticated
  const { data, error } = await supabase.auth.getUser();
  
  if (!error && data.user) {
    return data.user;
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
      return data.user;
    }
  }
  
  // Create new anonymous user using the function from supabase.ts
  const { data: signInData, error: signInError } = await signInAnonymously();
  
  if (signInError) {
    throw new Error('Failed to authenticate anonymously');
  }
  
  return signInData?.user;
};

// Re-export for convenience
export { signInAnonymously } from "@/lib/supabase";
