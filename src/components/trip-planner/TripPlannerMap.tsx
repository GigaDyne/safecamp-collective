
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, Plus, MapPin, Info } from "lucide-react";
import { TripStop, RouteData } from "@/lib/trip-planner/types";
import { createMapPinElement } from "@/components/map/MapPin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Utility function to create custom markers for different stop types
const createStopMarker = (type: string, safetyRating = 3, isSelected = false) => {
  const el = document.createElement('div');
  el.className = 'marker-element';
  
  // Add a class if the stop is selected for styling
  if (isSelected) {
    el.classList.add('selected-stop');
  }
  
  switch (type) {
    case 'campsite':
      el.innerHTML = createMapPinElement(safetyRating).outerHTML;
      break;
    case 'gas':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><rect width="8" height="5" x="7" y="5" rx="1"/><path d="M7 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><path d="M8 13v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>
                      </div>`;
      break;
    case 'water':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z"/></svg>
                      </div>`;
      break;
    case 'dump':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </div>`;
      break;
    default:
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
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
  mapboxToken?: string;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
}

const TripPlannerMap = ({ 
  routeData, 
  tripStops, 
  setTripStops,
  isLoading,
  mapboxToken,
  selectedStops,
  onAddToItinerary
}: TripPlannerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeSourceAdded = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!mapboxToken) {
      setError("Mapbox token is missing. Please set it using the settings button in the top right corner.");
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      
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
  }, [mapboxToken]);

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
        // Add new source and layer
        try {
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
        } catch (error) {
          console.error("Error adding route source/layer:", error);
        }
      } else {
        // Update existing source
        try {
          // Make sure the map is ready and source exists before attempting to update it
          if (map.current && map.current.getSource('route')) {
            const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
            source.setData({
              type: 'Feature',
              geometry: routeData.geometry
            });
          } else {
            console.log("Map or route source not available yet");
          }
        } catch (error) {
          console.error("Error updating route source:", error);
        }
      }

      // Fit the map to the route
      try {
        const bounds = new mapboxgl.LngLatBounds();
        routeData.geometry.coordinates.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      } catch (error) {
        console.error("Error fitting map to bounds:", error);
      }
    };

    // Wait for map to be loaded before adding sources and layers
    if (map.current.loaded()) {
      waitForMapLoad();
    } else {
      map.current.once('load', waitForMapLoad);
    }
  }, [routeData]);

  // Close popup when clicking outside of a marker
  useEffect(() => {
    if (!map.current) return;
    
    const handleMapClick = (e: any) => {
      // Check if click was on a marker
      const markers = document.querySelectorAll('.marker-element');
      let clickedOnMarker = false;
      
      // Get the clicked element and all its parents
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
  }, []);

  // Update markers when trip stops change
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add markers for all stops
    tripStops.forEach(stop => {
      if (!stop.coordinates) return;
      
      // Check if this stop is in the selected stops
      const isSelected = selectedStops.some(s => s.id === stop.id);
      
      const marker = new mapboxgl.Marker({
        element: createStopMarker(stop.type, stop.safetyRating, isSelected),
      })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      // Add click event to marker
      const markerElement = marker.getElement();
      markerElement.addEventListener('click', () => {
        // Show popup with stop information and add to itinerary button
        if (popupRef.current) {
          popupRef.current.remove();
        }
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 min-w-[200px]';
        
        // Stop name and type with icon
        const titleContainer = document.createElement('div');
        titleContainer.className = 'flex items-center gap-2 mb-2';
        
        // Add icon based on stop type
        const iconContainer = document.createElement('div');
        let iconColor = 'bg-green-500';
        let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
        
        switch (stop.type) {
          case 'gas':
            iconColor = 'bg-red-500';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><rect width="8" height="5" x="7" y="5" rx="1"/><path d="M7 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><path d="M8 13v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>';
            break;
          case 'water':
            iconColor = 'bg-blue-500';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z"/></svg>';
            break;
          case 'dump':
            iconColor = 'bg-amber-500';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
            break;
        }
        
        iconContainer.className = `w-6 h-6 rounded-full ${iconColor} flex items-center justify-center text-white`;
        iconContainer.innerHTML = iconSvg;
        titleContainer.appendChild(iconContainer);
        
        // Stop name with larger font
        const title = document.createElement('h3');
        title.className = 'font-semibold text-base';
        title.textContent = stop.name;
        titleContainer.appendChild(title);
        
        popupContent.appendChild(titleContainer);
        
        // Details section
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'space-y-2 mb-3';
        
        // Stop type
        const typeTag = document.createElement('div');
        typeTag.className = 'inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mb-2';
        typeTag.textContent = stop.type.charAt(0).toUpperCase() + stop.type.slice(1);
        detailsContainer.appendChild(typeTag);
        
        // Distance from route
        const distance = document.createElement('p');
        distance.className = 'text-xs text-muted-foreground flex items-center gap-1';
        
        const infoIcon = document.createElement('span');
        infoIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
        distance.appendChild(infoIcon);
        
        const distanceText = document.createElement('span');
        distanceText.textContent = stop.distanceFromRoute 
          ? `${(stop.distanceFromRoute / 1609.34).toFixed(1)} mi from route` 
          : "On route";
        distance.appendChild(distanceText);
        
        detailsContainer.appendChild(distance);
        
        // Add details if available
        if (stop.details && (stop.details.description || stop.details.features?.length)) {
          const description = document.createElement('p');
          description.className = 'text-xs mt-2';
          description.textContent = stop.details.description || '';
          detailsContainer.appendChild(description);
          
          if (stop.details.features?.length) {
            const features = document.createElement('div');
            features.className = 'flex flex-wrap gap-1 mt-1';
            
            stop.details.features.slice(0, 3).forEach(feature => {
              const featureTag = document.createElement('span');
              featureTag.className = 'text-xs bg-muted px-1.5 py-0.5 rounded-sm';
              featureTag.textContent = feature;
              features.appendChild(featureTag);
            });
            
            detailsContainer.appendChild(features);
          }
        }
        
        popupContent.appendChild(detailsContainer);
        
        // Add to itinerary button
        const addButtonContainer = document.createElement('div');
        addButtonContainer.className = 'flex justify-end mt-3';
        
        // Check if stop is already in itinerary
        const alreadyAdded = selectedStops.some(s => s.id === stop.id);
        
        if (!alreadyAdded) {
          const addButton = document.createElement('button');
          addButton.className = 'px-2.5 py-1.5 bg-primary text-primary-foreground text-xs rounded-md flex items-center gap-1.5 font-medium hover:bg-primary/90 transition-colors';
          addButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add to Itinerary';
          
          addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onAddToItinerary(stop);
            popupRef.current?.remove();
          });
          
          addButtonContainer.appendChild(addButton);
        } else {
          const addedText = document.createElement('span');
          addedText.className = 'text-xs text-green-600 font-medium flex items-center gap-1';
          addedText.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Added to itinerary';
          addButtonContainer.appendChild(addedText);
        }
        
        popupContent.appendChild(addButtonContainer);
        
        // Create and show popup with improved styling
        popupRef.current = new mapboxgl.Popup({ 
          offset: 25, 
          closeButton: true,
          closeOnClick: false,
          className: 'trip-planner-popup',
          maxWidth: '300px'
        })
          .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
          .setDOMContent(popupContent)
          .addTo(map.current!);
        
        setSelectedStop(stop);
        
        // Fly to the marker
        map.current?.flyTo({
          center: [stop.coordinates!.lng, stop.coordinates!.lat],
          zoom: 12,
          speed: 1.5
        });
      });
      
      markersRef.current.push(marker);
    });
  }, [tripStops, selectedStops, onAddToItinerary]);

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
      
      {!mapboxToken && (
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-center">Please set your Mapbox token using the settings button in the top right corner.</p>
          </div>
        </div>
      )}
      
      {/* Legend for map markers */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-md shadow-md">
        <h4 className="text-xs font-medium mb-2">Stop Types</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs">Campsites</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><rect width="8" height="5" x="7" y="5" rx="1"/><path d="M7 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><path d="M8 13v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>
            </div>
            <span className="text-xs">Gas Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z"/></svg>
            </div>
            <span className="text-xs">Water Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </div>
            <span className="text-xs">Dump Stations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerMap;
