
import { useState, useEffect, useRef } from "react";
import { mockCampSites } from "@/data/mockData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, mapSupabaseReview, formatReviewForSupabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

// Types
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

// Local storage keys for fallback
const REVIEWS_STORAGE_KEY = "campsite-reviews";

// In a real app, this would fetch from an API
const fetchCampSites = async (): Promise<CampSite[]> => {
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockCampSites;
};

// Helper function to get stored reviews from localStorage (fallback)
export const getStoredReviews = (): Review[] => {
  const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
  return storedReviews ? JSON.parse(storedReviews) : [];
};

// Function to save review to Supabase
export const saveReview = async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  const { toast } = useToast();
  
  try {
    // Format review for Supabase
    const supabaseReview = formatReviewForSupabase(review);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('reviews')
      .insert(supabaseReview)
      .select()
      .single();
    
    if (error) throw error;
    
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
    
    toast({
      title: "Offline Mode",
      description: "Your review has been saved locally and will sync when you're back online.",
      variant: "destructive",
    });
    
    return newReview;
  }
};

export function useCampSites() {
  // Use React Query to handle data fetching, caching, and loading states
  const { data: campSites, isLoading, error } = useQuery({
    queryKey: ['campSites'],
    queryFn: fetchCampSites,
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
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
    onSuccess: (savedReview) => {
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
