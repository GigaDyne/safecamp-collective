
import { useEffect, useState, useRef } from 'react';
import { TripStop } from '@/lib/trip-planner/types';
import { createStopMarker } from '../map-utils/createStopMarker';
import { createNavigationMarker } from '../map-utils/createNavigationMarker';
import { useLoadGoogleMaps } from '@/hooks/useLoadGoogleMaps';

interface UseNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
  showCrimeData?: boolean;
}

export const useNavigationMap = ({ tripStops, currentStopIndex, userLocation, showCrimeData }: UseNavigationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const userMarker = useRef<google.maps.Marker | null>(null);
  const polyline = useRef<google.maps.Polyline | null>(null);
  const [loading, setLoading] = useState(true);
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";
  const { isLoaded: mapsLoaded, error: mapsError } = useLoadGoogleMaps(googleMapsKey);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapsLoaded) return;

    try {
      // Center on Austin, Texas by default
      const austinCoordinates = { lat: 30.2672, lng: -97.7431 };

      map.current = new google.maps.Map(mapContainer.current, {
        center: austinCoordinates,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      });

      // Add event listener for when map is fully loaded
      google.maps.event.addListenerOnce(map.current, 'idle', () => {
        setLoading(false);
      });
    } catch (error) {
      console.error('Error initializing navigation map:', error);
    }

    return () => {
      if (map.current) {
        // No need to explicitly remove the map with Google Maps
        map.current = null;
      }
    };
  }, [mapsLoaded]);

  // Update markers when stops change
  useEffect(() => {
    if (!map.current || loading || !mapsLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Clear existing polyline
    if (polyline.current) {
      polyline.current.setMap(null);
      polyline.current = null;
    }

    // Add new markers for each stop
    tripStops.forEach((stop, index) => {
      const isActive = index === currentStopIndex;
      
      // Create custom HTML marker element using the existing createStopMarker utility
      const markerElement = document.createElement('div');
      markerElement.innerHTML = createStopMarker(stop.type || 'campsite', stop.safetyRating, isActive).outerHTML;
      
      // Create a new Google Maps marker
      const marker = new google.maps.Marker({
        position: { lat: stop.coordinates.lat, lng: stop.coordinates.lng },
        map: map.current,
        title: stop.name,
        // Use the custom icon if needed
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerElement.innerHTML)}`,
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32)
        }
      });

      markers.current.push(marker);
    });

    // Create a polyline for the route if we have stops
    if (tripStops.length > 0) {
      const path = tripStops.map(stop => ({ 
        lat: stop.coordinates.lat, 
        lng: stop.coordinates.lng 
      }));
      
      polyline.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3887be',
        strokeOpacity: 0.75,
        strokeWeight: 5
      });
      
      polyline.current.setMap(map.current);
    }

    // If we have stops, fit the map to show them
    if (tripStops.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      tripStops.forEach(stop => {
        bounds.extend({ lat: stop.coordinates.lat, lng: stop.coordinates.lng });
      });
      
      if (userLocation) {
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
      }
      
      map.current.fitBounds(bounds);

      // Add a little padding
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      map.current.fitBounds(bounds, padding);
    }
  }, [tripStops, currentStopIndex, loading, mapsLoaded]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || loading || !userLocation || !mapsLoaded) return;
    
    if (userMarker.current) {
      userMarker.current.setMap(null);
      userMarker.current = null;
    }
    
    // Create custom HTML marker element for user location
    const markerElement = document.createElement('div');
    // Using existing utility for consistency
    markerElement.innerHTML = createNavigationMarker('user-location', false, -1).outerHTML;
    
    userMarker.current = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: map.current,
      title: 'Your Location',
      // Use the custom icon if needed
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerElement.innerHTML)}`,
        scaledSize: new google.maps.Size(24, 24),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(12, 12)
      }
    });
      
    // If we're in navigation mode, center on user
    if (tripStops.length > 0 && currentStopIndex >= 0) {
      map.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      map.current.setZoom(14);
    }
  }, [userLocation, loading, tripStops.length, currentStopIndex, mapsLoaded]);

  return { mapContainer, map, loading };
};
