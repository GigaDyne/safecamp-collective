
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CampSite } from '@/lib/supabase';
import debounce from 'lodash.debounce';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import mapboxgl from 'mapbox-gl';

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
  includeMapboxPOIs?: boolean;
  map?: mapboxgl.Map | null;
}

export function useViewportCampsites(
  bounds: ViewportBounds | null,
  options: UseViewportCampsitesOptions = {}
) {
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
  
  // Function to fetch campsites within viewport bounds from Supabase
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
          reviewCount: site.review_count || 0,
          source: 'supabase' as const
        }));
        
        setCampsites(mappedCampsites);
      }
      
      // If we should also include Mapbox POIs and the map is available
      if (includeMapboxPOIs && map && map.loaded()) {
        fetchMapboxCampsites(viewportBounds, map);
      }
    } catch (err) {
      console.error('Error fetching campsites by viewport:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching campsites'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to query visible Mapbox POIs that match camping-related keywords
  const fetchMapboxCampsites = (viewportBounds: ViewportBounds, mapInstance: mapboxgl.Map) => {
    try {
      if (!mapInstance || !mapInstance.loaded()) return;
      
      // Query all visible POIs/symbols on the map
      const campingRelatedFeatures = mapInstance.queryRenderedFeatures(undefined, {
        layers: ['poi-label', 'symbol']  // Common Mapbox layers for POIs
      });
      
      // Filter for camping-related features
      const campingKeywords = ['campground', 'camp', 'camping', 'rv', 'park', 'caravan'];
      
      const mapboxPOIs: CampSite[] = [];
      const existingSupabaseIds = new Set(campsites.map(c => c.id));
      const existingLocations = new Set(campsites.map(c => `${c.latitude.toFixed(5)},${c.longitude.toFixed(5)}`));
      
      campingRelatedFeatures.forEach(feature => {
        if (!feature.properties) return;
        
        // Check if this is potentially a camping-related POI
        const name = (feature.properties.name || '').toLowerCase();
        const poiType = (feature.properties.type || feature.properties.class || '').toLowerCase();
        
        const isCampingRelated = 
          campingKeywords.some(keyword => name.includes(keyword)) || 
          poiType === 'campsite' || 
          poiType === 'campground' ||
          poiType === 'camp_site' || 
          feature.properties.tourism === 'camp_site' ||
          feature.properties.leisure === 'camp_site';
        
        if (isCampingRelated && feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates;
          
          // Skip if we already have this location in our Supabase dataset
          const locationKey = `${coordinates[1].toFixed(5)},${coordinates[0].toFixed(5)}`;
          if (existingLocations.has(locationKey)) return;
          
          // Create a CampSite object from the map feature
          const newCampsite: CampSite = {
            id: `mapbox-${uuidv4()}`,
            name: feature.properties.name || 'Unnamed Campground',
            description: 'This campsite was found on the map. Details may be limited.',
            location: `${coordinates[1]},${coordinates[0]}`,
            coordinates: { lat: coordinates[1], lng: coordinates[0] },
            latitude: coordinates[1],
            longitude: coordinates[0],
            landType: 'unknown',
            safetyRating: 3, // Default middle rating
            cellSignal: 3,
            accessibility: 3,
            quietness: 3,
            features: ['Found on map'],
            images: [],
            reviewCount: 0,
            source: 'mapbox'
          };
          
          mapboxPOIs.push(newCampsite);
        }
      });
      
      console.log(`Found ${mapboxPOIs.length} camping POIs from Mapbox that aren't in Supabase`);
      
      // Update state with the Mapbox-sourced campsites
      setMapboxCampsites(mapboxPOIs);
      
      // If we found mapbox campsites that aren't in our database, set flag for UI
      setMissingCampsites(mapboxPOIs.length > 0);
    } catch (err) {
      console.error('Error fetching Mapbox campsites:', err);
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
