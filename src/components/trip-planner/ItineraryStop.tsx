
import React from "react";
import { TripStop } from "@/lib/trip-planner/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { getStopTypeIcon, renderEta } from "./utils/stopTypeIcons";

interface ItineraryStopProps {
  stop: TripStop;
  index: number;
  isLast: boolean;
  onMoveStop: (index: number, direction: 'up' | 'down') => void;
  onRemoveStop: (stopId: string) => void;
}

const ItineraryStop: React.FC<ItineraryStopProps> = ({
  stop,
  index,
  isLast,
  onMoveStop,
  onRemoveStop,
}) => {
  return (
    <Card key={stop.id} className="relative">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStopTypeIcon(stop.type || 'default')}
            <span className="font-medium">{stop.name}</span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => onMoveStop(index, 'up')}
              disabled={index === 0}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => onMoveStop(index, 'down')}
              disabled={isLast}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive/80" 
              onClick={() => onRemoveStop(stop.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">
            {stop.distanceFromRoute ? 
              `${(stop.distanceFromRoute / 1609.34).toFixed(1)} mi from route` : 
              "On route"
            }
          </div>
          <div className="flex gap-1">
            {stop.eta && (
              <Badge variant="outline" className="text-xs">
                ETA: {renderEta(stop.distance || 0)}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {stop.distance ? 
                `${(stop.distance / 1609.34).toFixed(1)} mi` : 
                "Distance unknown"
              }
            </Badge>
          </div>
        </div>
      </CardContent>
      {!isLast && (
        <div className="flex justify-center">
          <Separator className="w-4/5" />
        </div>
      )}
    </Card>
  );
};

export default ItineraryStop;
