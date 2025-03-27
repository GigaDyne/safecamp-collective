
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripPlannerHeaderProps {
  onSaveTrip: () => void;
  selectedStopsCount: number;
}

const TripPlannerHeader: React.FC<TripPlannerHeaderProps> = ({
  onSaveTrip,
  selectedStopsCount
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Trip Planner</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="default" 
          size="sm"
          onClick={onSaveTrip}
          disabled={selectedStopsCount === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Trip
        </Button>
      </div>
    </header>
  );
};

export default TripPlannerHeader;
