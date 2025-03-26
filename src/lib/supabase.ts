
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.safecampapp.lovable.dev';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mb3dsZ2x2Z2trc2ZyY2x5cHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODYzMTgwMDEsImV4cCI6MjAwMTg5NDAwMX0.z6DLVe3A6nZoG7qn3afCqiAJf5qr9MaDYN8xLcXSvvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Define the Review type that our application uses internally
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

// Flag types
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

export type Flag = {
  id: string;
  siteId: string;
  userId: string;
  reason: FlagReason;
  details?: string;
  createdAt: string;
};

// Convert from Supabase format to app format
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

// Format for inserting to Supabase
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

// Map flag from Supabase format
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

// Format flag for inserting to Supabase
export const formatFlagForSupabase = (flag: Omit<Flag, 'id' | 'createdAt'>): Omit<SupabaseFlag, 'id' | 'created_at'> => {
  return {
    site_id: flag.siteId,
    user_id: flag.userId,
    reason: flag.reason,
    details: flag.details,
  };
};
