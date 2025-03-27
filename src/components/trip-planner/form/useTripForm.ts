
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { planTrip } from "@/lib/trip-planner/route-service";
import { RouteData, TripStop } from "@/lib/trip-planner/types";

interface UseTripFormProps {
  setRouteData: (data: RouteData | null) => void;
  setTripStops: (stops: TripStop[]) => void;
  setIsLoading: (loading: boolean) => void;
  mapboxToken?: string;
  initialStartLocation?: string;
  initialDestination?: string;
  initialStartCoords?: { lat: number; lng: number };
  initialDestCoords?: { lat: number; lng: number };
}

export function useTripForm({
  setRouteData,
  setTripStops,
  setIsLoading,
  mapboxToken,
  initialStartLocation,
  initialDestination,
  initialStartCoords,
  initialDestCoords
}: UseTripFormProps) {
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState(initialStartLocation || "");
  const [startCoordinates, setStartCoordinates] = useState<[number, number] | null>(
    initialStartCoords ? [initialStartCoords.lng, initialStartCoords.lat] : null
  );
  const [endLocation, setEndLocation] = useState(initialDestination || "");
  const [endCoordinates, setEndCoordinates] = useState<[number, number] | null>(
    initialDestCoords ? [initialDestCoords.lng, initialDestCoords.lat] : null
  );
  const [bufferDistance, setBufferDistance] = useState(20); // miles
  const [includeCampsites, setIncludeCampsites] = useState(true);
  const [includeGasStations, setIncludeGasStations] = useState(true);
  const [includeWaterStations, setIncludeWaterStations] = useState(true);
  const [includeDumpStations, setIncludeDumpStations] = useState(true);
  const [includeWalmarts, setIncludeWalmarts] = useState(true);
  const [includePropaneStations, setIncludePropaneStations] = useState(true);
  const [includeRepairShops, setIncludeRepairShops] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever relevant fields change
  useEffect(() => {
    const hasStartingPoint = Boolean(startLocation.trim() && (startCoordinates || initialStartCoords));
    const hasDestination = Boolean(endLocation.trim() && (endCoordinates || initialDestCoords));
    setIsFormValid(hasStartingPoint && hasDestination && Boolean(mapboxToken));
  }, [startLocation, startCoordinates, endLocation, endCoordinates, mapboxToken, initialStartCoords, initialDestCoords]);

  const handlePlanTrip = async () => {
    console.log("Plan Trip clicked with params:", { 
      startLocation, 
      endLocation, 
      startCoordinates, 
      endCoordinates,
      bufferDistance,
      isFormValid
    });
    
    if (!isFormValid) {
      toast({
        title: "Missing information",
        description: "Please enter both start and end locations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let start = "";
      if (startCoordinates) {
        start = startCoordinates.join(",");
      } else if (initialStartCoords) {
        start = `${initialStartCoords.lng},${initialStartCoords.lat}`;
      } else {
        start = startLocation;
      }
      
      let end = "";
      if (endCoordinates) {
        end = endCoordinates.join(",");
      } else if (initialDestCoords) {
        end = `${initialDestCoords.lng},${initialDestCoords.lat}`;
      } else {
        end = endLocation;
      }

      console.log("Calling planTrip with:", { start, end, bufferDistance });

      const result = await planTrip({
        startLocation: start,
        endLocation: end,
        bufferDistance,
        includeCampsites,
        includeGasStations,
        includeWaterStations,
        includeDumpStations,
        includeWalmarts,
        includePropaneStations,
        includeRepairShops,
        mapboxToken: mapboxToken || ""
      });
      
      console.log("Trip planning result:", result);
      
      setRouteData(result.routeData);
      setTripStops(result.availableStops);
      
      toast({
        title: "Trip planned!",
        description: `Found route with ${result.availableStops.length} possible stops`,
      });
    } catch (error) {
      console.error("Error planning trip:", error);
      toast({
        title: "Error",
        description: "Failed to plan trip. Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startLocation,
    setStartLocation,
    startCoordinates,
    setStartCoordinates,
    endLocation,
    setEndLocation,
    endCoordinates,
    setEndCoordinates,
    bufferDistance,
    setBufferDistance,
    includeCampsites,
    setIncludeCampsites,
    includeGasStations,
    setIncludeGasStations,
    includeWaterStations,
    setIncludeWaterStations,
    includeDumpStations,
    setIncludeDumpStations,
    includeWalmarts,
    setIncludeWalmarts,
    includePropaneStations,
    setIncludePropaneStations,
    includeRepairShops,
    setIncludeRepairShops,
    isFormValid,
    handlePlanTrip
  };
}
