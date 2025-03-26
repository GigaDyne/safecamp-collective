
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { TripStop } from '@/lib/trip-planner/types';
import { createStopMarker } from '../map-utils/createStopMarker';

interface UseMapMarkersProps {
  map: React.RefObject<mapboxgl.Map | null>;
  tripStops: TripStop[];
  selectedStops: TripStop[];
  onStopClick: (stop: TripStop) => void;
  onStopContextMenu: (stop: TripStop) => void;
  mapInitialized: boolean;
}

export const useMapMarkers = ({
  map,
  tripStops,
  selectedStops,
  onStopClick,
  onStopContextMenu,
  mapInitialized
}: UseMapMarkersProps) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map.current || !map.current.loaded() || !mapInitialized) return;
    
    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Create new markers for each stop
    tripStops.forEach(stop => {
      if (!stop.coordinates) return;
      
      const isSelected = selectedStops.some(s => s.id === stop.id);
      
      const marker = new mapboxgl.Marker({
        element: createStopMarker(stop.type, stop.safetyRating, isSelected),
      })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      const markerElement = marker.getElement();
      
      // Add click event listener to the marker
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        onStopClick(stop);
      });
      
      // Add context menu event listener to the marker
      markerElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        onStopContextMenu(stop);
      });
      
      markersRef.current.push(marker);
    });
  }, [tripStops, selectedStops, onStopClick, onStopContextMenu, map, mapInitialized]);

  return { markers: markersRef.current };
};
