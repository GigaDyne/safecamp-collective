
import { useState, useEffect, useRef } from 'react';
import { TripStop, RouteData } from '@/lib/trip-planner/types';
import { useToast } from '@/hooks/use-toast';
import { useLoadGoogleMaps } from '@/hooks/useLoadGoogleMaps';

interface UseTripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  isLoading: boolean;
  selectedStops: TripStop[];
  onSelectedStopChange: (stop: TripStop | null) => void;
}

export const useTripPlannerMap = ({
  routeData,
  tripStops,
  isLoading,
  selectedStops,
  onSelectedStopChange
}: UseTripPlannerMapProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const routePolyline = useRef<google.maps.Polyline | null>(null);
  
  // Load Google Maps API
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";
  const { isLoaded: mapsLoaded, error: mapsError } = useLoadGoogleMaps(googleMapsKey);
  
  useEffect(() => {
    if (mapsError) {
      setError(mapsError);
    }
  }, [mapsError]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapsLoaded) return;
    
    try {
      console.log("Initializing Google Maps in TripPlannerMap");
      // Center map on Austin, Texas by default
      const defaultCenter = { lat: 30.2672, lng: -97.7431 };
      
      map.current = new google.maps.Map(mapContainer.current, {
        center: defaultCenter,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      });
      
      // Add event listener for when map is fully loaded
      google.maps.event.addListenerOnce(map.current, 'idle', () => {
        console.log("Google Maps loaded in TripPlannerMap");
        setMapInitialized(true);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please check your internet connection.");
    }
    
    return () => {
      // Clean up markers
      if (markers.current) {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
      }
      
      // Clean up polyline
      if (routePolyline.current) {
        routePolyline.current.setMap(null);
        routePolyline.current = null;
      }
      
      // No need to explicitly remove map with Google Maps
      map.current = null;
    };
  }, [mapsLoaded]);

  // Add route to map when routeData changes
  useEffect(() => {
    if (!map.current || !mapInitialized || !routeData) return;
    
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
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      map.current.fitBounds(bounds);
    }
  }, [routeData, mapInitialized]);

  // Add markers for trip stops
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    
    // Add markers for trip stops
    tripStops.forEach(stop => {
      // Create marker for each stop
      const marker = new google.maps.Marker({
        position: { 
          lat: stop.coordinates.lat, 
          lng: stop.coordinates.lng 
        },
        map: map.current,
        title: stop.name,
        // Can customize the icon here if needed
      });
      
      // Add click listener to handle stop selection
      marker.addListener('click', () => {
        onSelectedStopChange(stop);
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${stop.name}</h3>
              <p class="text-sm">${stop.type || 'campsite'}</p>
              ${stop.distance ? `<p class="text-sm">${(stop.distance / 1609.34).toFixed(1)} miles</p>` : ''}
            </div>
          `
        });
        
        infoWindow.open(map.current, marker);
      });
      
      // Add to markers array
      markers.current.push(marker);
    });
    
    // If we have stops, fit the map to show them
    if (tripStops.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      tripStops.forEach(stop => {
        bounds.extend({ 
          lat: stop.coordinates.lat, 
          lng: stop.coordinates.lng 
        });
      });
      
      map.current.fitBounds(bounds);
    }
  }, [tripStops, mapInitialized, onSelectedStopChange]);

  return {
    mapContainer,
    mapsLoaded,
    mapInitialized,
    error,
    isLoading,
    map
  };
};
