
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

// In a real app, this would fetch from an API
const fetchCampSites = async (): Promise<CampSite[]> => {
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockCampSites;
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
