
import { useState, useEffect } from "react";
import { ChevronLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TripPlannerMap from "@/components/trip-planner/TripPlannerMap";
import TripPlannerForm from "@/components/trip-planner/TripPlannerForm";
import TripItinerary from "@/components/trip-planner/TripItinerary";
import { TripStop, RouteData } from "@/lib/trip-planner/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [tripStops, setTripStops] = useState<TripStop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem("mapbox_token") || "");
  const [mapboxToken, setMapboxToken] = useState(() => localStorage.getItem("mapbox_token") || "");
  const { toast } = useToast();

  // Check for token on component mount and show dialog if missing
  useEffect(() => {
    if (!mapboxToken) {
      setShowTokenDialog(true);
    }
  }, [mapboxToken]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem("mapbox_token", tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setShowTokenDialog(false);
      toast({
        title: "Success",
        description: "Mapbox token saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary py-3 px-4 flex items-center justify-between text-primary-foreground">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="mr-2 text-primary-foreground hover:bg-primary/80"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Trip Planner</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowTokenDialog(true)}
          className="text-primary-foreground hover:bg-primary/80"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left panel - Form and Itinerary */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col overflow-hidden">
          <TripPlannerForm 
            setRouteData={setRouteData} 
            setTripStops={setTripStops}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            mapboxToken={mapboxToken}
          />
          <TripItinerary 
            tripStops={tripStops} 
            setTripStops={setTripStops} 
            routeData={routeData}
          />
        </div>
        
        {/* Right panel - Map */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full">
          <TripPlannerMap 
            routeData={routeData} 
            tripStops={tripStops} 
            setTripStops={setTripStops}
            isLoading={isLoading}
            mapboxToken={mapboxToken}
          />
        </div>
      </div>

      {/* Dialog for entering Mapbox token */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mapbox Token Required</DialogTitle>
            <DialogDescription>
              A Mapbox token is required for the Trip Planner to work properly. You can get a free token from <a href="https://mapbox.com/" className="text-primary underline" target="_blank" rel="noopener noreferrer">mapbox.com</a>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter your Mapbox token"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This token will be stored in your browser's local storage.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSaveToken}>
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripPlannerPage;
