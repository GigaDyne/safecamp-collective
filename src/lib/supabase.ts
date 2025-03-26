import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'https://owsgbzivtjnvtbylsmep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93c2dieml2dGpudnRieWxzbWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc2MzIsImV4cCI6MjA1ODU3MzYzMn0.ruSSPjdi1NliO9Sz45uejEDHU-ZNVyvNv85ZzderyWo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      const [url, options] = args;
      const controller = new AbortController();
      const { signal } = controller;

      const timeoutId = setTimeout(() => controller.abort(), 10000);

      return fetch(url, {
        ...options,
        signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});


// Database Types
export type SupabaseUser = {
  id: string;
  email: string;
  created_at: string;
};

export type SupabaseCampsite = {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  land_type: string;
  safety_rating: number;
  cell_signal: number;
  accessibility: number;
  quietness: number;
  features: string[];
  images: string[];
  review_count: number;
  created_at: string;
};

export type SupabaseReview = {
  id: string;
  site_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  safety_rating: number;
  cell_signal: number;
  noise_level: number;
  comment: string;
  created_at: string;
  images?: string[];
};

export type FlagReason = 
  | 'unsafe'
  | 'closed'
  | 'fake'
  | 'inaccurate'
  | 'other';

export type SupabaseFlag = {
  id: string;
  site_id: string;
  user_id: string;
  reason: FlagReason;
  details?: string;
  created_at: string;
};

// Application Types
export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type CampSite = {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  latitude: number;
  longitude: number;
  landType: string;
  safetyRating: number;
  cellSignal: number;
  accessibility: number;
  quietness: number;
  features: string[];
  images: string[];
  reviewCount: number;
};

export type Review = {
  id: string;
  siteId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  safetyRating: number;
  cellSignal: number;
  noiseLevel: number;
  comment: string;
  date: string;
  images?: string[];
};

export type Flag = {
  id: string;
  siteId: string;
  userId: string;
  reason: FlagReason;
  details?: string;
  createdAt: string;
};

// Convert from Supabase format to app format
export const mapSupabaseUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    email: user.email,
    createdAt: new Date(user.created_at).toLocaleDateString(),
  };
};

export const mapSupabaseCampsite = (campsite: SupabaseCampsite): CampSite => {
  return {
    id: campsite.id,
    name: campsite.name,
    description: campsite.description,
    location: campsite.location,
    coordinates: { lat: campsite.latitude, lng: campsite.longitude },
    latitude: campsite.latitude,
    longitude: campsite.longitude,
    landType: campsite.land_type,
    safetyRating: campsite.safety_rating,
    cellSignal: campsite.cell_signal,
    accessibility: campsite.accessibility,
    quietness: campsite.quietness,
    features: campsite.features,
    images: campsite.images,
    reviewCount: campsite.review_count,
  };
};

export const mapSupabaseReview = (review: SupabaseReview): Review => {
  return {
    id: review.id,
    siteId: review.site_id,
    userId: review.user_id,
    userName: review.user_name,
    userAvatar: review.user_avatar,
    safetyRating: review.safety_rating,
    cellSignal: review.cell_signal,
    noiseLevel: review.noise_level,
    comment: review.comment,
    date: new Date(review.created_at).toLocaleDateString(),
    images: review.images,
  };
};

export const mapSupabaseFlag = (flag: SupabaseFlag): Flag => {
  return {
    id: flag.id,
    siteId: flag.site_id,
    userId: flag.user_id,
    reason: flag.reason,
    details: flag.details,
    createdAt: new Date(flag.created_at).toLocaleDateString(),
  };
};

// Format for inserting to Supabase
export const formatCampsiteForSupabase = (campsite: Omit<CampSite, 'id'>): Omit<SupabaseCampsite, 'id' | 'created_at'> => {
  return {
    name: campsite.name,
    description: campsite.description,
    location: campsite.location,
    latitude: campsite.latitude,
    longitude: campsite.longitude,
    land_type: campsite.landType,
    safety_rating: campsite.safetyRating,
    cell_signal: campsite.cellSignal,
    accessibility: campsite.accessibility,
    quietness: campsite.quietness,
    features: campsite.features,
    images: campsite.images,
    review_count: campsite.reviewCount,
  };
};

export const formatReviewForSupabase = (review: Omit<Review, 'id' | 'date'>): Omit<SupabaseReview, 'id' | 'created_at'> => {
  return {
    site_id: review.siteId,
    user_id: review.userId,
    user_name: review.userName,
    user_avatar: review.userAvatar,
    safety_rating: review.safetyRating,
    cell_signal: review.cellSignal,
    noise_level: review.noiseLevel,
    comment: review.comment,
    images: review.images,
  };
};

export const formatFlagForSupabase = (flag: Omit<Flag, 'id' | 'createdAt'>): Omit<SupabaseFlag, 'id' | 'created_at'> => {
  return {
    site_id: flag.siteId,
    user_id: flag.userId,
    reason: flag.reason,
    details: flag.details,
  };
};

// Auth functions
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    return { data: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error in signInWithEmail:', error);
    return { data: null, error };
  }
};

export const signInAnonymously = async () => {
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
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error in signOut:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, error };
  }
};

export const initializeSupabase = async () => {
  try {
    const { error: checkError } = await supabase
      .from('campsites')
      .select('count', { count: 'exact', head: true });
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Tables do not exist, initializing Supabase schema...');
      
      // We would create tables here but that requires admin privileges
      // In a real app, this would be done through Supabase dashboard or migrations
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return { error };
  }
};
