
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { TripStop } from '@/lib/trip-planner/types';
import StopPopupContent from '../map-components/StopPopupContent';
import { useToast } from '@/hooks/use-toast';

interface UseMapPopupProps {
  map: React.RefObject<mapboxgl.Map | null>;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
}

export const useMapPopup = ({
  map,
  selectedStops,
  onAddToItinerary
}: UseMapPopupProps) => {
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const { toast } = useToast();

  // Handle map click (close popup if clicked outside marker)
  useEffect(() => {
    if (!map.current) return;
    
    const handleMapClick = (e: any) => {
      let clickedOnMarker = false;
      
      let el = e.originalEvent.target;
      while (el) {
        if (el.classList && el.classList.contains('marker-element')) {
          clickedOnMarker = true;
          break;
        }
        el = el.parentElement;
      }
      
      if (!clickedOnMarker && popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
        setSelectedStop(null);
      }
    };
    
    map.current.on('click', handleMapClick);
    
    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [map]);

  // Handle marker click to show popup
  const handleStopClick = (stop: TripStop) => {
    if (!map.current || !stop.coordinates) return;
    
    if (popupRef.current) {
      popupRef.current.remove();
    }
    
    setSelectedStop(stop);
    
    const isAlreadyAdded = selectedStops.some(s => s.id === stop.id);
    
    const { createPopupContent } = StopPopupContent({
      stop,
      onAddToItinerary: (clickedStop) => {
        onAddToItinerary(clickedStop);
        popupRef.current?.remove();
        
        toast({
          title: "Stop added",
          description: `Added ${clickedStop.name} to your itinerary`,
        });
      },
      isAlreadyAdded
    });
    
    popupRef.current = new mapboxgl.Popup({ 
      offset: 25, 
      closeButton: true,
      closeOnClick: false,
      className: 'trip-planner-popup',
      maxWidth: '300px'
    })
      .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
      .setDOMContent(createPopupContent())
      .addTo(map.current);
    
    map.current.flyTo({
      center: [stop.coordinates.lng, stop.coordinates.lat],
      zoom: 12,
      speed: 1.5
    });
  };

  const handleStopContextMenu = (stop: TripStop) => {
    setSelectedStop(stop);
  };

  return {
    selectedStop,
    setSelectedStop,
    handleStopClick,
    handleStopContextMenu,
  };
};
