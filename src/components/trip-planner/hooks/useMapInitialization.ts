
import { useEffect, useRef, useState } from 'react';
import { RouteData } from '@/lib/trip-planner/types';
import { useLoadGoogleMaps } from '@/hooks/useLoadGoogleMaps';

interface UseMapInitializationProps {
  mapboxToken?: string;
  routeData: RouteData | null;
}

export const useMapInitialization = ({ mapboxToken, routeData }: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInitializationAttempted = useRef(false);
  
  // Load Google Maps API
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";
  const { isLoaded: mapsLoaded, error: mapsError } = useLoadGoogleMaps(googleMapsKey);

  // Clear error when token changes
  useEffect(() => {
    if (mapsError) {
      setError(mapsError);
    }
  }, [mapsError]);

  useEffect(() => {
    // Only initialize if we have a container and haven't attempted initialization yet
    if (!mapContainer.current || map.current || mapInitializationAttempted.current || !mapsLoaded) return;
    
    // Mark that we've attempted initialization
    mapInitializationAttempted.current = true;
    
    try {
      // Clear any existing errors when attempting to initialize
      setError(null);
      
      console.log("Initializing Google map with API key");
      
      // Create new map instance with Austin, Texas coordinates
      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 30.2672, lng: -97.7431 }, // Austin, Texas coordinates
        zoom: 10, // Closer zoom to focus on the city
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      });

      // Add event listener for when map is fully loaded
      google.maps.event.addListenerOnce(map.current, 'idle', () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
      });
      
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please check your network connection.");
    }

    // Cleanup function
    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        // No need to explicitly remove the map with Google Maps
        map.current = null;
        setMapInitialized(false);
        mapInitializationAttempted.current = false;
      }
    };
  }, [mapsLoaded]); // Only re-run when Google Maps script is loaded

  // Reset function to allow re-initialization if needed
  const resetMap = () => {
    if (map.current) {
      map.current = null;
    }
    setMapInitialized(false);
    mapInitializationAttempted.current = false;
    setError(null);
  };

  return {
    mapContainer,
    map,
    mapInitialized,
    error,
    resetMap
  };
};
