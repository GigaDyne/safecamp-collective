import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TripStop } from '@/lib/trip-planner/types';
import { createNavigationMarker } from '../map-utils/createNavigationMarker';

interface UseNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
}

export const useNavigationMap = ({
  tripStops,
  currentStopIndex,
  userLocation
}: UseNavigationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLineAdded = useRef(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map
    const token = 'pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg';
    mapboxgl.accessToken = token;
    
    console.log("Initializing navigation map...");
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-97.9222, 39.3820], // Default center (US)
      zoom: 3,
      attributionControl: true
    });
    
    map.current.on('load', () => {
      console.log("Navigation map loaded successfully");
      setLoading(false);
      
      // Draw route between stops (if we have multiple stops)
      if (tripStops.length >= 2) {
        drawRouteLine();
      }
    });
    
    map.current.on('error', (e) => {
      console.error("Map error:", e);
      setLoading(false);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      // Clean up markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      if (userMarker.current) {
        userMarker.current.remove();
        userMarker.current = null;
      }
    };
  }, []);
  
  // Update markers when stops or current index changes
  useEffect(() => {
    if (!map.current || loading) return;
    
    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add markers for all stops
    tripStops.forEach((stop, index) => {
      const isCurrent = index === currentStopIndex;
      
      // Create marker element
      const el = createNavigationMarker(
        stop.type,
        isCurrent,
        index
      );
      
      // Create and add the Mapbox marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
    
    // If we have at least 2 stops, draw a route line between them
    if (tripStops.length >= 2) {
      drawRouteLine();
    }
    
    // Center on current stop
    if (tripStops[currentStopIndex]) {
      const currentStop = tripStops[currentStopIndex];
      map.current.flyTo({
        center: [currentStop.coordinates.lng, currentStop.coordinates.lat],
        zoom: 14,
        essential: true
      });
    }
  }, [tripStops, currentStopIndex, loading]);
  
  // Update user location marker
  useEffect(() => {
    if (!map.current || loading || !userLocation) return;
    
    if (userMarker.current) {
      userMarker.current.remove();
    }
    
    userMarker.current = new mapboxgl.Marker({
      color: '#0EA5E9',
      scale: 0.8
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
    
    // If we're actively navigating to a stop, adjust the map to show both user and destination
    if (tripStops[currentStopIndex]) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend([userLocation.lng, userLocation.lat])
        .extend([
          tripStops[currentStopIndex].coordinates.lng,
          tripStops[currentStopIndex].coordinates.lat
        ]);
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15
      });
    }
  }, [userLocation, loading, tripStops, currentStopIndex]);
  
  // Function to draw a line connecting all stops
  const drawRouteLine = () => {
    if (!map.current || tripStops.length < 2) return;
    
    try {
      // Remove existing route line if any
      if (map.current.getLayer('route-line')) {
        map.current.removeLayer('route-line');
      }
      
      if (map.current.getLayer('route-border')) {
        map.current.removeLayer('route-border');
      }
      
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
      
      // Create coordinates array from trip stops
      const coordinates = tripStops.map(stop => [
        stop.coordinates.lng,
        stop.coordinates.lat
      ]);
      
      // Add source for the route
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      });
      
      // Add border for the route line (appears below the main line)
      map.current.addLayer({
        id: 'route-border',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#FFFFFF',
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
      }, 'poi-label'); // Add before POI labels
      
      // Add the main route line
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
          'line-opacity': 0.9
        }
      }, 'poi-label'); // Add before POI labels
      
      routeLineAdded.current = true;
      
      console.log("Route line drawn with coordinates:", coordinates.length);
    } catch (error) {
      console.error("Error drawing route line:", error);
    }
  };
  
  return { mapContainer, loading, map };
};
