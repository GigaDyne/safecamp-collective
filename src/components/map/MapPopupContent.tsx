
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Info, Calendar, Navigation, PlusCircle } from "lucide-react";
import { CampSite } from "@/lib/supabase";
import { TripStop } from "@/lib/trip-planner/types";
import { Separator } from "@/components/ui/separator";

interface MapPopupContentProps {
  item: CampSite | TripStop;
  onAddToTrip?: (item: CampSite | TripStop) => void;
  onGetDirections?: (item: CampSite | TripStop) => void;
  onSubmitLocation?: () => void;
  isAlreadyInTrip?: boolean;
  isFromDatabase?: boolean;
}

const MapPopupContent: React.FC<MapPopupContentProps> = ({
  item,
  onAddToTrip,
  onGetDirections,
  onSubmitLocation,
  isAlreadyInTrip = false,
  isFromDatabase = true
}) => {
  // Extract image URL if available
  const imageUrl = 'images' in item && item.images && item.images.length > 0 
    ? item.images[0] 
    : null;

  // Format ratings for display
  const formatRating = (rating?: number) => {
    if (rating === undefined || rating === null) return 'N/A';
    return rating.toString();
  };

  // Determine type label and color
  const getTypeLabel = () => {
    if (!item.type) return null;
    
    const typeMap: Record<string, { label: string, color: string }> = {
      'campsite': { label: 'Campsite', color: 'bg-green-500' },
      'gas': { label: 'Gas Station', color: 'bg-red-500' },
      'water': { label: 'Water', color: 'bg-blue-500' },
      'dump': { label: 'Dump Station', color: 'bg-amber-500' },
      'walmart': { label: 'Walmart', color: 'bg-blue-600' },
      'propane': { label: 'Propane', color: 'bg-orange-500' },
      'repair': { label: 'Repair Shop', color: 'bg-zinc-700' },
      'coffee': { label: 'Coffee Shop', color: 'bg-brown-500' },
      'grocery': { label: 'Grocery Store', color: 'bg-emerald-500' },
      'rv': { label: 'RV Park', color: 'bg-purple-500' }
    };
    
    return typeMap[item.type] || { label: item.type.charAt(0).toUpperCase() + item.type.slice(1), color: 'bg-gray-500' };
  };
  
  const typeInfo = getTypeLabel();

  return (
    <div className="w-full max-w-xs p-3">
      <div className="flex items-start gap-3">
        {/* Icon or image */}
        {imageUrl ? (
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-full ${typeInfo?.color || 'bg-primary'} flex items-center justify-center text-white flex-shrink-0`}>
            {typeInfo?.label?.charAt(0) || 'L'}
          </div>
        )}
        
        {/* Title and type */}
        <div className="flex-1">
          <h3 className="font-semibold text-base truncate">{item.name}</h3>
          {typeInfo && (
            <Badge variant="secondary" className="mt-1">
              {typeInfo.label}
            </Badge>
          )}
          {'distanceFromRoute' in item && item.distanceFromRoute && (
            <p className="text-xs text-muted-foreground mt-1">
              {(item.distanceFromRoute / 1609.34).toFixed(1)} mi from route
            </p>
          )}
        </div>
      </div>
      
      {/* Description if available */}
      {'description' in item && item.description && (
        <p className="text-sm mt-3 line-clamp-3">{item.description}</p>
      )}
      
      {/* Ratings */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {'safetyRating' in item && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Safety</div>
            <div className="flex justify-center items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{formatRating(item.safetyRating)}</span>
            </div>
          </div>
        )}
        
        {'cellSignal' in item && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Signal</div>
            <div className="flex justify-center items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{formatRating(item.cellSignal)}</span>
            </div>
          </div>
        )}
        
        {'quietness' in item && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Quiet</div>
            <div className="flex justify-center items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{formatRating(item.quietness)}</span>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-3" />
      
      {/* Action buttons */}
      <div className="flex justify-between gap-2 mt-2">
        {onAddToTrip && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 flex-1"
            onClick={() => onAddToTrip(item)}
            disabled={isAlreadyInTrip}
          >
            {isAlreadyInTrip ? 'In Trip' : (
              <>
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add to Trip</span>
              </>
            )}
          </Button>
        )}
        
        {onGetDirections && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 flex-1"
            onClick={() => onGetDirections(item)}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Directions</span>
          </Button>
        )}
      </div>
      
      {!isFromDatabase && onSubmitLocation && (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onSubmitLocation}
          className="w-full mt-2"
        >
          <Info className="h-3.5 w-3.5 mr-1" />
          Submit as new location
        </Button>
      )}
      
      {isFromDatabase && (
        <Button 
          variant="link" 
          size="sm" 
          className="w-full mt-1 text-xs"
          asChild
        >
          <a href={`/site/${item.id}`}>View Full Details</a>
        </Button>
      )}
    </div>
  );
};

export default MapPopupContent;
