
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

// Local storage key for anonymous auth
const ANONYMOUS_AUTH_KEY = "anonymous_auth";

// Function to sign in anonymously - defined here since it was being imported from supabase.ts previously
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
  
  // Create new anonymous user
  try {
    const { data: signInData, error: signInError } = await signInAnonymously();
    
    if (signInError) {
      throw new Error('Failed to authenticate anonymously');
    }
    
    return signInData?.user ? {
      id: signInData.user.id,
      email: signInData.user.email || '',
      createdAt: new Date(signInData.user.created_at || Date.now()).toLocaleDateString()
    } : undefined;
  } catch (error) {
    console.error('Anonymous authentication error:', error);
    return undefined;
  }
};
