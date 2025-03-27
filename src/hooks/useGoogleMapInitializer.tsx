
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLoadGoogleMaps } from "./useLoadGoogleMaps";

interface UseGoogleMapInitializerProps {
  onMapReady?: (map: google.maps.Map) => void;
  options?: google.maps.MapOptions;
}

export function useGoogleMapInitializer({ onMapReady, options }: UseGoogleMapInitializerProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const mapInitializedRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";
  const { isLoaded: mapsScriptLoaded, error: mapsError } = useLoadGoogleMaps(googleMapsKey);

  useEffect(() => {
    if (!mapsScriptLoaded || map.current || !mapContainer.current || mapInitializedRef.current) return;
    
    console.log("Initializing Google map - this should only happen once");
    mapInitializedRef.current = true;

    try {
      // Center on Austin, Texas
      const defaultOptions = {
        center: { lat: 30.2672, lng: -97.7431 },
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      };
      
      map.current = new google.maps.Map(
        mapContainer.current, 
        options || defaultOptions
      );

      // Add event listener for when the map is fully loaded
      google.maps.event.addListenerOnce(map.current, 'idle', () => {
        console.log("Google Maps load event fired");
        setIsMapLoaded(true);
        
        initializeMapLayers();
        
        if (onMapReady && map.current) {
          onMapReady(map.current);
        }

        tryGetUserLocation();
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Map initialization failed");
      toast({
        title: "Map initialization failed",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    }

    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        // No need to explicitly remove the map with Google Maps
        map.current = null;
      }
    };
  }, [mapsScriptLoaded, toast, onMapReady, options]);

  const initializeMapLayers = () => {
    if (!map.current) return;
    
    // Initialize any map layers here (equivalent to map sources in Mapbox)
    // This could be for clustering, heatmaps, etc.
  };

  const tryGetUserLocation = () => {
    if (!map.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            map.current.setZoom(10);
          }
        },
        () => {
          console.log("Unable to get user location");
        }
      );
    }
  };

  return {
    mapContainer,
    map,
    isMapLoaded,
    mapsError,
    error,
    isLoading: !isMapLoaded && mapsScriptLoaded
  };
}
