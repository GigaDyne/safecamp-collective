
import { useRef, useState, useEffect } from "react";
import { useGoogleMapsContext } from "@/contexts/GoogleMapsContext";

export interface UseGoogleMapInitializerProps {
  onMapReady?: (map: google.maps.Map) => void;
  options?: google.maps.MapOptions;
}

export const useGoogleMapInitializer = ({
  onMapReady,
  options
}: UseGoogleMapInitializerProps = {}) => {
  const { googleMapsKey } = useGoogleMapsContext();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Default options if none provided
      const defaultOptions: google.maps.MapOptions = {
        center: { lat: 37.0902, lng: -95.7129 }, // Center of US
        zoom: 4,
        mapTypeId: 'roadmap'
      };

      // Initialize the map with provided options or defaults
      map.current = new google.maps.Map(
        mapContainer.current, 
        options || defaultOptions
      );

      // Add event listener for when map is fully loaded
      google.maps.event.addListenerOnce(map.current, 'idle', () => {
        setIsMapLoaded(true);
        if (onMapReady && map.current) {
          onMapReady(map.current);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapsError("Failed to initialize map. Please check your network connection and try again.");
    }

    return () => {
      // Clean up the map instance on unmount
      map.current = null;
      setIsMapLoaded(false);
    };
  }, [onMapReady, options]);

  return {
    mapContainer,
    map,
    isMapLoaded,
    mapsError
  };
};
