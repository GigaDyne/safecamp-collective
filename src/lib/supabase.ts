
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
