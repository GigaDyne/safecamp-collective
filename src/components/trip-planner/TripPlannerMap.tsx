
import React, { useRef, useEffect, useState } from "react";
import { useGoogleMapInitializer } from "@/hooks/useGoogleMapInitializer";
import { useMapMarkers } from "@/components/trip-planner/hooks/useMapMarkers";
import { useMapRoute } from "@/components/trip-planner/hooks/useMapRoute";
import { TripStop, RouteData } from "@/lib/trip-planner/types";
import { Loader2 } from "lucide-react";
import CrimeDataToggle from "./map-components/CrimeDataToggle";
import { useCrimeLayer } from "./hooks/useCrimeLayer";

interface TripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
  showCrimeData: boolean;
  setShowCrimeData: (show: boolean) => void;
}

const TripPlannerMap: React.FC<TripPlannerMapProps> = ({
  routeData,
  tripStops,
  setTripStops,
  isLoading,
  selectedStops,
  onAddToItinerary,
  showCrimeData,
  setShowCrimeData
}) => {
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize Google Map
  const { mapContainer, map, isMapLoaded, error } = useGoogleMapInitializer({
    onMapReady: (googleMap) => {
      setMapInitialized(true);
    },
    options: {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of US
      zoom: 4,
      mapTypeId: 'roadmap'
    }
  });

  // Add markers for trip stops
  const { markers } = useMapMarkers({
    map,
    tripStops,
    selectedStops,
    mapInitialized,
    onStopClick: onAddToItinerary
  });

  // Add route to map
  const { routePolyline } = useMapRoute({
    map,
    routeData,
    mapInitialized
  });

  // Add crime data layer if enabled
  useCrimeLayer({
    map,
    showCrimeData,
    mapInitialized
  });

  const mapLoadingState = isLoading || !mapInitialized;

  return (
    <div className="h-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Map loading overlay */}
      {mapLoadingState && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Crime data toggle */}
      {!mapLoadingState && (
        <div className="absolute top-4 right-4 z-10">
          <CrimeDataToggle 
            enabled={showCrimeData} 
            onToggle={setShowCrimeData} 
          />
        </div>
      )}
    </div>
  );
};

export default TripPlannerMap;
