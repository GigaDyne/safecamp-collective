
import React from "react";
import { TripStop } from "@/lib/trip-planner/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getStopTypeIcon } from "./utils/stopTypeIcons";

interface AvailableStopProps {
  stop: TripStop;
  onAddStop: (stop: TripStop) => void;
}

const AvailableStop: React.FC<AvailableStopProps> = ({ stop, onAddStop }) => {
  return (
    <div 
      key={stop.id}
      className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50"
      onClick={() => onAddStop(stop)}
    >
      <div className="flex items-center gap-2">
        {getStopTypeIcon(stop.type || 'default')}
        <span className="text-sm">{stop.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {stop.distance && `${(stop.distance / 1609.34).toFixed(1)} mi`}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AvailableStop;
