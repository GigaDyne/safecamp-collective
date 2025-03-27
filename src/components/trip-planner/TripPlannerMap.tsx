
import React, { useState, useRef, useEffect } from 'react';
import { TripStop, RouteData } from '@/lib/trip-planner/types';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';
import { useTripPlannerMap } from './hooks/useTripPlannerMap';
import MapContextMenu from './map-components/MapContextMenu';
import CrimeDataDialog from './map-components/CrimeDataDialog';
import MapLegend from './map-components/MapLegend';
import MapLoadingState from './map-components/MapLoadingState';
import MapError from './map-components/MapError';
import MapDebugInfo from './map-components/MapDebugInfo';
import CrimeDataToggle from './map-components/CrimeDataToggle';
import { MapProvider } from "@/contexts/MapContext";
import MapControls from '../map/MapControls';

interface TripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  mapboxToken?: string;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
  className?: string;
  showCrimeData?: boolean;
  setShowCrimeData?: (show: boolean) => void;
}

const TripPlannerMap = ({
  routeData,
  tripStops,
  isLoading,
  mapboxToken,
  selectedStops,
  onAddToItinerary,
  setTripStops,
  className = '',
  showCrimeData = false,
  setShowCrimeData
}: TripPlannerMapProps) => {
  const [showDebug, setShowDebug] = useState(false);
  const [selectedCrimeData, setSelectedCrimeData] = useState<CountyCrimeData | null>(null);
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Use our custom hook for map functionality
  const {
    mapContainer,
    mapsLoaded,
    error,
    map
  } = useTripPlannerMap({
    routeData,
    tripStops,
    isLoading,
    selectedStops,
    onSelectedStopChange: setSelectedStop
  });

  // Sync the map reference and set initialized state
  useEffect(() => {
    if (map.current) {
      mapRef.current = map.current;
      setMapInitialized(true);
    }
  }, [map.current]);
  
  // Handle context menu selection
  const handleStopContextMenu = (stop: TripStop) => {
    setSelectedStop(stop);
  };

  // Set up debug mode on double click
  useEffect(() => {
    const handleDoubleClick = () => {
      setShowDebug(prev => !prev);
    };
    
    document.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  if (error) {
    return <MapError message={error} />;
  }

  return (
    <MapContextMenu 
      selectedStop={selectedStop}
      selectedStops={selectedStops}
      onAddToItinerary={onAddToItinerary}
    >
      <div className="relative w-full h-full">
        <div 
          ref={mapContainer} 
          className="absolute inset-0 w-full h-full" 
          style={{ minHeight: '500px' }} 
          data-testid="map-container"
        />
        
        {/* Add Crime Data Toggle with improved visibility */}
        {setShowCrimeData && (
          <CrimeDataToggle
            enabled={showCrimeData}
            onToggle={setShowCrimeData}
            className="top-4 right-4"
          />
        )}
        
        {/* Properly wrap MapControls with MapProvider */}
        {mapInitialized && (
          <MapProvider value={{ map: mapRef.current }}>
            <MapControls />
          </MapProvider>
        )}
        
        {/* Improved loading state */}
        {isLoading && <MapLoadingState message="Planning your trip..." />}
        
        {!mapsLoaded && (
          <MapLoadingState message="Loading Google Maps..." />
        )}
        
        {!isLoading && !error && tripStops.length === 0 && routeData && (
          <div className="absolute bottom-4 left-4 right-4 bg-background p-4 rounded-md shadow-lg border border-border text-center">
            <p className="text-sm">No stops found within the search distance. Try increasing the search distance.</p>
          </div>
        )}
        
        {showDebug && (
          <MapDebugInfo 
            mapboxToken={mapboxToken}
            mapInitialized={mapInitialized}
            mapContainerRef={mapContainer}
            mapRef={mapRef}
            error={error}
          />
        )}
        
        <MapLegend showCrimeData={showCrimeData} />

        <CrimeDataDialog 
          selectedCrimeData={selectedCrimeData}
          setSelectedCrimeData={setSelectedCrimeData}
        />
      </div>
    </MapContextMenu>
  );
};

export default TripPlannerMap;
