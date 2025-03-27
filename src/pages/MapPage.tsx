
import React, { useState, useEffect } from "react";
import MapView from "@/components/map/MapView";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Map, Layers } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MapPage = () => {
  const [showCrimeData, setShowCrimeData] = useState(false);
  
  // Force Austin center when the map component loads
  useEffect(() => {
    const centerMap = () => {
      try {
        // Find the map instance
        const mapInstance = document.querySelector('.mapboxgl-map');
        if (mapInstance && (window as any).mapboxgl) {
          const map = (window as any).mapboxgl.getMapInstance(mapInstance);
          if (map) {
            // Center on Austin
            map.setCenter([-97.7431, 30.2672]);
            map.setZoom(10);
          }
        }
      } catch (error) {
        console.error("Error centering map:", error);
      }
    };
    
    // Try to center immediately and also after a delay to ensure the map is loaded
    centerMap();
    const timeoutId = setTimeout(centerMap, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden relative">
      <MapView showCrimeData={showCrimeData} />
      
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCrimeData ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1 ${showCrimeData ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={() => setShowCrimeData(!showCrimeData)}
              >
                {showCrimeData ? (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span className="hidden sm:inline">Hide Crime Data</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Show Crime Data</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle crime data overlay</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.location.href = "/trip-planner?showCrime=" + showCrimeData}
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Trip Planner</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Plan a new trip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MapPage;
