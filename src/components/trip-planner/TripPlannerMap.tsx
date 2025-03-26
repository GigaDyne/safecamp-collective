import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { Plus } from 'lucide-react';
import { TripStop, RouteData } from '@/lib/trip-planner/types';
import { useToast } from '@/hooks/use-toast';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { createStopMarker } from './map-utils/createStopMarker';
import MapLegend from './map-components/MapLegend';
import MapLoadingState from './map-components/MapLoadingState';
import MapError from './map-components/MapError';
import { useMapInitialization } from './hooks/useMapInitialization';

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
  isLoading,
  mapboxToken,
  selectedStops,
  onAddToItinerary
}: TripPlannerMapProps) => {
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();
  
  const {
    mapContainer,
    map,
    mapInitialized,
    error,
    routeSourceAdded
  } = useMapInitialization({ mapboxToken, routeData });

  // Effect for route drawing
  useEffect(() => {
    if (!map.current || !routeData || !mapInitialized) return;
    console.log("Attempting to draw route");

    try {
      if (!map.current.loaded()) {
        console.log("Map not loaded yet, waiting...");
        map.current.once('load', () => drawRoute());
        return;
      }
      
      drawRoute();
    } catch (error) {
      console.error("Error in route drawing effect:", error);
    }
    
    function drawRoute() {
      if (!map.current || !routeData) return;
      
      try {
        if (!routeSourceAdded.current) {
          console.log("Adding route source for the first time");
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
          console.log("Updating existing route");
          // Updating existing route - check source exists before updating
          const source = map.current.getSource('route');
          if (source && 'setData' in source) {
            source.setData({
              type: 'Feature',
              geometry: routeData.geometry
            });
          } else {
            console.log("Route source not available or doesn't have setData method. Recreating source.");
            
            // If the source doesn't exist, create it again
            if (map.current.getLayer('route-line')) {
              map.current.removeLayer('route-line');
            }
            
            if (map.current.getSource('route')) {
              map.current.removeSource('route');
            }
            
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
            
            routeSourceAdded.current = true;
          }
        }
      } catch (error) {
        console.error("Error updating route source:", error);
      }

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
        console.error("Error setting map bounds:", error);
      }
    }
  }, [routeData, mapInitialized]);

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
    return <MapError message={error} />;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="relative h-full w-full">
        <div ref={mapContainer} className="absolute inset-0" style={{ height: '100%', width: '100%' }} />
        
        {isLoading && <MapLoadingState />}
        
        {!mapboxToken && (
          <MapLoadingState message="Please set your Mapbox token using the settings button in the top right corner." />
        )}
        
        {!isLoading && !error && tripStops.length === 0 && routeData && (
          <div className="absolute bottom-4 left-4 right-4 bg-card p-4 rounded-md shadow-md text-center">
            <p className="text-sm">No stops found within the search distance. Try increasing the search distance.</p>
          </div>
        )}
        
        <MapLegend />
      </ContextMenuTrigger>
      
      {selectedStop && (
        <ContextMenuContent className="w-48">
          <ContextMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (selectedStop) {
                onAddToItinerary(selectedStop);
                toast({
                  title: "Stop added",
                  description: `Added ${selectedStop.name} to your itinerary`,
                });
              }
            }}
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
