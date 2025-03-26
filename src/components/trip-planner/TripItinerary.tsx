
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TripStop, RouteData, SavedTrip } from "@/lib/trip-planner/types";
import { loadTripPlans } from "@/lib/trip-planner/trip-storage";
import ItineraryStop from "./ItineraryStop";
import AvailableStop from "./AvailableStop";
import TripActions from "./TripActions";

interface TripItineraryProps {
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  routeData: RouteData | null;
  selectedStops?: TripStop[];
  onSelectedStopsChange?: (stops: TripStop[]) => void;
}

const TripItinerary = ({ 
  tripStops, 
  setTripStops, 
  routeData,
  selectedStops = [],
  onSelectedStopsChange
}: TripItineraryProps) => {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState("");
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      const trips = await loadTripPlans();
      setSavedTrips(trips);
    }
    fetchTrips();
  }, []);

  const handleAddStop = (stop: TripStop) => {
    if (selectedStops.some(s => s.id === stop.id)) {
      return;
    }
    
    const newStops = [...selectedStops, { ...stop, order: selectedStops.length }];
    
    if (onSelectedStopsChange) {
      onSelectedStopsChange(newStops);
    }
  };

  const handleRemoveStop = (stopId: string) => {
    const newStops = selectedStops.filter(stop => stop.id !== stopId)
      .map((stop, idx) => ({
        ...stop,
        order: idx
      }));
    
    if (onSelectedStopsChange) {
      onSelectedStopsChange(newStops);
    }
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === selectedStops.length - 1)
    ) {
      return;
    }

    const newStops = [...selectedStops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    
    const updatedStops = newStops.map((stop, idx) => ({
      ...stop,
      order: idx
    }));
    
    if (onSelectedStopsChange) {
      onSelectedStopsChange(updatedStops);
    }
  };
  
  // Navigate to trip navigation after saving
  useEffect(() => {
    if (savedTripId) {
      navigate(`/navigation/${savedTripId}`);
    }
  }, [savedTripId, navigate]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 bg-muted/50">
        <h2 className="text-lg font-medium mb-2">My Itinerary</h2>
        <div className="text-sm text-muted-foreground">
          {selectedStops.length > 0 
            ? `${selectedStops.length} stops planned` 
            : "No stops added yet. Tap stops from the map to add them."}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {selectedStops.length === 0 ? (
            <div className="text-center p-6 border rounded-md bg-muted/20">
              <Route className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Add stops from the map to build your itinerary
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedStops.map((stop, index) => (
                <ItineraryStop
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isLast={index === selectedStops.length - 1}
                  onMoveStop={handleMoveStop}
                  onRemoveStop={handleRemoveStop}
                />
              ))}
            </div>
          )}
          
          {tripStops.length > 0 && (
            <>
              <Separator />
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-3">Available Stops</h3>
                <div className="space-y-2">
                  {tripStops
                    .filter(stop => !selectedStops.some(s => s.id === stop.id))
                    .map(stop => (
                      <AvailableStop 
                        key={stop.id}
                        stop={stop}
                        onAddStop={handleAddStop}
                      />
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      
      {selectedStops.length > 0 && (
        <TripActions
          selectedStops={selectedStops}
          tripName={tripName}
          setTripName={setTripName}
          routeData={routeData}
          savedTripId={savedTripId}
          setSavedTripId={setSavedTripId}
        />
      )}
    </div>
  );
};

export default TripItinerary;
