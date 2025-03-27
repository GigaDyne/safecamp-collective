import { createClient } from "@supabase/supabase-js";

// Define types
export interface CampSite {
  id: string;
  name: string;
  description?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
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
  source?: 'supabase' | 'mapbox' | 'mock';
  type?: string; // Adding the type property
}

export interface Review {
  id: string;
  siteId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  safetyRating: number;
  cellSignal: number;
  noiseLevel: number;
  comment?: string;
  images?: string[];
  date: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type FlagReason = "unsafe" | "closed" | "fake" | "inaccurate" | "other";

// Get Supabase credentials from environment variables, or use constants from client.ts as fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://owsgbzivtjnvtbylsmep.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93c2dieml2dGpudnRieWxzbWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc2MzIsImV4cCI6MjA1ODU3MzYzMn0.ruSSPjdi1NliO9Sz45uejEDHU-ZNVyvNv85ZzderyWo";

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create a bucket for profile images if not exists
(async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('profiles');
    
    // Use a type guard to check for a 404 error
    if (!data && error && 'code' in error && error.code === 'NOT_FOUND') {
      await supabase.storage.createBucket('profiles', {
        public: true, // Make the bucket public
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
    }
  } catch (err) {
    console.error('Error checking/creating profiles bucket:', err);
  }
})();

// Mapping functions for converting between our app types and Supabase types
export const formatCampsiteForSupabase = (campsite: Omit<CampSite, 'id'> | CampSite): any => {
  return {
    id: 'id' in campsite ? campsite.id : undefined,
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
    source: campsite.source,
    type: campsite.type // Adding the type property to the formatted object
  };
};

export const mapSupabaseCampsite = (data: any): CampSite => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    location: data.location,
    coordinates: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : undefined,
    latitude: data.latitude,
    longitude: data.longitude,
    landType: data.land_type,
    safetyRating: data.safety_rating,
    cellSignal: data.cell_signal,
    accessibility: data.accessibility,
    quietness: data.quietness,
    features: data.features || [],
    images: data.images || [],
    reviewCount: data.review_count || 0,
    source: data.source,
    type: data.type // Mapping the type property from database to the CampSite object
  };
};

export const formatReviewForSupabase = (review: Omit<Review, 'id' | 'date'>): any => {
  return {
    site_id: review.siteId,
    user_id: review.userId,
    user_name: review.userName,
    user_avatar: review.userAvatar,
    safety_rating: review.safetyRating,
    cell_signal: review.cellSignal,
    noise_level: review.noiseLevel,
    comment: review.comment,
    images: review.images || []
  };
};

export const mapSupabaseReview = (data: any): Review => {
  return {
    id: data.id,
    siteId: data.site_id,
    userId: data.user_id,
    userName: data.user_name,
    userAvatar: data.user_avatar,
    safetyRating: data.safety_rating,
    cellSignal: data.cell_signal,
    noiseLevel: data.noise_level,
    comment: data.comment,
    images: data.images || [],
    date: new Date(data.created_at).toLocaleDateString()
  };
};

export interface Flag {
  siteId: string;
  userId: string;
  reason: FlagReason;
  details?: string;
}

export const formatFlagForSupabase = (flag: Flag): any => {
  return {
    site_id: flag.siteId,
    user_id: flag.userId,
    reason: flag.reason,
    details: flag.details
  };
};

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signUpWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password
  });
};

export const signInAnonymously = async () => {
  // Creating a random email for anonymous sign-in
  const randomEmail = `guest-${Math.random().toString(36).substring(2, 10)}@anonymous-safecampapp.com`;
  const randomPassword = Math.random().toString(36).substring(2, 15);
  
  return await supabase.auth.signUp({
    email: randomEmail,
    password: randomPassword,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export default supabase;
