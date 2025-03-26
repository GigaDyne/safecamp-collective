
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeRef = useRef<{ source: string; layer: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    const mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Create map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-97.7431, 30.2672], // Default to Austin, TX
        zoom: 13
      });
      
      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        'top-right'
      );
      
      // Wait for map to load
      map.current.on('load', () => {
        console.log("Navigation map loaded");
        setLoading(false);
        
        // Add route line if we have stops
        addRouteLines();
        
        // Add markers for stops
        addStopMarkers();
      });
    } catch (error) {
      console.error("Error initializing navigation map:", error);
      setLoading(false);
    }
    
    return () => {
      // Cleanup
      if (map.current) {
        console.log("Cleaning up navigation map");
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Add or update route lines between stops
  const addRouteLines = () => {
    if (!map.current || !map.current.loaded() || tripStops.length < 2) return;
    
    try {
      // Remove existing route if it exists
      if (routeRef.current) {
        if (map.current.getLayer(routeRef.current.layer)) {
          map.current.removeLayer(routeRef.current.layer);
        }
        if (map.current.getSource(routeRef.current.source)) {
          map.current.removeSource(routeRef.current.source);
        }
      }
      
      // Create coordinates array from stops
      const coordinates = tripStops.map(stop => [
        stop.coordinates.lng, 
        stop.coordinates.lat
      ]);
      
      // Don't add empty routes
      if (coordinates.length < 2) return;
      
      // Add route source
      const sourceId = 'navigation-route';
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });
      
      // Add route layer
      const layerId = 'navigation-route-line';
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#8B5CF6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
      
      // Save reference to route
      routeRef.current = { source: sourceId, layer: layerId };
      
      // Fit bounds to include all stops
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => {
        bounds.extend(coord as [number, number]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15
      });
    } catch (error) {
      console.error("Error adding route line:", error);
    }
  };
  
  // Add markers for all stops
  const addStopMarkers = () => {
    if (!map.current || tripStops.length === 0) return;
    
    try {
      // Remove existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Add markers for each stop
      tripStops.forEach((stop, index) => {
        const isCurrentStop = index === currentStopIndex;
        const el = createNavigationMarker(stop.type, isCurrentStop, index);
        
        const marker = new mapboxgl.Marker({
          element: el
        })
          .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
          .addTo(map.current!);
        
        // Add popup with stop info
        new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          offset: 25,
          className: 'stop-popup'
        })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${stop.name}</h3>
              <p class="text-xs text-gray-600">${stop.type || 'Stop'}</p>
            </div>
          `)
          .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
          .setMaxWidth('300px');
        
        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error("Error adding stop markers:", error);
    }
  };
  
  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;
    
    try {
      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      // Create user marker element
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.backgroundColor = '#3b82f6';
      el.style.width = '15px';
      el.style.height = '15px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // Add pulsing effect
      const pulse = document.createElement('div');
      pulse.className = 'user-location-pulse';
      pulse.style.position = 'absolute';
      pulse.style.top = '-8px';
      pulse.style.left = '-8px';
      pulse.style.right = '-8px';
      pulse.style.bottom = '-8px';
      pulse.style.borderRadius = '50%';
      pulse.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
      pulse.style.animation = 'pulse 2s ease-out infinite';
      el.appendChild(pulse);
      
      // Create and add marker
      userMarkerRef.current = new mapboxgl.Marker({
        element: el
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      // Add animation keyframes to document if not already added
      if (!document.getElementById('user-marker-animation')) {
        const style = document.createElement('style');
        style.id = 'user-marker-animation';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error("Error updating user location marker:", error);
    }
  }, [userLocation]);
  
  // Update markers when stops or current index changes
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      addStopMarkers();
      addRouteLines();
    }
  }, [tripStops, currentStopIndex]);
  
  return { mapContainer, map: map.current, loading };
};
