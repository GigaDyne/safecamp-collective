
import { useState, useEffect, useRef } from 'react';
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
  const [mapInitialized, setMapInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    const mapboxToken = localStorage.getItem("mapbox_token") || "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
    
    if (!mapboxToken) {
      console.error("No Mapbox token found");
      return;
    }
    
    mapboxgl.accessToken = mapboxToken;
    
    const initialCenter = tripStops.length > 0 
      ? [tripStops[0].coordinates.lng, tripStops[0].coordinates.lat]
      : [-95.7129, 37.0902];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter as [number, number],
      zoom: 10
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-right'
    );
    
    map.current.on('load', () => {
      setMapInitialized(true);
      setLoading(false);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      Object.values(markersRef.current).forEach(marker => marker.remove());
      if (userMarkerRef.current) userMarkerRef.current.remove();
    };
  }, []);
  
  // Update trip stop markers
  useEffect(() => {
    if (!map.current || !mapInitialized || tripStops.length === 0) return;
    
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    tripStops.forEach((stop, index) => {
      const isCurrentStop = index === currentStopIndex;
      const el = createNavigationMarker(stop.type, isCurrentStop, index);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      markersRef.current[stop.id] = marker;
    });
    
    if (tripStops.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      tripStops.forEach(stop => {
        bounds.extend([stop.coordinates.lng, stop.coordinates.lat]);
      });
      map.current.fitBounds(bounds, { padding: 100 });
    }
  }, [tripStops, mapInitialized, currentStopIndex]);
  
  // Focus on current stop
  useEffect(() => {
    if (!map.current || !mapInitialized || tripStops.length === 0) return;
    
    const currentStop = tripStops[currentStopIndex];
    if (!currentStop) return;
    
    map.current.flyTo({
      center: [currentStop.coordinates.lng, currentStop.coordinates.lat],
      zoom: 13,
      essential: true
    });
  }, [currentStopIndex, tripStops, mapInitialized]);
  
  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapInitialized || !userLocation) return;
    
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4338ca';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    el.style.animation = 'pulse 2s infinite';
    
    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
      
    if (!document.getElementById('map-marker-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'map-marker-pulse-style';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, [userLocation, mapInitialized]);

  return {
    mapContainer,
    loading,
    markersRef
  };
};
