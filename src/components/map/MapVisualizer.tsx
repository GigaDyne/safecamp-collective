
import { useCallback } from "react";
import { useMapContext } from "@/contexts/MapContext";
import { CampSite } from "@/lib/supabase";
import MapInitializerWithPremium from "./MapInitializerWithPremium";
import mapboxgl from "mapbox-gl";

interface MapVisualizerProps {
  mapboxToken: string;
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  showCrimeData?: boolean;
}

const MapVisualizer = ({ 
  mapboxToken, 
  campSites, 
  isLoading, 
  showCrimeData = false 
}: MapVisualizerProps) => {
  const { 
    map, 
    setUseViewportLoading, 
    setViewportBounds 
  } = useMapContext();
  
  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    // Instead of directly assigning to map.current, which is read-only
    if (map.current !== mapInstance) {
      // Set the reference through its containing object
      map.current = mapInstance;
    }
    
    mapInstance.on('moveend', () => {
      const zoom = mapInstance.getZoom();
      const bounds = mapInstance.getBounds();
      
      if (zoom >= 8 && zoom <= 15) {
        setUseViewportLoading(true);
        setViewportBounds({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      } else {
        setUseViewportLoading(false);
      }
    });
    
    const bounds = mapInstance.getBounds();
    const zoom = mapInstance.getZoom();
    if (zoom >= 8 && zoom <= 15) {
      setUseViewportLoading(true);
      setViewportBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    }
  }, [map, setUseViewportLoading, setViewportBounds]);

  return (
    <MapInitializerWithPremium 
      mapboxToken={mapboxToken}
      campSites={campSites}
      isLoading={isLoading}
      onMapReady={handleMapReady}
      showCrimeData={showCrimeData}
    />
  );
};

export default MapVisualizer;
