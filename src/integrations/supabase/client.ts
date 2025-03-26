
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://owsgbzivtjnvtbylsmep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93c2dieml2dGpudnRieWxzbWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc2MzIsImV4cCI6MjA1ODU3MzYzMn0.ruSSPjdi1NliO9Sz45uejEDHU-ZNVyvNv85ZzderyWo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
