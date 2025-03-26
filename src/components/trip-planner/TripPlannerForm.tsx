
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
import LocationAutocomplete from "./LocationAutocomplete";

interface TripPlannerFormProps {
  setRouteData: (data: RouteData | null) => void;
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mapboxToken?: string;
}

const TripPlannerForm = ({ 
  setRouteData, 
  setTripStops,
  isLoading,
  setIsLoading,
  mapboxToken
}: TripPlannerFormProps) => {
  const { toast } = useToast();
  const { location, getLocation } = useLocation();
  const [startLocation, setStartLocation] = useState("");
  const [startCoordinates, setStartCoordinates] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [endCoordinates, setEndCoordinates] = useState("");
  const [bufferDistance, setBufferDistance] = useState(20); // miles
  const [includeCampsites, setIncludeCampsites] = useState(true);
  const [includeGasStations, setIncludeGasStations] = useState(true);
  const [includeWaterStations, setIncludeWaterStations] = useState(true);
  const [includeDumpStations, setIncludeDumpStations] = useState(true);

  const handleUseCurrentLocation = async () => {
    try {
      const coords = await getLocation();
      if (coords) {
        const coordString = `${coords.longitude.toFixed(6)},${coords.latitude.toFixed(6)}`;
        setStartLocation("Current Location");
        setStartCoordinates(coordString);
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

  const handleStartLocationSelect = (location: { placeName: string; coordinates: string }) => {
    setStartLocation(location.placeName);
    setStartCoordinates(location.coordinates);
  };

  const handleEndLocationSelect = (location: { placeName: string; coordinates: string }) => {
    setEndLocation(location.placeName);
    setEndCoordinates(location.coordinates);
  };

  const handlePlanTrip = async () => {
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
      // Use coordinates if available, otherwise use the location name
      const start = startCoordinates || startLocation;
      const end = endCoordinates || endLocation;
      
      const result = await planTrip({
        startLocation: start,
        endLocation: end,
        bufferDistance,
        includeCampsites,
        includeGasStations,
        includeWaterStations,
        includeDumpStations,
        mapboxToken // Pass the token to the planTrip function
      });
      
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
          <LocationAutocomplete
            placeholder="Address, city, or coordinates"
            value={startLocation}
            onChange={setStartLocation}
            onLocationSelect={handleStartLocationSelect}
            icon={<MapPin className="h-4 w-4" />}
            onIconClick={handleUseCurrentLocation}
            mapboxToken={mapboxToken}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end">Destination</Label>
          <LocationAutocomplete
            placeholder="Address, city, or coordinates"
            value={endLocation}
            onChange={setEndLocation}
            onLocationSelect={handleEndLocationSelect}
            mapboxToken={mapboxToken}
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
              Water Refill Stations
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
      </div>
      
      <Button 
        onClick={handlePlanTrip} 
        className="w-full"
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
