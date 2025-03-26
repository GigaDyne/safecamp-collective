import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  supabase, 
  mapSupabaseCampsite, 
  mapSupabaseReview, 
  formatReviewForSupabase,
  formatCampsiteForSupabase,
  signInAnonymously,
  CampSite,
  Review
} from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { mockCampSites } from "@/data/mockData";

// Re-export types from Supabase lib to make them available to components
export type { CampSite, Review } from "@/lib/supabase";

// Local storage keys for fallback
const REVIEWS_STORAGE_KEY = "campsite-reviews";
const ANONYMOUS_AUTH_KEY = "anonymous_auth";

// Check if user is authenticated
export const ensureAuthenticated = async () => {
  // Check if already authenticated
  const { data, error } = await supabase.auth.getUser();
  
  if (!error && data.user) {
    return data.user;
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
      return data.user;
    }
  }
  
  // Create new anonymous user
  const { data: signInData, error: signInError } = await signInAnonymously();
  
  if (signInError) {
    throw new Error('Failed to authenticate anonymously');
  }
  
  return signInData?.user;
};

// Fetch campsites from Supabase
const fetchCampSites = async () => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated();
    
    // Fetch campsites from Supabase
    const { data, error } = await supabase
      .from('campsites')
      .select('*');
    
    if (error) {
      console.error('Error fetching campsites:', error);
      return mockCampSites; // Fallback to mock data
    }
    
    if (!data || data.length === 0) {
      // If no campsites in database, seed with mock data
      await seedCampsitesIfEmpty();
      return mockCampSites;
    }
    
    // Map to our format
    return data.map(mapSupabaseCampsite);
  } catch (error) {
    console.error('Error in fetchCampSites:', error);
    return mockCampSites; // Fallback to mock data
  }
};

// Seed campsites if none exist
const seedCampsitesIfEmpty = async () => {
  try {
    // Check if campsites table exists and is empty
    const { count, error } = await supabase
      .from('campsites')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking campsites:', error);
      return;
    }
    
    if (count === 0) {
      // Convert mock data to Supabase format
      const formattedCampsites = mockCampSites.map(site => formatCampsiteForSupabase(site));
      
      // Insert mock data
      const { error: insertError } = await supabase
        .from('campsites')
        .insert(formattedCampsites);
      
      if (insertError) {
        console.error('Error seeding campsites:', insertError);
      } else {
        console.log('Successfully seeded campsites');
      }
    }
  } catch (error) {
    console.error('Error in seedCampsitesIfEmpty:', error);
  }
};

// Function to save campsite to Supabase
export const saveCampSite = async (campsite: Omit<CampSite, 'id'>): Promise<CampSite> => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated();
    
    // Format campsite for Supabase
    const supabaseCampsite = formatCampsiteForSupabase(campsite);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('campsites')
      .insert(supabaseCampsite)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map back to our format
    return mapSupabaseCampsite(data);
  } catch (error) {
    console.error('Error saving campsite to Supabase:', error);
    
    // Fallback - create an in-memory campsite
    const newCampsite = {
      ...campsite,
      id: uuidv4(),
    };
    
    return newCampsite;
  }
};

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
      .insert(supabaseReview)
      .select()
      .single();
    
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
const updateCampsiteReviewCount = async (siteId: string) => {
  try {
    // Get current review count
    const { count, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);
    
    if (countError) throw countError;
    
    // Update the campsite with new review count
    const { error: updateError } = await supabase
      .from('campsites')
      .update({ review_count: count || 1 })
      .eq('id', siteId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating campsite review count:', error);
  }
};

export function useCampSites() {
  const { toast } = useToast();
  
  // Use React Query to handle data fetching, caching, and loading states
  const { data: campSites, isLoading, error } = useQuery({
    queryKey: ['campSites'],
    queryFn: fetchCampSites,
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 1, // Only retry once
    meta: { // Use meta for custom error handling in tanstack v5
      onError: (error: any) => {
        toast({
          title: "Error loading campsites",
          description: "Failed to load campsites. Using offline data instead.",
          variant: "destructive",
        });
        console.error('Error in useCampSites query:', error);
      }
    }
  });

  return { campSites, isLoading, error };
}

// Custom hook to get reviews for a specific site from Supabase
export function useCampSiteReviews(siteId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query to fetch reviews from Supabase
  const { 
    data: reviews = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['campSiteReviews', siteId],
    queryFn: async () => {
      try {
        // Ensure user is authenticated
        await ensureAuthenticated();
        
        // Get reviews from Supabase
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('site_id', siteId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Map Supabase reviews to our format
        return data.map(mapSupabaseReview);
      } catch (error) {
        console.error('Error fetching reviews from Supabase:', error);
        
        // Fallback to localStorage if Supabase fails
        const allReviews = getStoredReviews();
        const siteReviews = allReviews.filter(review => review.siteId === siteId);
        
        toast({
          title: "Offline Mode",
          description: "Using locally stored reviews. Connect to the internet to see the latest reviews.",
          variant: "destructive",
        });
        
        return siteReviews;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Mutation for adding a new review
  const addReviewMutation = useMutation({
    mutationFn: (newReview: Omit<Review, 'id' | 'date'>) => saveReview(newReview),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campSiteReviews', siteId] });
      
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience at this campsite.",
      });
    },
    onError: (error) => {
      console.error('Error in mutation:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return { 
    reviews, 
    isLoading, 
    error,
    addReview: addReviewMutation.mutate,
    isAddingReview: addReviewMutation.isPending
  };
}

// Hook to add a new campsite
export function useAddCampSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addCampSiteMutation = useMutation({
    mutationFn: (newCampSite: Omit<CampSite, 'id'>) => saveCampSite(newCampSite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campSites'] });
      
      toast({
        title: "Campsite added!",
        description: "Your campsite has been added to the map.",
      });
    },
    onError: (error) => {
      console.error('Error adding campsite:', error);
      toast({
        title: "Error",
        description: "There was an error adding your campsite. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return {
    addCampSite: addCampSiteMutation.mutate,
    isAdding: addCampSiteMutation.isPending
  };
}
