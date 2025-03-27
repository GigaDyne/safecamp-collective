
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
  showCrimeData,
  setShowCrimeData,
  onAddToItinerary,
  initialStartLocation,
  initialDestination,
  initialStartCoords,
  initialDestCoords
}) => {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      <div className="w-full md:w-[350px] overflow-y-auto border-r">
        <TripPlannerForm 
          setRouteData={setRouteData} 
          setTripStops={setTripStops}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
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
      
      <div className="flex-1 relative overflow-hidden">
        <TripPlannerMap 
          routeData={routeData} 
          tripStops={tripStops} 
          setTripStops={setTripStops}
          isLoading={isLoading}
          selectedStops={selectedStops}
          onAddToItinerary={onAddToItinerary}
          showCrimeData={showCrimeData}
          setShowCrimeData={setShowCrimeData}
        />
      </div>
    </div>
  );
};

export default TripPlannerContent;
