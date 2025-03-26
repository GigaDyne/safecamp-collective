
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TripStop, RouteData } from '@/lib/trip-planner/types';
import { useToast } from '@/hooks/use-toast';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import MapLegend from './map-components/MapLegend';
import MapLoadingState from './map-components/MapLoadingState';
import MapError from './map-components/MapError';
import MapDebugInfo from './map-components/MapDebugInfo';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapRoute } from './hooks/useMapRoute';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useMapPopup } from './hooks/useMapPopup';

interface TripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  mapboxToken?: string;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
  className?: string;
}

const TripPlannerMap = ({
  routeData,
  tripStops,
  isLoading,
  mapboxToken,
  selectedStops,
  onAddToItinerary,
  setTripStops,
  className = ''
}: TripPlannerMapProps) => {
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  
  // Initialize the map
  const {
    mapContainer,
    map,
    mapInitialized,
    error,
  } = useMapInitialization({ mapboxToken, routeData });

  // Handle route drawing
  useMapRoute({ 
    map, 
    routeData, 
    mapInitialized 
  });

  // Handle popups
  const {
    selectedStop,
    setSelectedStop,
    handleStopClick,
    handleStopContextMenu
  } = useMapPopup({
    map,
    selectedStops,
    onAddToItinerary
  });

  // Handle markers
  useMapMarkers({
    map,
    tripStops,
    selectedStops,
    onStopClick: handleStopClick,
    onStopContextMenu: handleStopContextMenu,
    mapInitialized
  });

  // Setup debug mode toggle
  useEffect(() => {
    const handleDoubleClick = () => {
      setShowDebug(prev => !prev);
    };
    
    document.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  // If there's an error, show the error component
  if (error) {
    return <MapError message={error} />;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className={`relative h-full w-full ${className}`}>
        <div 
          ref={mapContainer} 
          className="absolute inset-0" 
          style={{ height: '100%', width: '100%' }} 
          data-testid="map-container"
        />
        
        {isLoading && <MapLoadingState message="Planning your trip..." />}
        
        {!mapboxToken && (
          <MapLoadingState message="Please set your Mapbox token using the settings button in the top right corner." />
        )}
        
        {!isLoading && !error && tripStops.length === 0 && routeData && (
          <div className="absolute bottom-4 left-4 right-4 bg-card p-4 rounded-md shadow-md text-center">
            <p className="text-sm">No stops found within the search distance. Try increasing the search distance.</p>
          </div>
        )}
        
        {showDebug && (
          <MapDebugInfo 
            mapboxToken={mapboxToken}
            mapInitialized={mapInitialized}
            mapContainerRef={mapContainer}
            mapRef={map}
            error={error}
          />
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
