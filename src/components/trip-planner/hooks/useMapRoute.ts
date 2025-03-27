
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

        // Add the route layer with improved styling and zoom-dependent width
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'visible'
          },
          paint: {
            'line-color': '#F97316', // Bright orange for high visibility
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              1, 8,    // Width 8 at zoom level 1 (far out)
              5, 6,    // Width 6 at zoom level 5
              10, 5,   // Width 5 at zoom level 10
              15, 4    // Width 4 at zoom level 15 (close in)
            ],
            'line-opacity': 0.9,
            'line-blur': 0.5
          }
        }, 'poi-label'); // Add before POI labels but above other layers

        // Add a small border/outline to the route for better contrast
        map.current.addLayer({
          id: 'route-line-border',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'visible'
          },
          paint: {
            'line-color': '#FFFFFF', // White border
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              1, 12,   // Width 12 at zoom level 1 (far out)
              5, 10,   // Width 10 at zoom level 5
              10, 9,   // Width 9 at zoom level 10
              15, 8    // Width 8 at zoom level 15 (close in)
            ],
            'line-opacity': 0.5
          }
        }, 'route-line'); // Add below the main route line

        // Make the route line non-interactive so it doesn't block clicks on markers
        map.current.setLayoutProperty('route-line', 'visibility', 'visible');
        
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

        // Add route midpoint marker for extremely short routes at low zoom levels
        if (routeData.geometry.coordinates.length > 2) {
          const midIndex = Math.floor(routeData.geometry.coordinates.length / 2);
          const midCoords = routeData.geometry.coordinates[midIndex];
          const midMarker = new mapboxgl.Marker({ 
            color: '#F97316',
            scale: 0.7, 
            anchor: 'center' 
          })
            .setLngLat([midCoords[0], midCoords[1]])
            .addTo(map.current);
          markersRef.current.push(midMarker);
        }

        routeSourceAdded.current = true;
        
        // Set the map bounds to fit the route
        const bounds = new mapboxgl.LngLatBounds();
        routeData.geometry.coordinates.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
        
        // Add some padding to the bounds to make sure the route is visible
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
