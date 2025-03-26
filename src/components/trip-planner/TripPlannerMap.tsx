
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, Plus, MapPin, Info, ShoppingCart, Flame, Wrench } from "lucide-react";
import { TripStop, RouteData } from "@/lib/trip-planner/types";
import { createMapPinElement } from "@/components/map/MapPin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";

const createStopMarker = (type: string, safetyRating = 3, isSelected = false) => {
  const el = document.createElement('div');
  el.className = 'marker-element';
  
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
    case 'walmart':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 10 5-6 5 6"/><path d="m18 10-5-6-5 6"/><path d="M12 10v6"/><path d="M2 14h12a2 2 0 0 1 2 2c0 1 .5 3 2 3a1 1 0 0 0 1-1"/></svg>
                      </div>`;
      break;
    case 'propane':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c0-2.76-1.11-5.24-2.88-7L12 3l2.88 2c-1.77 1.76-2.88 4.24-2.88 7z"/><path d="M12 12c0 2.76 1.11 5.24 2.88 7L12 21l-2.88-2c1.77-1.76 2.88-4.24 2.88-7z"/><path d="M20 12h-4"/><path d="M4 12h4"/></svg>
                      </div>`;
      break;
    case 'repair':
      el.innerHTML = `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
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
  const { toast } = useToast();

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
        center: [-97.9222, 39.3820],
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

  useEffect(() => {
    if (!map.current || !routeData) return;

    const waitForMapLoad = () => {
      if (!map.current?.loaded()) {
        setTimeout(waitForMapLoad, 100);
        return;
      }

      try {
        if (!routeSourceAdded.current) {
          // Adding route for the first time
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

          const startCoords = routeData.geometry.coordinates[0];
          new mapboxgl.Marker({ color: '#10B981' })
            .setLngLat([startCoords[0], startCoords[1]])
            .addTo(map.current);

          const endCoords = routeData.geometry.coordinates[routeData.geometry.coordinates.length - 1];
          new mapboxgl.Marker({ color: '#EF4444' })
            .setLngLat([endCoords[0], endCoords[1]])
            .addTo(map.current);

          routeSourceAdded.current = true;
        } else {
          // Updating existing route
          const source = map.current.getSource('route');
          if (source && 'setData' in source) {
            source.setData({
              type: 'Feature',
              geometry: routeData.geometry
            });
          } else {
            console.log("Route source not available or doesn't have setData method");
          }
        }
      } catch (error) {
        console.error("Error updating route source:", error);
      }

      const bounds = new mapboxgl.LngLatBounds();
      routeData.geometry.coordinates.forEach(coord => {
        bounds.extend([coord[0], coord[1]]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    };

    if (map.current.loaded()) {
      waitForMapLoad();
    } else {
      map.current.once('load', waitForMapLoad);
    }
  }, [routeData]);

  // Handle map click outside markers
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
  }, []);

  // Update markers when trip stops change
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    tripStops.forEach(stop => {
      if (!stop.coordinates) return;
      
      const isSelected = selectedStops.some(s => s.id === stop.id);
      
      const marker = new mapboxgl.Marker({
        element: createStopMarker(stop.type, stop.safetyRating, isSelected),
      })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map.current!);
      
      const markerElement = marker.getElement();
      
      // Add click handler for marker
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (popupRef.current) {
          popupRef.current.remove();
        }
        
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 min-w-[200px]';
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'flex items-center gap-2 mb-2';
        
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
          case 'walmart':
            iconColor = 'bg-blue-600';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 10 5-6 5 6"/><path d="m18 10-5-6-5 6"/><path d="M12 10v6"/><path d="M2 14h12a2 2 0 0 1 2 2c0 1 .5 3 2 3a1 1 0 0 0 1-1"/></svg>';
            break;
          case 'propane':
            iconColor = 'bg-orange-500';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c0-2.76-1.11-5.24-2.88-7L12 3l2.88 2c-1.77 1.76-2.88 4.24-2.88 7z"/><path d="M12 12c0 2.76 1.11 5.24 2.88 7L12 21l-2.88-2c1.77-1.76 2.88-4.24 2.88-7z"/><path d="M20 12h-4"/><path d="M4 12h4"/></svg>';
            break;
          case 'repair':
            iconColor = 'bg-zinc-700';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
            break;
        }
        
        iconContainer.className = `w-6 h-6 rounded-full ${iconColor} flex items-center justify-center text-white`;
        iconContainer.innerHTML = iconSvg;
        titleContainer.appendChild(iconContainer);
        
        const title = document.createElement('h3');
        title.className = 'font-semibold text-base';
        title.textContent = stop.name;
        titleContainer.appendChild(title);
        
        popupContent.appendChild(titleContainer);
        
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'space-y-2 mb-3';
        
        const typeTag = document.createElement('div');
        typeTag.className = 'inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mb-2';
        typeTag.textContent = stop.type.charAt(0).toUpperCase() + stop.type.slice(1);
        detailsContainer.appendChild(typeTag);
        
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
        
        const addButtonContainer = document.createElement('div');
        addButtonContainer.className = 'flex justify-end mt-3';
        
        const alreadyAdded = selectedStops.some(s => s.id === stop.id);
        
        if (!alreadyAdded) {
          const addButton = document.createElement('button');
          addButton.className = 'px-2.5 py-1.5 bg-primary text-primary-foreground text-xs rounded-md flex items-center gap-1.5 font-medium hover:bg-primary/90 transition-colors';
          addButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add to Itinerary';
          
          addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onAddToItinerary(stop);
            popupRef.current?.remove();
            
            // Show toast notification
            toast({
              title: "Stop added",
              description: `Added ${stop.name} to your itinerary`,
            });
          });
          
          addButtonContainer.appendChild(addButton);
        } else {
          const addedText = document.createElement('span');
          addedText.className = 'text-xs text-green-600 font-medium flex items-center gap-1';
          addedText.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Added to itinerary';
          addButtonContainer.appendChild(addedText);
        }
        
        popupContent.appendChild(addButtonContainer);
        
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
        
        map.current?.flyTo({
          center: [stop.coordinates!.lng, stop.coordinates!.lat],
          zoom: 12,
          speed: 1.5
        });
      });
      
      // Add right-click (context menu) functionality
      markerElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        setSelectedStop(stop);
      });
      
      markersRef.current.push(marker);
    });
  }, [tripStops, selectedStops, onAddToItinerary, toast]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Function to add stop to itinerary
  const handleAddToItinerary = (stop: TripStop) => {
    if (!selectedStops.some(s => s.id === stop.id)) {
      onAddToItinerary(stop);
      
      toast({
        title: "Stop added",
        description: `Added ${stop.name} to your itinerary`,
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="relative h-full">
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
        
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-md shadow-md max-h-[50vh] overflow-y-auto">
          <h4 className="text-xs font-medium mb-2">Stop Types</h4>
          <div className="space-y-2 grid grid-cols-2 gap-x-4">
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
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Walmarts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Flame className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Propane</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center">
                <Wrench className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Repair Shops</span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      
      {/* Context menu that appears on right-click */}
      {selectedStop && (
        <ContextMenuContent className="w-48">
          <ContextMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleAddToItinerary(selectedStop)}
            disabled={selectedStops.some(s => s.id === selectedStop.id)}
          >
            <Plus className="h-4 w-4" />
            <span>Add to Itinerary</span>
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export default TripPlannerMap;
