
import React from "react";
import { ChevronLeft, Settings, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TripPlannerHeaderProps {
  onOpenSettings: () => void;
  onSaveTrip: () => void;
  selectedStopsCount: number;
}

const TripPlannerHeader: React.FC<TripPlannerHeaderProps> = ({
  onOpenSettings,
  onSaveTrip,
  selectedStopsCount
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary py-3 px-4 flex items-center justify-between text-primary-foreground">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="mr-2 text-primary-foreground hover:bg-primary/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Trip Planner</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveTrip}
          className="text-primary-foreground hover:bg-primary/80"
          disabled={selectedStopsCount === 0}
        >
          <Save className="h-4 w-4 mr-1" />
          Save Trip
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="text-primary-foreground hover:bg-primary/80"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TripPlannerHeader;
