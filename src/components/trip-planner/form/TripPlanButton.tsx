
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface TripPlanButtonProps {
  isLoading: boolean;
  isFormValid: boolean;
  onPlanTrip: () => void;
  mapboxToken?: string;
}

const TripPlanButton = ({
  isLoading,
  isFormValid,
  onPlanTrip,
  mapboxToken
}: TripPlanButtonProps) => {
  return (
    <div className="space-y-2">
      <Button 
        onClick={onPlanTrip} 
        className="w-full mt-6 font-medium bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? (
          <>
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            Planning Trip...
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
      
      {mapboxToken && !isFormValid && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Enter both start and destination locations to plan your trip
        </p>
      )}
    </div>
  );
};

export default TripPlanButton;
