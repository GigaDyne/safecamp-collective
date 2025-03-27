
import { useState, useEffect, useRef } from 'react';
import { TripStop, RouteData } from '@/lib/trip-planner/types';
import { useLoadGoogleMaps } from '@/hooks/useLoadGoogleMaps';
import { useMapMarkers } from './useMapMarkers';
import { useMapRoute } from './useMapRoute';

interface UseTripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  isLoading: boolean;
  selectedStops: TripStop[];
  onSelectedStopChange: (stop: TripStop | null) => void;
}

export const useTripPlannerMap = ({
  routeData,
  tripStops,
  isLoading,
  selectedStops,
  onSelectedStopChange
}: UseTripPlannerMapProps) => {
  const [error, setError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  
  // Load Google Maps API
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";
  const { isLoaded: mapsLoaded, error: mapsError } = useLoadGoogleMaps(googleMapsKey);
  
  // Handle map errors
  useEffect(() => {
    if (mapsError) {
      setError(mapsError);
    }
  }, [mapsError]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapsLoaded) {
      return;
    }
    
    try {
      // Center map on Austin, Texas by default
      const defaultCenter = { lat: 30.2672, lng: -97.7431 };
      
      map.current = new google.maps.Map(mapContainer.current, {
        center: defaultCenter,
        zoom: 10,
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
        setMapInitialized(true);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please check your internet connection.");
    }
    
    return () => {
      map.current = null;
    };
  }, [mapsLoaded]);

  // Handle marker interactions
  const handleStopClick = (stop: TripStop) => {
    onSelectedStopChange(stop);
  };

  // Use the marker management hook
  const { markers } = useMapMarkers({
    map,
    tripStops,
    selectedStops,
    mapInitialized,
    onStopClick: handleStopClick,
  });

  // Use the route management hook
  const { routePolyline } = useMapRoute({
    map,
    routeData,
    mapInitialized
  });

  return {
    mapContainer,
    mapsLoaded,
    mapInitialized,
    error,
    isLoading,
    map
  };
};
