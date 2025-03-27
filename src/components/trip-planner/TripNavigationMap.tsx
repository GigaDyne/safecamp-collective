
import { useState, useEffect, useRef } from "react";
import { useGoogleMapInitializer } from "@/hooks/useGoogleMapInitializer";
import { Trip, TripStop } from "@/lib/trip-planner/types";
import { createStopMarker } from "./map-utils/createStopMarker";
import MapError from "./map-components/MapError";
import MapLoadingState from "./map-components/MapLoadingState";
import { useGoogleMapsContext } from "@/contexts/GoogleMapsContext";

interface TripNavigationMapProps {
  trip: Trip;
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation?: { lat: number; lng: number } | null;
  onMapReady?: (map: google.maps.Map | null) => void;
}

const TripNavigationMap = ({ 
  trip, 
  tripStops, 
  currentStopIndex,
  userLocation, 
  onMapReady 
}: TripNavigationMapProps) => {
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const markers = useRef<google.maps.Marker[]>([]);
  const { googleMapsKey } = useGoogleMapsContext();
  
  const { 
    mapContainer, 
    map, 
    isMapLoaded, 
    mapsError 
  } = useGoogleMapInitializer();

  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Set up directions renderer
  useEffect(() => {
    if (!window.google || !map || !isMapLoaded) return;
    
    const renderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4A90E2',
        strokeWeight: 5,
        strokeOpacity: 0.7,
      },
    });
    
    setDirectionsRenderer(renderer);
    
    return () => {
      renderer.setMap(null);
    };
  }, [isMapLoaded, map]);

  // Display the current route segment
  useEffect(() => {
    if (!directionsRenderer || !window.google || !isMapLoaded || !tripStops || tripStops.length < 2) return;
    
    clearMarkers();
    
    const displayCurrentSegment = async () => {
      setIsLoadingRoute(true);
      
      const directionsService = new google.maps.DirectionsService();
      
      try {
        // Determine start and end points for the current segment
        const currentStop = tripStops[currentStopIndex];
        const nextStop = currentStopIndex < tripStops.length - 1 
          ? tripStops[currentStopIndex + 1] 
          : null;
        
        if (!currentStop || !nextStop) {
          directionsRenderer.setDirections({ routes: [], request: {} } as google.maps.DirectionsResult);
          setIsLoadingRoute(false);
          return;
        }
        
        // Add markers for current and next stop
        addMarker(currentStop, "Current Location");
        addMarker(nextStop, "Next Stop");
        
        // Calculate route between current and next stop
        const result = await directionsService.route({
          origin: { lat: currentStop.coordinates.lat, lng: currentStop.coordinates.lng },
          destination: { lat: nextStop.coordinates.lat, lng: nextStop.coordinates.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        });
        
        directionsRenderer.setDirections(result);
        
        // Center the map to show the entire route
        if (map && result.routes[0]?.bounds) {
          map.fitBounds(result.routes[0].bounds);
        }
      } catch (error) {
        console.error('Error calculating route:', error);
        directionsRenderer.setDirections({ routes: [], request: {} } as google.maps.DirectionsResult);
      } finally {
        setIsLoadingRoute(false);
      }
    };
    
    displayCurrentSegment();
  }, [currentStopIndex, directionsRenderer, isMapLoaded, tripStops, map]);

  // Add a marker to the map
  const addMarker = (stop: TripStop, label: string) => {
    if (!map) return;
    
    const marker = new google.maps.Marker({
      position: { 
        lat: stop.coordinates.lat, 
        lng: stop.coordinates.lng 
      },
      map: map,
      title: stop.name,
      label,
      icon: {
        url: createStopMarker(stop.type),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32),
      },
    });
    
    markers.current.push(marker);
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold">${stop.name}</h3>
          <p class="text-sm text-muted-foreground">${label}</p>
        </div>
      `,
    });
    
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  };

  // Clear all markers from the map
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
  };

  if (mapsError) {
    return <MapError error={mapsError} />;
  }

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {isLoadingRoute && <MapLoadingState message="Calculating route..." />}
    </div>
  );
};

export default TripNavigationMap;
