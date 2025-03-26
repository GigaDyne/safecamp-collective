
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database-types';

const SUPABASE_URL = "https://owsgbzivtjnvtbylsmep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93c2dieml2dGpudnRieWxzbWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc2MzIsImV4cCI6MjA1ODU3MzYzMn0.ruSSPjdi1NliO9Sz45uejEDHU-ZNVyvNv85ZzderyWo";

// Use a stable storage key for auth
const STORAGE_KEY = 'safecamp_supabase_auth';

// Create a singleton instance to prevent duplicate clients
let supabaseInstance: any = null;

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: STORAGE_KEY,
      storage: typeof window !== 'undefined' ? localStorage : undefined
    },
    global: {
      fetch: (...args) => {
        const [url, options] = args;
        const controller = new AbortController();
        const { signal } = controller;
        
        // Set timeout to 10 seconds to detect network issues
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Add request ID to help with debugging
        const requestId = `req-${Math.random().toString(36).substring(2, 9)}`;
        const headers = new Headers(options?.headers || {});
        headers.set('x-request-id', requestId);
        
        return fetch(url, {
          ...options,
          headers,
          signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      }
    }
  });
  
  return supabaseInstance;
})();

// Export this function to check if we're running in a browser environment
export const isBrowser = () => typeof window !== 'undefined';

// Helper function to ensure the session is loaded
export const ensureAuthLoaded = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error loading auth session:', error);
    return null;
  }
};
