
import { useEffect, useRef } from 'react';
import { RouteData } from '@/lib/trip-planner/types';

interface UseMapRouteProps {
  map: React.RefObject<google.maps.Map | null>;
  routeData: RouteData | null;
  mapInitialized: boolean;
}

export const useMapRoute = ({
  map,
  routeData,
  mapInitialized
}: UseMapRouteProps) => {
  const routePolyline = useRef<google.maps.Polyline | null>(null);

  // Add route to map when routeData changes
  useEffect(() => {
    if (!map.current || !mapInitialized || !routeData) {
      return;
    }
    
    // Clear existing polyline
    if (routePolyline.current) {
      routePolyline.current.setMap(null);
      routePolyline.current = null;
    }
    
    // Create route path
    if (routeData.geometry && routeData.geometry.coordinates) {
      const path = routeData.geometry.coordinates.map(coord => ({
        lat: coord[1], 
        lng: coord[0]
      }));
      
      routePolyline.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3887be',
        strokeOpacity: 0.75,
        strokeWeight: 5
      });
      
      routePolyline.current.setMap(map.current);
      
      // Fit bounds to show the route
      if (path.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        map.current.fitBounds(bounds);
      }
    }
    
    return () => {
      if (routePolyline.current) {
        routePolyline.current.setMap(null);
        routePolyline.current = null;
      }
    };
  }, [routeData, mapInitialized, map]);

  return {
    routePolyline: routePolyline.current
  };
};
