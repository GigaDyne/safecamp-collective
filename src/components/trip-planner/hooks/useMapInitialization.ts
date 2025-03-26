
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { RouteData } from '@/lib/trip-planner/types';

interface UseMapInitializationProps {
  mapboxToken?: string;
  routeData: RouteData | null;
}

export const useMapInitialization = ({ mapboxToken, routeData }: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const routeSourceAdded = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    if (!mapboxToken) {
      setError("Mapbox token is missing. Please set it using the settings button in the top right corner.");
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-97.9222, 39.3820],
        zoom: 3
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          visualizePitch: true
        }),
        "top-right"
      );
      
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please check your Mapbox token.");
    }

    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  return {
    mapContainer,
    map,
    mapInitialized,
    error,
    routeSourceAdded
  };
};
