
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
  const [selectedStops, setSelectedStops] = useState<TripStop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem("mapbox_token") || "");
  
  // Use the hardcoded Mapbox token
  const mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
  
  const { toast } = useToast();

  // Handle adding a stop to the itinerary
  const handleAddToItinerary = (stop: TripStop) => {
    // Check if the stop is already in the itinerary
    if (selectedStops.some(s => s.id === stop.id)) {
      return;
    }
    
    setSelectedStops(prev => [...prev, { ...stop, order: prev.length }]);
    
    toast({
      title: "Stop added",
      description: `Added ${stop.name} to your itinerary`,
    });
  };

  // Remove token dialog logic since we're using a hardcoded token
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
            onSelectedStopsChange={setSelectedStops}
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
            selectedStops={selectedStops}
            onAddToItinerary={handleAddToItinerary}
          />
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;
