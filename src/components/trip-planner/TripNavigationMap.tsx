
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TripStop } from '@/lib/trip-planner/types';
import MapLegend from './map-components/MapLegend';
import MapLoadingState from './map-components/MapLoadingState';

interface TripNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
}

const TripNavigationMap = ({
  tripStops,
  currentStopIndex,
  userLocation
}: TripNavigationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Get Mapbox token from localStorage
    const mapboxToken = localStorage.getItem("mapbox_token") || "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
    
    if (!mapboxToken) {
      console.error("No Mapbox token found");
      return;
    }
    
    mapboxgl.accessToken = mapboxToken;
    
    // Use the first stop as the initial center or a default location
    const initialCenter = tripStops.length > 0 
      ? [tripStops[0].coordinates.lng, tripStops[0].coordinates.lat]
      : [-95.7129, 37.0902]; // Center of US
    
    // Create the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter as [number, number],
      zoom: 10
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-right'
    );
    
    // Set up event handlers
    map.current.on('load', () => {
      setMapInitialized(true);
      setLoading(false);
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Clear all markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      if (userMarkerRef.current) userMarkerRef.current.remove();
    };
  }, []);
  
  // Add markers for all stops
  useEffect(() => {
    if (!map.current || !mapInitialized || tripStops.length === 0) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Add markers for each stop
    tripStops.forEach((stop, index) => {
      const isCurrentStop = index === currentStopIndex;
      
      // Create HTML element for the marker
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = isCurrentStop ? '30px' : '20px';
      el.style.height = isCurrentStop ? '30px' : '20px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = isCurrentStop ? '3px solid white' : '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // Set marker color based on stop type
      switch (stop.type) {
        case 'campsite':
          el.style.backgroundColor = '#16a34a'; // green-600
          break;
        case 'gas':
          el.style.backgroundColor = '#ef4444'; // red-500
          break;
        case 'water':
          el.style.backgroundColor = '#3b82f6'; // blue-500
          break;
        case 'dump':
          el.style.backgroundColor = '#f59e0b'; // amber-500
          break;
        case 'walmart':
          el.style.backgroundColor = '#2563eb'; // blue-600
          break;
        case 'propane':
          el.style.backgroundColor = '#f97316'; // orange-500
          break;
        case 'repair':
          el.style.backgroundColor = '#3f3f46'; // zinc-700
          break;
        default:
          el.style.backgroundColor = '#6b7280'; // gray-500
      }
      
      // Add index number to the marker
      if (isCurrentStop) {
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.innerText = (index + 1).toString();
      }
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      markersRef.current[stop.id] = marker;
    });
    
    // Fit bounds to include all markers
    if (tripStops.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      tripStops.forEach(stop => {
        bounds.extend([stop.coordinates.lng, stop.coordinates.lat]);
      });
      map.current.fitBounds(bounds, { padding: 100 });
    }
  }, [tripStops, mapInitialized, currentStopIndex]);
  
  // Update current stop marker and center map
  useEffect(() => {
    if (!map.current || !mapInitialized || tripStops.length === 0) return;
    
    const currentStop = tripStops[currentStopIndex];
    if (!currentStop) return;
    
    // Fly to the current stop
    map.current.flyTo({
      center: [currentStop.coordinates.lng, currentStop.coordinates.lat],
      zoom: 13,
      essential: true
    });
  }, [currentStopIndex, tripStops, mapInitialized]);
  
  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapInitialized || !userLocation) return;
    
    // Remove previous user marker if exists
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    
    // Create HTML element for the user marker
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4338ca'; // indigo-600
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    // Pulse animation
    el.style.animation = 'pulse 2s infinite';
    
    // Create and add the user marker
    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
      
    // Add CSS for pulse animation
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

  return (
    <div className="relative w-full h-full">
      {loading && <MapLoadingState message="Loading map..." />}
      
      <div 
        ref={mapContainer} 
        className="absolute inset-0" 
        style={{ minHeight: '500px' }} 
      />
      
      <MapLegend />
    </div>
  );
};

export default TripNavigationMap;
