
import { supabase, Review, formatReviewForSupabase, mapSupabaseReview } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Fetch reviews for a specific campsite
export const fetchSiteReviews = async (siteId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data.map(mapSupabaseReview);
  } catch (error) {
    console.error('Error in fetchSiteReviews:', error);
    return [];
  }
};

// Save a new review
export const saveReview = async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  try {
    const formattedReview = formatReviewForSupabase(review);
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...formattedReview, id })
      .select()
      .single();

    if (error) {
      console.error('Error saving review:', error);
      throw error;
    }

    // Update the campsite's average ratings and review count
    await updateCampsiteRatings(review.siteId);

    return mapSupabaseReview(data);
  } catch (error) {
    console.error('Error in saveReview:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string, siteId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return false;
    }

    // Update the campsite's average ratings and review count
    await updateCampsiteRatings(siteId);

    return true;
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return false;
  }
};

// Update a review
export const updateReview = async (reviewId: string, updates: Partial<Omit<Review, 'id' | 'date'>>, siteId: string): Promise<Review | null> => {
  try {
    const formattedUpdates = updates ? formatReviewForSupabase(updates as any) : {};
    
    const { data, error } = await supabase
      .from('reviews')
      .update(formattedUpdates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return null;
    }

    // Update the campsite's average ratings and review count
    await updateCampsiteRatings(siteId);

    return mapSupabaseReview(data);
  } catch (error) {
    console.error('Error in updateReview:', error);
    return null;
  }
};

// Helper function to update a campsite's ratings based on reviews
const updateCampsiteRatings = async (siteId: string): Promise<void> => {
  try {
    // Fetch all reviews for this campsite
    const { data, error } = await supabase
      .from('reviews')
      .select('safety_rating, cell_signal, noise_level')
      .eq('site_id', siteId);

    if (error) {
      console.error('Error fetching reviews for updating campsite ratings:', error);
      return;
    }

    // Calculate average ratings
    const reviewCount = data.length;
    
    if (reviewCount === 0) {
      // If there are no reviews, update the campsite with default values
      await supabase
        .from('campsites')
        .update({
          safety_rating: 0,
          cell_signal: 0,
          quietness: 0,
          review_count: 0
        })
        .eq('id', siteId);
      return;
    }

    const safetyRatingSum = data.reduce((sum, review) => sum + review.safety_rating, 0);
    const cellSignalSum = data.reduce((sum, review) => sum + review.cell_signal, 0);
    const quietnessSum = data.reduce((sum, review) => sum + review.noise_level, 0);

    const avgSafetyRating = Math.round(safetyRatingSum / reviewCount);
    const avgCellSignal = Math.round(cellSignalSum / reviewCount);
    const avgQuietness = Math.round(quietnessSum / reviewCount);

    // Update the campsite with the new average ratings
    const { error: updateError } = await supabase
      .from('campsites')
      .update({
        safety_rating: avgSafetyRating,
        cell_signal: avgCellSignal,
        quietness: avgQuietness,
        review_count: reviewCount
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating campsite ratings:', updateError);
    }
  } catch (error) {
    console.error('Error in updateCampsiteRatings:', error);
  }
};
