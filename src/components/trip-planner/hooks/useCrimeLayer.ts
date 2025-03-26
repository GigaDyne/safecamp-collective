
import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { CountyCrimeData, crimeDataToGeoJSON, getSafetyColor } from "@/lib/trip-planner/crime-data-service";

interface UseCrimeLayerProps {
  map: React.RefObject<mapboxgl.Map | null>;
  crimeData: CountyCrimeData[];
  enabled: boolean;
  onMarkerClick?: (data: CountyCrimeData) => void;
}

export const useCrimeLayer = ({ map, crimeData, enabled, onMarkerClick }: UseCrimeLayerProps) => {
  const [popupRef] = useState<{ current: mapboxgl.Popup | null }>({ current: null });
  
  // Add crime data layer to the map
  useEffect(() => {
    if (!map.current || !map.current.loaded() || !enabled) {
      return cleanup();
    }
    
    console.log("Crime layer enabled:", enabled);
    console.log("Crime data available:", crimeData.length);
    
    const mapInstance = map.current;
    
    const addLayers = () => {
      // Convert crime data to GeoJSON
      const geoJson = crimeDataToGeoJSON(crimeData);
      
      console.log("Adding crime data layers with data:", geoJson);
      
      // Add source if it doesn't exist
      if (!mapInstance.getSource('crime-data')) {
        mapInstance.addSource('crime-data', {
          type: 'geojson',
          data: geoJson,
        });
      } else {
        // Update existing source
        (mapInstance.getSource('crime-data') as mapboxgl.GeoJSONSource).setData(geoJson);
      }
      
      // Add heat map layer if it doesn't exist
      if (!mapInstance.getLayer('crime-heat')) {
        mapInstance.addLayer({
          id: 'crime-heat',
          type: 'heatmap',
          source: 'crime-data',
          paint: {
            'heatmap-weight': [
              'interpolate', ['linear'], ['get', 'safetyScore'],
              0, 1,
              100, 0
            ],
            'heatmap-intensity': [
              'interpolate', ['linear'], ['zoom'],
              0, 1,
              9, 3
            ],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'rgba(0, 255, 255, 0.2)',
              0.4, 'rgba(0, 255, 0, 0.4)',
              0.6, 'rgba(255, 255, 0, 0.6)',
              0.8, 'rgba(255, 0, 0, 0.8)',
              1, 'rgba(255, 0, 0, 1)'
            ],
            'heatmap-radius': [
              'interpolate', ['linear'], ['zoom'],
              0, 2,
              9, 20
            ],
            'heatmap-opacity': 0.8
          }
        });
      }
      
      // Add circle layer if it doesn't exist
      if (!mapInstance.getLayer('crime-points')) {
        mapInstance.addLayer({
          id: 'crime-points',
          type: 'circle',
          source: 'crime-data',
          minzoom: 7, // Only show points when zoomed in
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              7, 5,
              16, 15
            ],
            'circle-color': [
              'interpolate', ['linear'], ['get', 'safetyScore'],
              0, '#ef4444',  // Red for dangerous
              40, '#f97316', // Orange for caution
              60, '#f59e0b', // Amber for moderate
              80, '#10b981'  // Green for safe
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9
          }
        });
        
        // Add click event for the points
        mapInstance.on('click', 'crime-points', (e) => {
          if (e.features && e.features[0] && onMarkerClick) {
            const feature = e.features[0];
            const properties = feature.properties;
            
            // Find the county data that matches this feature
            const countyData = crimeData.find(county => 
              county.county_name === properties.name && 
              county.state_abbr === properties.state
            );
            
            if (countyData) {
              onMarkerClick(countyData);
            }
          }
        });
        
        // Change cursor on hover
        mapInstance.on('mouseenter', 'crime-points', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        
        mapInstance.on('mouseleave', 'crime-points', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }
    };
    
    // If the map is already loaded, add layers immediately
    if (mapInstance.loaded()) {
      addLayers();
    } else {
      // Otherwise wait for the load event
      mapInstance.once('load', addLayers);
    }
    
    // Cleanup function
    function cleanup() {
      if (!map.current) return;
      
      // Remove popup if it exists
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      
      // Remove layers and source if they exist
      if (map.current.getLayer('crime-points')) {
        map.current.removeLayer('crime-points');
      }
      
      if (map.current.getLayer('crime-heat')) {
        map.current.removeLayer('crime-heat');
      }
      
      if (map.current.getSource('crime-data')) {
        map.current.removeSource('crime-data');
      }
    }
    
    // Return cleanup function
    return cleanup;
  }, [map, crimeData, enabled, onMarkerClick, popupRef]);
  
  return { popupRef };
};
