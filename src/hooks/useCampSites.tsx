
import { useState, useEffect, useRef } from "react";
import { mockCampSites } from "@/data/mockData";
import { useQuery } from "@tanstack/react-query";

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

// Local storage keys
const REVIEWS_STORAGE_KEY = "campsite-reviews";

// In a real app, this would fetch from an API
const fetchCampSites = async (): Promise<CampSite[]> => {
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockCampSites;
};

// Helper function to get stored reviews
export const getStoredReviews = (): Review[] => {
  const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
  return storedReviews ? JSON.parse(storedReviews) : [];
};

// Helper function to save reviews
export const saveReview = (review: Review): void => {
  const currentReviews = getStoredReviews();
  const updatedReviews = [...currentReviews, review];
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
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

// Custom hook to get reviews for a specific site
export function useCampSiteReviews(siteId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    // Get reviews from localStorage
    const allReviews = getStoredReviews();
    const siteReviews = allReviews.filter(review => review.siteId === siteId);
    setReviews(siteReviews);
  }, [siteId]);

  return { reviews };
}
