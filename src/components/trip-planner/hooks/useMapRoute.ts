
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { RouteData } from '@/lib/trip-planner/types';

interface UseMapRouteProps {
  map: React.RefObject<mapboxgl.Map | null>;
  routeData: RouteData | null;
  mapInitialized: boolean;
}

export const useMapRoute = ({ 
  map, 
  routeData, 
  mapInitialized 
}: UseMapRouteProps) => {
  const routeSourceAdded = useRef(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map.current || !routeData || !mapInitialized) return;
    
    try {
      if (!map.current.loaded()) {
        console.log("Map not loaded yet, waiting...");
        map.current.once('load', () => drawRoute());
        return;
      }
      
      drawRoute();
    } catch (error) {
      console.error("Error in route drawing effect:", error);
    }
    
    function drawRoute() {
      if (!map.current || !routeData) return;
      
      // Log the route data to understand what we're working with
      console.log("Drawing route with data:", {
        hasGeometry: !!routeData.geometry,
        coordinateCount: routeData.geometry?.coordinates?.length || 0
      });
      
      try {
        // Clean up existing route if needed
        if (map.current.getLayer('route-line')) {
          map.current.removeLayer('route-line');
        }
        
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
        
        // Clean up existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Check if we have valid geometry
        if (!routeData.geometry || !routeData.geometry.coordinates || routeData.geometry.coordinates.length === 0) {
          console.error("Route data has invalid geometry:", routeData.geometry);
          return;
        }
        
        // Add the route source
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeData.geometry.coordinates
            }
          }
        });

        // Add the route layer
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#8B5CF6',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        // Add start marker
        const startCoords = routeData.geometry.coordinates[0];
        const startMarker = new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat([startCoords[0], startCoords[1]])
          .addTo(map.current);
        markersRef.current.push(startMarker);

        // Add end marker
        const endCoords = routeData.geometry.coordinates[routeData.geometry.coordinates.length - 1];
        const endMarker = new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat([endCoords[0], endCoords[1]])
          .addTo(map.current);
        markersRef.current.push(endMarker);

        routeSourceAdded.current = true;
        
        // Set the map bounds to fit the route
        const bounds = new mapboxgl.LngLatBounds();
        routeData.geometry.coordinates.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      } catch (error) {
        console.error("Error creating route:", error);
      }
    }
  }, [routeData, mapInitialized, map]);

  // Cleanup function to remove markers when component unmounts
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);

  return { routeSourceAdded: routeSourceAdded.current };
};
