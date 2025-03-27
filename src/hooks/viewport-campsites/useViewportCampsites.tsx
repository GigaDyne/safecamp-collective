
import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { useToast } from '@/hooks/use-toast';
import { CampSite } from '@/lib/supabase';
import { ViewportBounds, UseViewportCampsitesOptions, UseViewportCampsitesResult } from './types';
import { fetchSupabaseCampsites } from './fetchSupabaseCampsites';
import { fetchMapboxCampsites } from './fetchMapboxCampsites';

export function useViewportCampsites(
  bounds: ViewportBounds | null,
  options: UseViewportCampsitesOptions = {}
): UseViewportCampsitesResult {
  const { 
    enabled = true, 
    limit = 50, 
    debounceMs = 300,
    includeMapboxPOIs = true,
    map = null
  } = options;
  
  const [campsites, setCampsites] = useState<CampSite[]>([]);
  const [mapboxCampsites, setMapboxCampsites] = useState<CampSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [missingCampsites, setMissingCampsites] = useState<boolean>(false);
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
      
      // Fetch from Supabase
      const { data: supabaseCampsites, error: supabaseError } = 
        await fetchSupabaseCampsites(viewportBounds, limit);
      
      if (supabaseError) throw supabaseError;
      
      setCampsites(supabaseCampsites);
      
      // If we should also include Mapbox POIs and the map is available
      if (includeMapboxPOIs && map && map.loaded()) {
        const mapboxPOIs = fetchMapboxCampsites(map, supabaseCampsites);
        setMapboxCampsites(mapboxPOIs);
        
        // If we found mapbox campsites that aren't in our database, set flag for UI
        setMissingCampsites(mapboxPOIs.length > 0);
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
  }, [bounds, enabled, debouncedFetch, map]);
  
  // Combine campsites from both sources
  const combinedCampsites = [...campsites, ...mapboxCampsites];
  
  return {
    campsites: combinedCampsites,
    supabaseCampsites: campsites,
    mapboxCampsites,
    isLoading,
    error,
    missingCampsites,
    refetch: () => bounds && fetchCampsitesInViewport(bounds)
  };
}
