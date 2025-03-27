
import { useEffect, useRef } from 'react';
import { TripStop } from '@/lib/trip-planner/types';

interface UseMapMarkersProps {
  map: React.RefObject<google.maps.Map | null>;
  tripStops: TripStop[];
  selectedStops: TripStop[];
  mapInitialized: boolean;
  onStopClick: (stop: TripStop) => void;
}

export const useMapMarkers = ({
  map,
  tripStops,
  selectedStops,
  mapInitialized,
  onStopClick
}: UseMapMarkersProps) => {
  const markers = useRef<google.maps.Marker[]>([]);

  // Add markers for trip stops
  useEffect(() => {
    if (!map.current || !mapInitialized) {
      return;
    }
    
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
        onStopClick(stop);
        
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
    if (tripStops.length > 0 && map.current) {
      const bounds = new google.maps.LatLngBounds();
      
      tripStops.forEach(stop => {
        bounds.extend({ 
          lat: stop.coordinates.lat, 
          lng: stop.coordinates.lng 
        });
      });
      
      map.current.fitBounds(bounds);
    }
  }, [tripStops, mapInitialized, onStopClick, map, selectedStops]);

  return {
    markers: markers.current
  };
};
