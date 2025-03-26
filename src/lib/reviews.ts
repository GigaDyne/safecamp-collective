
import { supabase, Review, formatReviewForSupabase, mapSupabaseReview } from "@/lib/supabase";
import { ensureAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Local storage key for fallback
const REVIEWS_STORAGE_KEY = "campsite-reviews";

// Helper function to get stored reviews from localStorage (fallback)
export const getStoredReviews = (): Review[] => {
  const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
  return storedReviews ? JSON.parse(storedReviews) : [];
};

// Function to save review to Supabase
export const saveReview = async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated();
    
    // Format review for Supabase
    const supabaseReview = formatReviewForSupabase(review);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('reviews')
      .insert(supabaseReview as any)
      .select()
      .single() as any;
    
    if (error) throw error;
    
    // Update campsite review count
    await updateCampsiteReviewCount(review.siteId);
    
    // Map back to our format
    return mapSupabaseReview(data);
  } catch (error) {
    console.error('Error saving review to Supabase:', error);
    
    // Fallback to localStorage if Supabase fails
    const newReview = {
      ...review,
      id: uuidv4(),
      date: new Date().toLocaleDateString(),
    };
    
    // Save to localStorage as fallback
    const currentReviews = getStoredReviews();
    const updatedReviews = [...currentReviews, newReview];
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
    
    return newReview;
  }
};

// Function to update campsite review count
export const updateCampsiteReviewCount = async (siteId: string): Promise<void> => {
  try {
    // Get current review count
    const { count, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId) as any;
    
    if (countError) throw countError;
    
    // Update the campsite with new review count
    const { error: updateError } = await supabase
      .from('campsites')
      .update({ review_count: count || 1 } as any)
      .eq('id', siteId) as any;
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating campsite review count:', error);
  }
};

// Function to fetch reviews for a specific site
export const fetchSiteReviews = async (siteId: string): Promise<Review[]> => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated();
    
    // Get reviews from Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false }) as any;
    
    if (error) throw error;
    
    // Map Supabase reviews to our format
    return data.map(mapSupabaseReview);
  } catch (error) {
    console.error('Error fetching reviews from Supabase:', error);
    
    // Fallback to localStorage if Supabase fails
    const allReviews = getStoredReviews();
    const siteReviews = allReviews.filter(review => review.siteId === siteId);
    
    return siteReviews;
  }
};
