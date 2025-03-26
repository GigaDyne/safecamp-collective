
import { useState } from "react";
import { MapPin, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/hooks/useLocation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { planTrip } from "@/lib/trip-planner/route-service";
import { RouteData, TripStop } from "@/lib/trip-planner/types";
import { Switch } from "@/components/ui/switch";

interface TripPlannerFormProps {
  setRouteData: (data: RouteData | null) => void;
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TripPlannerForm = ({ 
  setRouteData, 
  setTripStops,
  isLoading,
  setIsLoading
}: TripPlannerFormProps) => {
  const { toast } = useToast();
  const { location, getLocation } = useLocation();
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [bufferDistance, setBufferDistance] = useState(20); // miles
  const [includeCampsites, setIncludeCampsites] = useState(true);
  const [includeGasStations, setIncludeGasStations] = useState(true);
  const [includeWaterStations, setIncludeWaterStations] = useState(true);
  const [includeDumpStations, setIncludeDumpStations] = useState(true);

  const handleUseCurrentLocation = async () => {
    try {
      const coords = await getLocation();
      if (coords) {
        setStartLocation(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`);
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

  const handlePlanTrip = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: "Missing information",
        description: "Please enter both start and end locations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await planTrip({
        startLocation,
        endLocation,
        bufferDistance,
        includeCampsites,
        includeGasStations,
        includeWaterStations,
        includeDumpStations
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
          <div className="flex gap-2">
            <Input
              id="start"
              placeholder="Address, city, or coordinates"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleUseCurrentLocation}
              title="Use current location"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end">Destination</Label>
          <Input
            id="end"
            placeholder="Address, city, or coordinates"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
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
        disabled={isLoading || !startLocation || !endLocation}
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
    </div>
  );
};

export default TripPlannerForm;
