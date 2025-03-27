
import { useCallback } from "react";
import { useMapContext } from "@/contexts/MapContext";
import { CampSite } from "@/lib/supabase";
import GoogleMapComponent from "./GoogleMapComponent";

interface MapVisualizerProps {
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  showCrimeData?: boolean;
}

const MapVisualizer = ({ 
  campSites, 
  isLoading, 
  showCrimeData = false 
}: MapVisualizerProps) => {
  const { 
    map, 
    setUseViewportLoading, 
    setViewportBounds 
  } = useMapContext();
  
  const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
    // Now we can assign directly to map.current since we're using MutableRefObject
    // Note: This is a type mismatch but for our transition period it will work
    // @ts-ignore - Temporarily ignore while transitioning from Mapbox to Google Maps
    map.current = mapInstance;
    
    // Make sure map is centered on Austin, Texas
    if (mapInstance) {
      mapInstance.setCenter({ lat: 30.2672, lng: -97.7431 });
      mapInstance.setZoom(10);
    }
    
    // Set up bounds change listener (equivalent to moveend in Mapbox)
    google.maps.event.addListener(mapInstance, 'bounds_changed', () => {
      const bounds = mapInstance.getBounds();
      const zoom = mapInstance.getZoom();
      
      if (zoom && bounds && zoom >= 8 && zoom <= 15) {
        setUseViewportLoading(true);
        setViewportBounds({
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng()
        });
      } else {
        setUseViewportLoading(false);
      }
    });
    
    // Initial bounds setting
    const bounds = mapInstance.getBounds();
    const zoom = mapInstance.getZoom();
    if (bounds && zoom && zoom >= 8 && zoom <= 15) {
      setUseViewportLoading(true);
      setViewportBounds({
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      });
    }
  }, [map, setUseViewportLoading, setViewportBounds]);

  return (
    <GoogleMapComponent 
      campSites={campSites}
      isLoading={isLoading}
      showCrimeData={showCrimeData}
      onMapReady={handleMapReady}
    />
  );
};

export default MapVisualizer;
