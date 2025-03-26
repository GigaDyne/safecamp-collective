
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

// Function to sign in anonymously
export const signInAnonymously = async () => {
  // Generate a random email and password for anonymous auth
  const randomEmail = `anonymous-${Math.random().toString(36).substring(2)}@nomad.camp`;
  const randomPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  // Store credentials in localStorage for future sessions
  localStorage.setItem('anonymous_email', randomEmail);
  localStorage.setItem('anonymous_password', randomPassword);
  
  // Create a new user
  return supabase.auth.signUp({
    email: randomEmail,
    password: randomPassword,
  });
};

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
  
  // Return undefined - auth will be handled by AuthProvider
  return undefined;
};
