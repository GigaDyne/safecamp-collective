
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
import { useCrimeData } from './hooks/useCrimeData';
import { useCrimeLayer } from './hooks/useCrimeLayer';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';
import CrimeDataTooltip from './map-components/CrimeDataTooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const [showCrimeData, setShowCrimeData] = useState(false);
  const [selectedCrimeData, setSelectedCrimeData] = useState<CountyCrimeData | null>(null);
  
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

  // Handle crime data
  const { crimeData, isLoading: isCrimeDataLoading } = useCrimeData({
    map,
    enabled: showCrimeData
  });

  // Handle crime data layer
  useCrimeLayer({
    map,
    crimeData,
    enabled: showCrimeData,
    onMarkerClick: (data) => {
      setSelectedCrimeData(data);
    }
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
          className="absolute inset-0 h-[500px] md:h-full w-full" 
          style={{ minHeight: '500px' }} 
          data-testid="map-container"
        />
        
        {isCrimeDataLoading && showCrimeData && (
          <div className="absolute top-4 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border">
            Loading crime data...
          </div>
        )}
        
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
        
        <MapLegend showCrimeData={showCrimeData} />
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

      {/* Crime data detail dialog */}
      <Dialog open={!!selectedCrimeData} onOpenChange={(open) => !open && setSelectedCrimeData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crime Statistics</DialogTitle>
            <DialogDescription>
              {selectedCrimeData?.county_name}, {selectedCrimeData?.state_abbr}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCrimeData && (
            <div className="py-4">
              <CrimeDataTooltip data={selectedCrimeData} />
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setSelectedCrimeData(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  );
};

export default TripPlannerMap;
