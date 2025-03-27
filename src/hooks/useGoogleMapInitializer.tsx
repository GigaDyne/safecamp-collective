
import { useState, useEffect, useRef } from "react";
import { useGoogleMapsContext } from "@/contexts/GoogleMapsContext";

interface UseGoogleMapInitializerProps {
  onMapReady?: (map: google.maps.Map) => void;
}

export function useGoogleMapInitializer({ onMapReady }: UseGoogleMapInitializerProps = {}) {
  const { googleMapsKey, setIsLoaded } = useGoogleMapsContext();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('Google Maps script loaded successfully');
          initializeMap();
        };
        
        script.onerror = () => {
          console.error('Error loading Google Maps script');
          setMapsError('Failed to load Google Maps. Please check your internet connection and try again.');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setMapsError('An error occurred while initializing the map.');
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current || !window.google) return;

      try {
        // Default map options
        const mapOptions: google.maps.MapOptions = {
          center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
          zoom: 12,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };

        map.current = new google.maps.Map(mapContainer.current, mapOptions);
        
        map.current.addListener('tilesloaded', () => {
          if (!isMapLoaded) {
            console.log('Map tiles loaded');
            setIsMapLoaded(true);
            setIsLoaded(true);
            if (onMapReady && map.current) {
              onMapReady(map.current);
            }
          }
        });
      } catch (error) {
        console.error('Error creating Google Map:', error);
        setMapsError('An error occurred while creating the map.');
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup if needed
    };
  }, [googleMapsKey, isMapLoaded, onMapReady, setIsLoaded]);

  return { mapContainer, map, isMapLoaded, mapsError };
}
