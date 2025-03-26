
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";
import { TripStop, RouteData } from "@/lib/trip-planner/types";
import { createMapPinElement } from "@/components/map/MapPin";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Utility function to create custom markers for different stop types
const createStopMarker = (type: string, safetyRating = 3) => {
  const el = document.createElement('div');
  el.className = 'marker-element';
  
  switch (type) {
    case 'campsite':
      el.innerHTML = createMapPinElement(safetyRating).outerHTML;
      break;
    case 'gas':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white shadow-md border-2 border-white">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><rect width="8" height="5" x="7" y="5" rx="1"/><path d="M7 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><path d="M8 13v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>
                      </div>`;
      break;
    case 'water':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white shadow-md border-2 border-white">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z"/></svg>
                      </div>`;
      break;
    case 'dump':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white shadow-md border-2 border-white">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </div>`;
      break;
    default:
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white shadow-md border-2 border-white">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>`;
  }
  
  return el;
};

interface TripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
}

const TripPlannerMap = ({ 
  routeData, 
  tripStops, 
  setTripStops,
  isLoading 
}: TripPlannerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeSourceAdded = useRef(false);
  const [mapToken, setMapToken] = useState<string>(() => {
    return localStorage.getItem("mapbox_token") || "";
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!mapToken) {
      setError("Mapbox token is missing. Please set it in the Map view.");
      return;
    }

    try {
      mapboxgl.accessToken = mapToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-97.9222, 39.3820], // Center of USA
        zoom: 3
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          visualizePitch: true
        }),
        "top-right"
      );
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please check your Mapbox token.");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapToken]);

  // Update map when route data changes
  useEffect(() => {
    if (!map.current || !routeData) return;

    const waitForMapLoad = () => {
      if (!map.current?.loaded()) {
        setTimeout(waitForMapLoad, 100);
        return;
      }

      // Add the route to the map
      if (!routeSourceAdded.current) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: routeData.geometry
          }
        });

        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#8B5CF6',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        // Add start point marker
        const startCoords = routeData.geometry.coordinates[0];
        new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat([startCoords[0], startCoords[1]])
          .addTo(map.current);

        // Add end point marker
        const endCoords = routeData.geometry.coordinates[routeData.geometry.coordinates.length - 1];
        new mapboxgl.Marker({ color: '#EF4444' })
          .setLngLat([endCoords[0], endCoords[1]])
          .addTo(map.current);

        routeSourceAdded.current = true;
      } else {
        // Update existing source
        const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          geometry: routeData.geometry
        });
      }

      // Fit the map to the route
      const bounds = new mapboxgl.LngLatBounds();
      routeData.geometry.coordinates.forEach(coord => {
        bounds.extend([coord[0], coord[1]]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    };

    waitForMapLoad();
  }, [routeData]);

  // Update markers when trip stops change
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add markers for all stops
    tripStops.forEach(stop => {
      if (!stop.coordinates) return;
      
      const marker = new mapboxgl.Marker({
        element: createStopMarker(stop.type, stop.safetyRating),
      })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      // Add click event to marker
      const markerElement = marker.getElement();
      markerElement.addEventListener('click', () => {
        // Update the trip stops to toggle the selected state
        const isAlreadySelected = tripStops.some(s => 
          s.id === stop.id && s.isSelected);
        
        setTripStops(tripStops.map(s => 
          s.id === stop.id 
            ? { ...s, isSelected: !isAlreadySelected } 
            : s
        ));
        
        // Fly to the marker
        map.current?.flyTo({
          center: [stop.coordinates!.lng, stop.coordinates!.lat],
          zoom: 12,
          speed: 1.5
        });
      });
      
      markersRef.current.push(marker);
    });
  }, [tripStops, setTripStops]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {isLoading && (
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p className="text-sm font-medium">Planning your trip...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlannerMap;
