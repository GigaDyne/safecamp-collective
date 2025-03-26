
import React from "react";
import TripPlannerForm from "@/components/trip-planner/TripPlannerForm";
import TripItinerary from "@/components/trip-planner/TripItinerary";
import TripPlannerMap from "@/components/trip-planner/TripPlannerMap";
import { TripStop, RouteData } from "@/lib/trip-planner/types";

interface TripPlannerContentProps {
  routeData: RouteData | null;
  setRouteData: (data: RouteData | null) => void;
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  selectedStops: TripStop[];
  setSelectedStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mapboxToken: string;
  showCrimeData: boolean;
  setShowCrimeData: (show: boolean) => void;
  onAddToItinerary: (stop: TripStop) => void;
  initialStartLocation?: string;
  initialDestination?: string;
  initialStartCoords?: { lat: number; lng: number };
  initialDestCoords?: { lat: number; lng: number };
}

const TripPlannerContent: React.FC<TripPlannerContentProps> = ({
  routeData,
  setRouteData,
  tripStops,
  setTripStops,
  selectedStops,
  setSelectedStops,
  isLoading,
  setIsLoading,
  mapboxToken,
  showCrimeData,
  setShowCrimeData,
  onAddToItinerary,
  initialStartLocation,
  initialDestination,
  initialStartCoords,
  initialDestCoords
}) => {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] overflow-hidden">
      <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col overflow-hidden">
        <TripPlannerForm 
          setRouteData={setRouteData} 
          setTripStops={setTripStops}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          mapboxToken={mapboxToken}
          showCrimeData={showCrimeData}
          onToggleCrimeData={setShowCrimeData}
          initialStartLocation={initialStartLocation}
          initialDestination={initialDestination}
          initialStartCoords={initialStartCoords}
          initialDestCoords={initialDestCoords}
        />
        <TripItinerary 
          tripStops={tripStops} 
          setTripStops={setTripStops} 
          routeData={routeData}
          selectedStops={selectedStops}
          onSelectedStopsChange={setSelectedStops}
        />
      </div>
      
      <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-muted/20">
        <TripPlannerMap 
          routeData={routeData} 
          tripStops={tripStops} 
          setTripStops={setTripStops}
          isLoading={isLoading}
          mapboxToken={mapboxToken}
          selectedStops={selectedStops}
          onAddToItinerary={onAddToItinerary}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

export default TripPlannerContent;
