
import { useState, useEffect } from "react";
import { 
  Save, 
  Trash2, 
  Fuel, 
  Droplet, 
  Route, 
  MapPin, 
  ArrowUp, 
  ArrowDown, 
  Check,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { TripStop, RouteData, SavedTrip } from "@/lib/trip-planner/types";
import { useToast } from "@/hooks/use-toast";
import { saveTripPlan, loadTripPlans } from "@/lib/trip-planner/trip-storage";

interface TripItineraryProps {
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  routeData: RouteData | null;
  onSelectedStopsChange?: (stops: TripStop[]) => void;
}

const TripItinerary = ({ 
  tripStops, 
  setTripStops, 
  routeData,
  onSelectedStopsChange
}: TripItineraryProps) => {
  const { toast } = useToast();
  const [selectedStops, setSelectedStops] = useState<TripStop[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [tripName, setTripName] = useState("");

  useEffect(() => {
    const trips = loadTripPlans();
    setSavedTrips(trips);
  }, []);

  // Notify parent component when selected stops change
  useEffect(() => {
    if (onSelectedStopsChange) {
      onSelectedStopsChange(selectedStops);
    }
  }, [selectedStops, onSelectedStopsChange]);

  const handleAddStop = (stop: TripStop) => {
    if (selectedStops.some(s => s.id === stop.id)) {
      return;
    }
    
    setSelectedStops(prev => [...prev, { ...stop, order: prev.length }]);
  };

  const handleRemoveStop = (stopId: string) => {
    setSelectedStops(prev => prev.filter(stop => stop.id !== stopId));
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
    
    setSelectedStops(updatedStops);
  };

  const handleSaveTrip = () => {
    if (selectedStops.length === 0) {
      toast({
        title: "No stops to save",
        description: "Please add at least one stop to your trip",
        variant: "destructive",
      });
      return;
    }

    if (!tripName.trim()) {
      toast({
        title: "Missing trip name",
        description: "Please enter a name for your trip",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const newTrip: SavedTrip = {
        id: Date.now().toString(),
        name: tripName,
        stops: selectedStops,
        created: new Date().toISOString(),
        startLocation: routeData?.startLocation || "",
        endLocation: routeData?.endLocation || "",
      };
      
      saveTripPlan(newTrip);
      
      setSavedTrips(prev => [...prev, newTrip]);
      
      toast({
        title: "Trip saved!",
        description: `"${tripName}" has been saved successfully`,
      });
      
      setTripName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save trip",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const stopTypeIcon = (type: string) => {
    switch (type) {
      case 'campsite':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'gas':
        return <Fuel className="h-4 w-4 text-red-500" />;
      case 'water':
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case 'dump':
        return <Trash2 className="h-4 w-4 text-amber-500" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const renderEta = (distanceMeters: number) => {
    const distanceMiles = distanceMeters / 1609.34;
    const timeHours = distanceMiles / 55;
    
    const hours = Math.floor(timeHours);
    const minutes = Math.floor((timeHours - hours) * 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

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
                <Card key={stop.id} className="relative">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {stopTypeIcon(stop.type)}
                        <span className="font-medium">{stop.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleMoveStop(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleMoveStop(index, 'down')}
                          disabled={index === selectedStops.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive/80" 
                          onClick={() => handleRemoveStop(stop.id)}
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
                  {index < selectedStops.length - 1 && (
                    <div className="flex justify-center">
                      <Separator className="w-4/5" />
                    </div>
                  )}
                </Card>
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
                      <div 
                        key={stop.id}
                        className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                        onClick={() => handleAddStop(stop)}
                      >
                        <div className="flex items-center gap-2">
                          {stopTypeIcon(stop.type)}
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
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      
      {selectedStops.length > 0 && (
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Trip name"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
            <Button 
              onClick={handleSaveTrip} 
              disabled={isSaving || !tripName.trim()}
              size="sm"
            >
              {isSaving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Save your itinerary to access it later.
          </p>
        </div>
      )}
    </div>
  );
};

export default TripItinerary;
