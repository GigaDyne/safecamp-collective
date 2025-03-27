
import React from "react";
import { TripStop } from "@/lib/trip-planner/types";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { getStopTypeIcon } from "./utils/stopTypeIcons";
import { Badge } from "@/components/ui/badge";

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
        <div className="flex flex-col">
          <span className="text-sm">{stop.name}</span>
          {stop.source && (
            <div className="flex items-center gap-1">
              {stop.source === 'mapbox' && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                  <MapPin className="h-2 w-2 mr-1" />
                  Map
                </Badge>
              )}
              {stop.source === 'supabase' && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-green-50 text-green-700 border-green-200">
                  DB
                </Badge>
              )}
            </div>
          )}
        </div>
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
