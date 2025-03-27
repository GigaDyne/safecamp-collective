
import React from "react";
import { CampSite } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { StarIcon, Route, Plus, FlagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MapPopupContentProps {
  item: CampSite | any;
  isFromDatabase?: boolean;
  isAlreadyInTrip?: boolean;
  onAddToTrip?: (site: CampSite) => void;
  onGetDirections?: (site: CampSite) => void;
  onSubmitLocation?: (site: CampSite) => void;
}

const MapPopupContent: React.FC<MapPopupContentProps> = ({ 
  item, 
  isFromDatabase = true,
  isAlreadyInTrip = false,
  onAddToTrip,
  onGetDirections,
  onSubmitLocation
}) => {
  return (
    <div className="w-full max-w-xs bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-md overflow-hidden">
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
        <div className="text-xs text-muted-foreground mb-2">{item.location}</div>
        
        <div className="flex justify-between text-xs mb-2">
          <div className="flex items-center space-x-1">
            <StarIcon className="h-3 w-3 text-yellow-500" />
            <span className="font-medium">{item.safetyRating}/5</span>
            <span className="text-muted-foreground">Safety</span>
          </div>
          {item.cellSignal && (
            <div>
              <span className="font-medium">{item.cellSignal}/5</span>
              <span className="text-muted-foreground ml-1">Signal</span>
            </div>
          )}
          {item.quietness && (
            <div>
              <span className="font-medium">{item.quietness}/5</span>
              <span className="text-muted-foreground ml-1">Quiet</span>
            </div>
          )}
        </div>
        
        {!isFromDatabase && (
          <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px]">
            Not in our database
          </Badge>
        )}
        
        {item.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="flex flex-col space-y-1 mt-3">
          {onGetDirections && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start text-xs"
              onClick={() => onGetDirections(item)}
            >
              <Route className="h-3 w-3 mr-1" />
              Get Directions
            </Button>
          )}
          
          {onAddToTrip && !isAlreadyInTrip && (
            <Button 
              size="sm" 
              variant="default" 
              className="w-full justify-start text-xs"
              onClick={() => onAddToTrip(item)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add to Trip
            </Button>
          )}
          
          {onAddToTrip && isAlreadyInTrip && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start text-xs"
              disabled
            >
              <Plus className="h-3 w-3 mr-1" />
              Already in Trip
            </Button>
          )}
          
          {onSubmitLocation && !isFromDatabase && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start text-xs"
              onClick={() => onSubmitLocation(item)}
            >
              <FlagIcon className="h-3 w-3 mr-1" />
              Submit to SafeCamp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPopupContent;
