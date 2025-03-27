
import { useToast } from "@/hooks/use-toast";
import { RouteData, TripStop } from "@/lib/trip-planner/types";
import TripLocationInputs from "./form/TripLocationInputs";
import TripDistanceSlider from "./form/TripDistanceSlider";
import TripFilterOptions from "./form/TripFilterOptions";
import TripPlanButton from "./form/TripPlanButton";
import { useTripForm } from "./form/useTripForm";

interface TripPlannerFormProps {
  setRouteData: (data: RouteData | null) => void;
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mapboxToken?: string;
  showCrimeData?: boolean;
  onToggleCrimeData?: (enabled: boolean) => void;
  initialStartLocation?: string;
  initialDestination?: string;
  initialStartCoords?: { lat: number; lng: number };
  initialDestCoords?: { lat: number; lng: number };
}

const TripPlannerForm = ({ 
  setRouteData, 
  setTripStops,
  isLoading,
  setIsLoading,
  mapboxToken,
  showCrimeData = false,
  onToggleCrimeData,
  initialStartLocation,
  initialDestination,
  initialStartCoords,
  initialDestCoords
}: TripPlannerFormProps) => {
  // Debug logging
  console.log("MapboxToken in TripPlannerForm:", mapboxToken);
  
  const {
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
  } = useTripForm({
    setRouteData,
    setTripStops,
    setIsLoading,
    mapboxToken,
    initialStartLocation,
    initialDestination,
    initialStartCoords,
    initialDestCoords
  });

  console.log("Form validity state:", { 
    isFormValid, 
    startLocation, 
    hasStartCoords: Boolean(startCoordinates || initialStartCoords), 
    endLocation, 
    hasEndCoords: Boolean(endCoordinates || initialDestCoords)
  });

  return (
    <div className="p-4 border-b space-y-4 overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">Plan Your Route</h2>
      
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
      
      <div className="space-y-3">
        <TripDistanceSlider 
          bufferDistance={bufferDistance} 
          setBufferDistance={setBufferDistance} 
        />
      </div>
      
      <TripFilterOptions
        includeCampsites={includeCampsites}
        setIncludeCampsites={setIncludeCampsites}
        includeGasStations={includeGasStations}
        setIncludeGasStations={setIncludeGasStations}
        includeWaterStations={includeWaterStations}
        setIncludeWaterStations={setIncludeWaterStations}
        includeDumpStations={includeDumpStations}
        setIncludeDumpStations={setIncludeDumpStations}
        includeWalmarts={includeWalmarts}
        setIncludeWalmarts={setIncludeWalmarts}
        includePropaneStations={includePropaneStations}
        setIncludePropaneStations={setIncludePropaneStations}
        includeRepairShops={includeRepairShops}
        setIncludeRepairShops={setIncludeRepairShops}
        showCrimeData={showCrimeData}
        onToggleCrimeData={onToggleCrimeData}
      />
      
      <TripPlanButton
        isLoading={isLoading}
        isFormValid={isFormValid}
        onPlanTrip={handlePlanTrip}
        mapboxToken={mapboxToken}
      />
    </div>
  );
};

export default TripPlannerForm;
