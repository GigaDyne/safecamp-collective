
import React, { useEffect, useState } from 'react';
import { TripStop } from '@/lib/trip-planner/types';
import { useNavigationMap } from './hooks/useNavigationMap';
import { useCrimeData } from './hooks/useCrimeData';
import { useCrimeLayer } from './hooks/useCrimeLayer';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';
import CrimeDataTooltip from './map-components/CrimeDataTooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TripNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
}

const TripNavigationMap = ({ tripStops, currentStopIndex, userLocation }: TripNavigationMapProps) => {
  const [showCrimeData, setShowCrimeData] = useState<boolean>(false);
  const [selectedCrimeData, setSelectedCrimeData] = useState<CountyCrimeData | null>(null);
  
  // Initialize navigation map
  const { mapContainer, loading, map } = useNavigationMap({
    tripStops,
    currentStopIndex,
    userLocation,
    showCrimeData
  });

  // Fetch crime data if enabled
  const { crimeData, isLoading: isCrimeDataLoading, isMockData } = useCrimeData({
    map,
    enabled: showCrimeData
  });

  // Add crime data layer to map
  useCrimeLayer({
    map,
    crimeData,
    enabled: showCrimeData,
    onMarkerClick: (data) => {
      setSelectedCrimeData(data);
    }
  });

  // Check for URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crimeParam = params.get('showCrime');
    
    if (crimeParam === 'true') {
      setShowCrimeData(true);
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Crime data toggle button */}
      <div className="absolute top-4 right-4 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCrimeData ? "default" : "outline"}
                size="sm"
                className={`${showCrimeData ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={() => setShowCrimeData(!showCrimeData)}
              >
                {showCrimeData ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showCrimeData ? 'Hide' : 'Show'} crime data overlay</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Loading indicator for crime data */}
      {isCrimeDataLoading && showCrimeData && (
        <div className="absolute top-14 right-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-10">
          Loading crime data...
        </div>
      )}

      {/* Crime data detail dialog */}
      <Dialog open={!!selectedCrimeData} onOpenChange={(open) => !open && setSelectedCrimeData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crime Statistics</DialogTitle>
            <DialogDescription>
              {selectedCrimeData?.county_name}, {selectedCrimeData?.state_abbr}
              {isMockData && (
                <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-600 text-xs">
                  MOCK DATA
                </Badge>
              )}
              {!isMockData && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-600 text-xs">
                  REAL DATA
                </Badge>
              )}
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
  );
};

export default TripNavigationMap;
