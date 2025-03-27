
import { useState } from "react";
import { MapPin, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/hooks/useLocation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { planTrip } from "@/lib/trip-planner/route-service";
import { RouteData, TripStop } from "@/lib/trip-planner/types";
import { Switch } from "@/components/ui/switch";
import AddressAutocompleteInput from "./AddressAutocompleteInput";

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
  const { toast } = useToast();
  const { location, getLocation } = useLocation();
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

  // For debugging - log the mapboxToken
  console.log("MapboxToken in TripPlannerForm:", mapboxToken);

  const handleUseCurrentLocation = async () => {
    try {
      const coords = await getLocation();
      if (coords) {
        setStartLocation("Current Location");
        setStartCoordinates([coords.longitude, coords.latitude]);
        toast({
          title: "Success",
          description: "Current location set as starting point",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to get your current location",
        variant: "destructive",
      });
    }
  };

  const handleStartLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setStartLocation(location.name);
    setStartCoordinates([location.lng, location.lat]);
  };

  const handleEndLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setEndLocation(location.name);
    setEndCoordinates([location.lng, location.lat]);
  };

  const handlePlanTrip = async () => {
    console.log("Plan Trip clicked with params:", { 
      startLocation, 
      endLocation, 
      startCoordinates, 
      endCoordinates,
      bufferDistance
    });
    
    if ((!startLocation && !startCoordinates) || (!endLocation && !endCoordinates)) {
      toast({
        title: "Missing information",
        description: "Please enter both start and end locations",
        variant: "destructive",
      });
      return;
    }

    if (!mapboxToken) {
      toast({
        title: "Missing Mapbox token",
        description: "Please set your Mapbox token in settings",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let start = "";
      if (startCoordinates) {
        start = startCoordinates.join(",");
      } else {
        start = startLocation;
      }
      
      let end = "";
      if (endCoordinates) {
        end = endCoordinates.join(",");
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
        mapboxToken
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

  return (
    <div className="p-4 border-b space-y-4 overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">Plan Your Route</h2>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="start">Starting Point</Label>
          <div className="flex">
            <AddressAutocompleteInput
              placeholder="Starting Point"
              mapboxToken={mapboxToken || ""}
              onSelect={handleStartLocationSelect}
              className="flex-1"
              initialValue={initialStartLocation}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleUseCurrentLocation}
              className="ml-2"
              type="button"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end">Destination</Label>
          <AddressAutocompleteInput
            placeholder="Destination"
            mapboxToken={mapboxToken || ""}
            onSelect={handleEndLocationSelect}
            className="w-full"
            initialValue={initialDestination}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="buffer-distance">Search Distance: {bufferDistance} miles</Label>
          </div>
          <Slider 
            id="buffer-distance"
            min={5} 
            max={50} 
            step={5}
            value={[bufferDistance]}
            onValueChange={(value) => setBufferDistance(value[0])}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Include:</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-campsites" className="flex items-center gap-2">
                Campsites
              </Label>
              <Switch 
                id="include-campsites" 
                checked={includeCampsites}
                onCheckedChange={setIncludeCampsites}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-gas" className="flex items-center gap-2">
                Gas Stations
              </Label>
              <Switch 
                id="include-gas" 
                checked={includeGasStations}
                onCheckedChange={setIncludeGasStations}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-water" className="flex items-center gap-2">
                Water Stations
              </Label>
              <Switch 
                id="include-water" 
                checked={includeWaterStations}
                onCheckedChange={setIncludeWaterStations}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-dump" className="flex items-center gap-2">
                Dump Stations
              </Label>
              <Switch 
                id="include-dump" 
                checked={includeDumpStations}
                onCheckedChange={setIncludeDumpStations}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-walmart" className="flex items-center gap-2">
                Walmarts
              </Label>
              <Switch 
                id="include-walmart" 
                checked={includeWalmarts}
                onCheckedChange={setIncludeWalmarts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-propane" className="flex items-center gap-2">
                Propane Stations
              </Label>
              <Switch 
                id="include-propane" 
                checked={includePropaneStations}
                onCheckedChange={setIncludePropaneStations}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-repair" className="flex items-center gap-2">
                Repair Shops
              </Label>
              <Switch 
                id="include-repair" 
                checked={includeRepairShops}
                onCheckedChange={setIncludeRepairShops}
              />
            </div>
            
            {onToggleCrimeData && (
              <div className="flex items-center justify-between">
                <Label htmlFor="include-crime-data" className="flex items-center gap-2">
                  <span>Crime Data</span>
                  <span className="text-xs text-muted-foreground">(beta)</span>
                </Label>
                <Switch 
                  id="include-crime-data" 
                  checked={showCrimeData}
                  onCheckedChange={onToggleCrimeData}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handlePlanTrip} 
        className="w-full mt-6 font-medium bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        disabled={isLoading || (!startLocation && !startCoordinates) || (!endLocation && !endCoordinates) || !mapboxToken}
      >
        {isLoading ? (
          <>
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            Planning...
          </>
        ) : (
          "Plan Trip"
        )}
      </Button>
      
      {!mapboxToken && (
        <p className="text-sm text-destructive text-center mt-2">
          Please set your Mapbox token in settings to use the trip planner
        </p>
      )}
    </div>
  );
};

export default TripPlannerForm;
