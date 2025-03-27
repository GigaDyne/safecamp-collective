
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CampSite } from '@/lib/supabase';
import debounce from 'lodash.debounce';
import { useToast } from '@/hooks/use-toast';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface UseViewportCampsitesOptions {
  enabled?: boolean;
  limit?: number;
  debounceMs?: number;
}

export function useViewportCampsites(
  bounds: ViewportBounds | null,
  options: UseViewportCampsitesOptions = {}
) {
  const { 
    enabled = true, 
    limit = 50, 
    debounceMs = 300 
  } = options;
  
  const [campsites, setCampsites] = useState<CampSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastBounds = useRef<ViewportBounds | null>(null);
  const { toast } = useToast();
  
  // Function to fetch campsites within viewport bounds
  const fetchCampsitesInViewport = async (viewportBounds: ViewportBounds) => {
    if (!viewportBounds || !enabled) return;
    
    // Skip if bounds haven't changed significantly (to reduce queries)
    if (lastBounds.current && 
        Math.abs(lastBounds.current.north - viewportBounds.north) < 0.01 &&
        Math.abs(lastBounds.current.south - viewportBounds.south) < 0.01 &&
        Math.abs(lastBounds.current.east - viewportBounds.east) < 0.01 &&
        Math.abs(lastBounds.current.west - viewportBounds.west) < 0.01) {
      return;
    }
    
    // Update last bounds
    lastBounds.current = viewportBounds;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('campsites')
        .select('*')
        .gte('latitude', viewportBounds.south)
        .lte('latitude', viewportBounds.north)
        .gte('longitude', viewportBounds.west)
        .lte('longitude', viewportBounds.east)
        .limit(limit);
      
      if (error) throw error;
      
      if (data) {
        // Map Supabase response to CampSite format
        const mappedCampsites = data.map(site => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location,
          coordinates: site.latitude && site.longitude ? { lat: site.latitude, lng: site.longitude } : undefined,
          latitude: site.latitude,
          longitude: site.longitude,
          landType: site.land_type,
          safetyRating: site.safety_rating,
          cellSignal: site.cell_signal,
          accessibility: site.accessibility,
          quietness: site.quietness,
          features: site.features || [],
          images: site.images || [],
          reviewCount: site.review_count || 0
        }));
        
        setCampsites(mappedCampsites);
      }
    } catch (err) {
      console.error('Error fetching campsites by viewport:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching campsites'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a debounced version of the fetch function
  const debouncedFetch = useRef(
    debounce(fetchCampsitesInViewport, debounceMs)
  ).current;
  
  // Fetch campsites when bounds change
  useEffect(() => {
    if (bounds && enabled) {
      debouncedFetch(bounds);
    }
    
    return () => {
      debouncedFetch.cancel();
    };
  }, [bounds, enabled, debouncedFetch]);
  
  return {
    campsites,
    isLoading,
    error,
    refetch: () => bounds && fetchCampsitesInViewport(bounds)
  };
}
