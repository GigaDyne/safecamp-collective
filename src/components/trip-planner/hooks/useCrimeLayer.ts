
import { useEffect, useRef } from 'react';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';

interface UseCrimeLayerProps {
  map: React.RefObject<google.maps.Map | null>;
  mapInitialized?: boolean;
  showCrimeData?: boolean;
  enabled?: boolean;
  crimeData?: CountyCrimeData[];
  onMarkerClick?: (data: CountyCrimeData) => void;
}

export const useCrimeLayer = ({
  map,
  mapInitialized = true,
  showCrimeData,
  enabled,
  crimeData = [],
  onMarkerClick
}: UseCrimeLayerProps) => {
  const crimeLayer = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map.current || !mapInitialized) {
      return;
    }

    // Determine if crime data should be shown (compatibility with both properties)
    const shouldShowCrimeData = showCrimeData || enabled;

    // Display crime data if enabled
    if (shouldShowCrimeData) {
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
          
          // Add click handler for crime data points if provided
          if (onMarkerClick && crimeData && crimeData.length > 0) {
            map.current.addListener('click', (event) => {
              // Find the closest crime data point to the click
              const clickLat = event.latLng.lat();
              const clickLng = event.latLng.lng();
              
              // Simple proximity check
              const closestPoint = crimeData.reduce((closest, point) => {
                const distance = Math.sqrt(
                  Math.pow(clickLat - point.lat, 2) + 
                  Math.pow(clickLng - point.lng, 2)
                );
                
                if (distance < 0.02 && (!closest.distance || distance < closest.distance)) {
                  return { point, distance };
                }
                return closest;
              }, { point: null, distance: null } as { point: CountyCrimeData | null, distance: number | null });
              
              if (closestPoint.point) {
                onMarkerClick(closestPoint.point);
              }
            });
          }
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
  }, [map, mapInitialized, showCrimeData, enabled, crimeData, onMarkerClick]);

  return { crimeLayer: crimeLayer.current };
};
