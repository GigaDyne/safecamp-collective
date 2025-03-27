
import { useEffect, useRef } from 'react';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';

interface UseCrimeLayerProps {
  map: React.RefObject<google.maps.Map | null>;
  mapInitialized?: boolean;
  showCrimeData: boolean;
  crimeData?: CountyCrimeData[];
}

export const useCrimeLayer = ({
  map,
  mapInitialized = true,
  showCrimeData,
  crimeData = []
}: UseCrimeLayerProps) => {
  const crimeLayer = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map.current || !mapInitialized) {
      return;
    }

    // Display crime data if enabled
    if (showCrimeData) {
      // Check if the Google Maps visualization library is loaded
      if (google.maps.visualization && !crimeLayer.current) {
        try {
          // Use provided crime data if available, otherwise create mock data
          let heatmapData: google.maps.LatLng[];
          
          if (crimeData && crimeData.length > 0) {
            // Convert real crime data to heatmap points
            heatmapData = crimeData.map(point => 
              new google.maps.LatLng(point.lat, point.lng)
            );
          } else {
            // Create mock crime data points as fallback
            heatmapData = Array.from({ length: 50 }, () => {
              // Get the center of the map
              const center = map.current?.getCenter();
              if (!center) return null;
              
              const lat = center.lat() + (Math.random() - 0.5) * 0.2;
              const lng = center.lng() + (Math.random() - 0.5) * 0.2;
              
              return new google.maps.LatLng(lat, lng);
            }).filter(Boolean) as google.maps.LatLng[];
          }
          
          // Create a heatmap layer
          crimeLayer.current = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map.current,
            radius: 20,
            opacity: 0.7,
            gradient: [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)'
            ]
          });
        } catch (err) {
          console.error("Error creating crime heatmap:", err);
        }
      }
    } else {
      // Hide crime data if not enabled
      if (crimeLayer.current) {
        crimeLayer.current.setMap(null);
        crimeLayer.current = null;
      }
    }

    return () => {
      if (crimeLayer.current) {
        crimeLayer.current.setMap(null);
        crimeLayer.current = null;
      }
    };
  }, [map, mapInitialized, showCrimeData, crimeData]);

  return { crimeLayer: crimeLayer.current };
};
