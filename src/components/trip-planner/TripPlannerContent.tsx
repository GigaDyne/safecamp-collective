
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripPlannerForm from "./TripPlannerForm";
import TripPlannerMap from "./TripPlannerMap";
import TripItinerary from "./TripItinerary";
import { RouteData, TripStop } from "@/lib/trip-planner/types";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

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
  initialStartCoords?: {lat: number; lng: number};
  initialDestCoords?: {lat: number; lng: number};
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
  const [activeTab, setActiveTab] = useState("plan");
  
  // Auto-switch to map tab when route is loaded
  useEffect(() => {
    if (routeData && tripStops.length > 0) {
      setActiveTab("map");
    }
  }, [routeData, tripStops]);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 bg-gray-50/50 dark:bg-gray-950/50 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-4">
          <TabsTrigger value="plan">Plan Route</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="itinerary" disabled={selectedStops.length === 0}>
            Itinerary {selectedStops.length > 0 && `(${selectedStops.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="plan" className="flex-1 flex flex-col">
          <Card className="p-4 flex-1">
            <TripPlannerForm
              setRouteData={setRouteData}
              setTripStops={setTripStops}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              initialStartLocation={initialStartLocation}
              initialDestination={initialDestination}
              initialStartCoords={initialStartCoords}
              initialDestCoords={initialDestCoords}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="map" className="flex-1 flex flex-col">
          <Card className="p-0 sm:p-0 overflow-hidden flex-1">
            <GoogleMapsProvider>
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
            </GoogleMapsProvider>
          </Card>
        </TabsContent>
        
        <TabsContent value="itinerary" className="flex-1 flex flex-col">
          <Card className="p-4 flex-1">
            <TripItinerary
              selectedStops={selectedStops}
              setSelectedStops={setSelectedStops}
              routeData={routeData}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TripPlannerContent;
