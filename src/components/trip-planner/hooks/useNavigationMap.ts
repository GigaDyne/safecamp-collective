
import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { TripStop } from '@/lib/trip-planner/types';
import { createStopMarker } from '../map-utils/createStopMarker';
import { createNavigationMarker } from '../map-utils/createNavigationMarker';

interface UseNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
  showCrimeData?: boolean;
}

export const useNavigationMap = ({ tripStops, currentStopIndex, userLocation, showCrimeData }: UseNavigationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const mapInitialized = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || mapInitialized.current) return;
    mapInitialized.current = true;

    try {
      const mapboxToken = localStorage.getItem('mapbox_token') || '';
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-day-v1',
        center: [-97.7431, 30.2672], // Austin, Texas coordinates
        zoom: 10,
        attributionControl: false
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          visualizePitch: true
        })
      );

      map.current.on('load', () => {
        setLoading(false);
        
        // Add a source for the route line
        if (map.current) {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: []
              }
            }
          });

          // Add a layer for the route line
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });
        }
      });
    } catch (error) {
      console.error('Error initializing navigation map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when stops change
  useEffect(() => {
    if (!map.current || loading) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each stop
    tripStops.forEach((stop, index) => {
      const isActive = index === currentStopIndex;
      const marker = new mapboxgl.Marker({
        element: createStopMarker(stop, isActive, index)
      })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // If we have stops, fit the map to show them
    if (tripStops.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      tripStops.forEach(stop => {
        bounds.extend([stop.coordinates.lng, stop.coordinates.lat]);
      });
      
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15
      });
    }

    // Update route line if we have stops
    if (tripStops.length > 0 && map.current.getSource('route')) {
      const routeCoordinates = tripStops.map(stop => [stop.coordinates.lng, stop.coordinates.lat]);
      
      (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
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
      element: createNavigationMarker()
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
      
    // If we're in navigation mode, center on user
    if (tripStops.length > 0 && currentStopIndex >= 0) {
      map.current.easeTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14
      });
    }
  }, [userLocation, loading, tripStops.length, currentStopIndex]);

  return { mapContainer, map, loading };
};
