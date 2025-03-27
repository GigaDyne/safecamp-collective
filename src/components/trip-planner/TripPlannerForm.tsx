
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { getDirections } from "@/lib/trip-planner/route-service";
import { useToast } from "@/hooks/use-toast";
import { RouteData, TripStop } from "@/lib/trip-planner/types";
import TripDistanceSlider from "./form/TripDistanceSlider";
import TripFilterOptions from "./form/TripFilterOptions";
import LocationAutocomplete from "./LocationAutocomplete";

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
  const [destination, setDestination] = useState(initialDestination || "");
  const [bufferDistance, setBufferDistance] = useState(50);
  const [filterOptions, setFilterOptions] = useState({
    restAreas: true,
    gasStations: true,
    restaurants: true,
    campgrounds: false,
    pointsOfInterest: false
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      start: initialStartLocation || "",
      destination: initialDestination || "",
    },
  });
  
  useEffect(() => {
    if (initialStartLocation) {
      setValue("start", initialStartLocation);
    }
    if (initialDestination) {
      setValue("destination", initialDestination);
    }
  }, [initialStartLocation, initialDestination, setValue]);

  const onSubmit = async (data: any) => {
    if (!data.start || !data.destination) {
      toast({
        title: "Missing locations",
        description: "Please enter both start and destination locations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRouteData(null);
    setTripStops([]);

    try {
      const route = await getDirections(data.start, data.destination);

      if (!route) {
        toast({
          title: "Route not found",
          description: "Could not find a route between the specified locations.",
          variant: "destructive",
        });
        return;
      }

      setRouteData(route);
      
      // Generate some mock trip stops
      const mockStops: TripStop[] = Array.from({ length: 10 }, (_, i) => ({
        id: `stop-${i}`,
        name: `Stop ${i + 1}`,
        location: `Location ${i + 1}`,
        coordinates: {
          lat: 37.7749 + (Math.random() - 0.5) * 2,
          lng: -122.4194 + (Math.random() - 0.5) * 2
        },
        type: ['campsite', 'gas', 'coffee', 'grocery'][Math.floor(Math.random() * 4)] as any,
        safetyRating: Math.floor(Math.random() * 5) + 1,
        distanceFromRoute: Math.random() * 5000,
        distance: Math.random() * 50000,
        eta: `${Math.floor(Math.random() * 5)}h ${Math.floor(Math.random() * 60)}m`
      }));
      
      setTripStops(mockStops);

      toast({
        title: "Route loaded",
        description: `Planning route from ${data.start} to ${data.destination}`,
      });
    } catch (error) {
      console.error("Error fetching directions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch directions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLocationSelect = (field: "start" | "destination") => (location: { placeName: string; coordinates: string }) => {
    if (field === "start") {
      setStartLocation(location.placeName);
      setValue("start", location.placeName);
    } else {
      setDestination(location.placeName);
      setValue("destination", location.placeName);
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle>Plan Your Trip</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start">Start Location</Label>
            <LocationAutocomplete
              placeholder="Enter start location"
              value={startLocation}
              onChange={setStartLocation}
              onLocationSelect={handleLocationSelect("start")}
            />
            {errors.start && (
              <p className="text-red-500 text-sm">{errors.start.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <LocationAutocomplete
              placeholder="Enter destination"
              value={destination}
              onChange={setDestination}
              onLocationSelect={handleLocationSelect("destination")}
            />
            {errors.destination && (
              <p className="text-red-500 text-sm">
                {errors.destination.message}
              </p>
            )}
          </div>
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
          <Label className="pb-2">
            <MapPin className="mr-2 h-4 w-4 inline-block align-middle" />
            Additional Options
          </Label>
          <TripDistanceSlider 
            bufferDistance={bufferDistance}
            setBufferDistance={setBufferDistance}
          />
          <TripFilterOptions 
            includeCampsites={filterOptions.campgrounds}
            setIncludeCampsites={(value) => setFilterOptions(prev => ({ ...prev, campgrounds: value }))}
            includeGasStations={filterOptions.gasStations}
            setIncludeGasStations={(value) => setFilterOptions(prev => ({ ...prev, gasStations: value }))}
            includeWaterStations={true}
            setIncludeWaterStations={() => {}}
            includeDumpStations={true}
            setIncludeDumpStations={() => {}}
            includeWalmarts={true}
            setIncludeWalmarts={() => {}}
            includePropaneStations={true}
            setIncludePropaneStations={() => {}}
            includeRepairShops={true}
            setIncludeRepairShops={() => {}}
            showCrimeData={showCrimeData}
            onToggleCrimeData={onToggleCrimeData}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TripPlannerForm;
