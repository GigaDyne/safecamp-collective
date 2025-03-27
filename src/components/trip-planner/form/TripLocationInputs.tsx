
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/hooks/useLocation";
import AddressAutocompleteInput from "../AddressAutocompleteInput";

interface TripLocationInputsProps {
  mapboxToken?: string;
  startLocation: string;
  setStartLocation: (location: string) => void;
  startCoordinates: [number, number] | null;
  setStartCoordinates: (coords: [number, number] | null) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  endCoordinates: [number, number] | null;
  setEndCoordinates: (coords: [number, number] | null) => void;
  isLoading: boolean;
  initialStartLocation?: string;
  initialDestination?: string;
}

const TripLocationInputs = ({
  mapboxToken,
  startLocation,
  setStartLocation,
  startCoordinates,
  setStartCoordinates,
  endLocation,
  setEndLocation,
  endCoordinates,
  setEndCoordinates,
  isLoading,
  initialStartLocation,
  initialDestination
}: TripLocationInputsProps) => {
  const { toast } = useToast();
  const { getLocation } = useLocation();

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
    console.log("Start location selected:", location);
    setStartLocation(location.name);
    setStartCoordinates([location.lng, location.lat]);
  };

  const handleEndLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    console.log("End location selected:", location);
    setEndLocation(location.name);
    setEndCoordinates([location.lng, location.lat]);
  };

  return (
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
            disabled={!mapboxToken || isLoading}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        {startLocation && startCoordinates && (
          <p className="text-xs text-muted-foreground mt-1">
            Location selected with coordinates
          </p>
        )}
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
        {endLocation && endCoordinates && (
          <p className="text-xs text-muted-foreground mt-1">
            Location selected with coordinates
          </p>
        )}
      </div>
    </div>
  );
};

export default TripLocationInputs;
