
import { useState, useEffect } from "react";
import { mockCampSites } from "@/data/mockData";

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
export function useCampSites() {
  const [campSites, setCampSites] = useState<CampSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCampSites = async () => {
      try {
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCampSites(mockCampSites);
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to fetch camp sites"));
        setIsLoading(false);
      }
    };

    fetchCampSites();
  }, []);

  return { campSites, isLoading, error };
}
