
import React, { useEffect, useState } from 'react';
import { TripStop } from '@/lib/trip-planner/types';
import { useNavigationMap } from './hooks/useNavigationMap';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';
import CrimeDataTooltip from './map-components/CrimeDataTooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext';
import { MapProvider } from '@/contexts/MapContext';
import MapControls from '../map/MapControls';
import CrimeDataToggle from './map-components/CrimeDataToggle';
import MapLoadingState from './map-components/MapLoadingState';

interface TripNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
}

const TripNavigationMap = ({ tripStops, currentStopIndex, userLocation }: TripNavigationMapProps) => {
  const [showCrimeData, setShowCrimeData] = useState<boolean>(false);
  const [selectedCrimeData, setSelectedCrimeData] = useState<CountyCrimeData | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
  // Initialize navigation map using Google Maps
  const { mapContainer, loading, map } = useNavigationMap({
    tripStops,
    currentStopIndex,
    userLocation,
    showCrimeData
  });

  // Update mapLoaded state when map is ready
  useEffect(() => {
    if (map.current) {
      setMapLoaded(true);
    }
  }, [map.current]);

  // Check for URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crimeParam = params.get('showCrime');
    
    if (crimeParam === 'true') {
      setShowCrimeData(true);
    }
  }, []);

  return (
    <GoogleMapsProvider>
      <div className="relative h-full w-full">
        <div ref={mapContainer} className="h-full w-full" />
        
        {/* Crime data toggle button with improved styling */}
        <CrimeDataToggle 
          enabled={showCrimeData} 
          onToggle={setShowCrimeData} 
          className="top-4 right-4"
        />

        {/* Properly wrap MapControls with MapProvider */}
        {mapLoaded && (
          <MapProvider value={{ map: map.current }}>
            <MapControls />
          </MapProvider>
        )}

        {/* Show loading state when map is loading */}
        {loading && <MapLoadingState message="Loading navigation map..." />}

        {/* Crime data detail dialog */}
        <Dialog open={!!selectedCrimeData} onOpenChange={(open) => !open && setSelectedCrimeData(null)}>
          <DialogContent className="sm:max-w-md bg-background shadow-xl">
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
      </div>
    </GoogleMapsProvider>
  );
};

export default TripNavigationMap;
