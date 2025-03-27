
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { planTrip } from "@/lib/trip-planner/route-service";
import { useToast } from "@/hooks/use-toast";
import { RouteData, TripStop } from "@/lib/trip-planner/types";
import TripDistanceSlider from "./form/TripDistanceSlider";
import TripFilterOptions from "./form/TripFilterOptions";
import TripLocationInputs from "./form/TripLocationInputs";

interface TripPlannerFormProps {
  setRouteData: (data: RouteData | null) => void;
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showCrimeData: boolean;
  onToggleCrimeData: (show: boolean) => void;
  initialStartLocation?: string;
  initialDestination?: string;
  initialStartCoords?: { lat: number; lng: number };
  initialDestCoords?: { lat: number; lng: number };
}

const TripPlannerForm: React.FC<TripPlannerFormProps> = ({
  setRouteData,
  setTripStops,
  isLoading,
  setIsLoading,
  showCrimeData,
  onToggleCrimeData,
  initialStartLocation,
  initialDestination,
  initialStartCoords,
  initialDestCoords
}) => {
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState(initialStartLocation || "");
  const [endLocation, setEndLocation] = useState(initialDestination || "");
  const [startCoordinates, setStartCoordinates] = useState<[number, number] | null>(
    initialStartCoords ? [initialStartCoords.lng, initialStartCoords.lat] : null
  );
  const [endCoordinates, setEndCoordinates] = useState<[number, number] | null>(
    initialDestCoords ? [initialDestCoords.lng, initialDestCoords.lat] : null
  );
  const [bufferDistance, setBufferDistance] = useState(50);
  const [filterOptions, setFilterOptions] = useState({
    includeCampsites: true,
    includeGasStations: true,
    includeWaterStations: true,
    includeDumpStations: true,
    includeWalmarts: true,
    includePropaneStations: true,
    includeRepairShops: true
  });
  
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      start: initialStartLocation || "",
      destination: initialDestination || "",
    },
  });

  // Get the Mapbox token from environment variables
  const mapboxToken = "pk.eyJ1Ijoic2FmZWNhbXAiLCJhIjoiY2x1Z2s5MnV0MHZ5aDJsbnJmcTcyemM3YyJ9.1QlVj6YGZ1Y6YEx9LZg-mQ";
  
  const onSubmit = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: "Missing locations",
        description: "Please enter both start and destination locations.",
        variant: "destructive",
      });
      return;
    }

    if (!startCoordinates || !endCoordinates) {
      toast({
        title: "Missing coordinates",
        description: "Please select locations from the dropdown suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRouteData(null);
    setTripStops([]);

    try {
      console.log("Planning trip with:", {
        startLocation, 
        endLocation,
        startCoordinates, 
        endCoordinates,
        bufferDistance,
        filterOptions
      });
      
      // Call the planTrip function with our parameters
      const tripPlanResult = await planTrip({
        mapboxToken,
        startLocation,
        endLocation,
        bufferDistance,
        ...filterOptions
      });
      
      if (!tripPlanResult.routeData) {
        toast({
          title: "Route not found",
          description: "Could not find a route between the specified locations.",
          variant: "destructive",
        });
        return;
      }

      setRouteData(tripPlanResult.routeData);
      setTripStops(tripPlanResult.availableStops || []);

      toast({
        title: "Route loaded",
        description: `Planning route from ${startLocation} to ${endLocation}`,
      });
    } catch (error) {
      console.error("Error planning trip:", error);
      toast({
        title: "Error",
        description: "Failed to plan trip",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle>Plan Your Trip</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <TripLocationInputs
            mapboxToken={mapboxToken}
            startLocation={startLocation}
            setStartLocation={setStartLocation}
            startCoordinates={startCoordinates}
            setStartCoordinates={setStartCoordinates}
            endLocation={endLocation}
            setEndLocation={setEndLocation}
            endCoordinates={endCoordinates}
            setEndCoordinates={setEndCoordinates}
            isLoading={isLoading}
            initialStartLocation={initialStartLocation}
            initialDestination={initialDestination}
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Planning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Plan Trip
              </>
            )}
          </Button>
        </form>

        <div className="py-2">
          <Label className="pb-2 block">
            Additional Options
          </Label>
          
          <TripDistanceSlider 
            bufferDistance={bufferDistance}
            setBufferDistance={setBufferDistance}
          />
          
          <TripFilterOptions 
            includeCampsites={filterOptions.includeCampsites}
            setIncludeCampsites={(value) => setFilterOptions(prev => ({ ...prev, includeCampsites: value }))}
            includeGasStations={filterOptions.includeGasStations}
            setIncludeGasStations={(value) => setFilterOptions(prev => ({ ...prev, includeGasStations: value }))}
            includeWaterStations={filterOptions.includeWaterStations}
            setIncludeWaterStations={(value) => setFilterOptions(prev => ({ ...prev, includeWaterStations: value }))}
            includeDumpStations={filterOptions.includeDumpStations}
            setIncludeDumpStations={(value) => setFilterOptions(prev => ({ ...prev, includeDumpStations: value }))}
            includeWalmarts={filterOptions.includeWalmarts}
            setIncludeWalmarts={(value) => setFilterOptions(prev => ({ ...prev, includeWalmarts: value }))}
            includePropaneStations={filterOptions.includePropaneStations}
            setIncludePropaneStations={(value) => setFilterOptions(prev => ({ ...prev, includePropaneStations: value }))}
            includeRepairShops={filterOptions.includeRepairShops}
            setIncludeRepairShops={(value) => setFilterOptions(prev => ({ ...prev, includeRepairShops: value }))}
            showCrimeData={showCrimeData}
            onToggleCrimeData={onToggleCrimeData}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TripPlannerForm;
