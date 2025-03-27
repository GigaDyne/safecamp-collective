
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

interface UseMapContextMenuProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  onShowAddLocationDialog: (location: {lat: number, lng: number}) => void;
}

export function useMapContextMenu({ map, onShowAddLocationDialog }: UseMapContextMenuProps) {
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [locationToAdd, setLocationToAdd] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!map.current) return;
    
    // Add context menu functionality for adding new locations
    const handleContextMenu = (e: mapboxgl.MapMouseEvent) => {
      e.preventDefault();
      
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      
      // Get coordinates from where user right-clicked
      const coordinates = e.lngLat;
      setLocationToAdd({lat: coordinates.lat, lng: coordinates.lng});
      
      // Create a popup with "Add location here" option
      popupRef.current = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-2 text-center">
            <p class="text-sm mb-2">Add a new location here?</p>
            <button id="add-location-btn" class="px-3 py-1 bg-primary text-primary-foreground text-xs rounded">
              Add Location
            </button>
          </div>
        `)
        .addTo(map.current);
        
      // Add event listener to the button
      document.getElementById('add-location-btn')?.addEventListener('click', () => {
        popupRef.current?.remove();
        onShowAddLocationDialog({lat: coordinates.lat, lng: coordinates.lng});
      });
    };
    
    map.current.on('contextmenu', handleContextMenu);
    
    return () => {
      if (map.current) {
        map.current.off('contextmenu', handleContextMenu);
      }
      
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };
  }, [map, onShowAddLocationDialog]);

  return {
    locationToAdd,
    setLocationToAdd,
    clearPopup: () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  };
}
