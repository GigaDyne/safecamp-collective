import React, { useState, useEffect } from "react";
import { ChevronLeft, Settings, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TripPlannerMap from "@/components/trip-planner/TripPlannerMap";
import TripPlannerForm from "@/components/trip-planner/TripPlannerForm";
import TripItinerary from "@/components/trip-planner/TripItinerary";
import { TripStop, RouteData, SavedTrip } from "@/lib/trip-planner/types";
import { saveTripPlan } from "@/lib/trip-planner/trip-storage";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/providers/AuthProvider";
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
  const [isSaving, setIsSaving] = useState(false);
  const [tripName, setTripName] = useState("My Trip");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCrimeData, setShowCrimeData] = useState(false);
  
  const { user, isAuthenticated, isOfflineMode } = useAuth();
  
  const mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
  
  const { toast } = useToast();

  useEffect(() => {
    console.log("TripPlannerPage mounted, mapboxToken:", mapboxToken ? "Token exists" : "No token");
  }, [mapboxToken]);

  const handleAddToItinerary = (stop: TripStop) => {
    if (selectedStops.some(s => s.id === stop.id)) {
      return;
    }
    
    const newStop = { 
      ...stop, 
      order: selectedStops.length 
    };
    
    setSelectedStops(prev => [...prev, newStop]);
    
    toast({
      title: "Stop added",
      description: `Added ${stop.name} to your itinerary`,
    });
  };
  
  const handleSaveTrip = async () => {
    if (selectedStops.length === 0) {
      toast({
        title: "Cannot save trip",
        description: "Please add at least one stop to your itinerary",
        variant: "destructive"
      });
      return;
    }
    
    setShowSaveDialog(true);
  };
  
  const confirmSaveTrip = async () => {
    try {
      setIsSaving(true);
      
      const newTrip: SavedTrip = {
        id: uuidv4(),
        name: tripName,
        startLocation: tripStops.length > 0 ? tripStops[0].name : "Starting Point",
        endLocation: tripStops.length > 0 ? tripStops[tripStops.length - 1].name : "Destination",
        stops: selectedStops,
        routeData: routeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveTripPlan(newTrip);
      
      toast({
        title: "Trip saved",
        description: `"${tripName}" has been saved${isAuthenticated ? " to your account" : " locally"}`,
      });
      
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving trip:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your trip",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
            onClick={() => navigate("/")} // Changed from navigate(-1) to navigate("/")
            className="mr-2 text-primary-foreground hover:bg-primary/80"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Trip Planner</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveTrip}
            className="text-primary-foreground hover:bg-primary/80"
            disabled={selectedStops.length === 0}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Trip
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTokenDialog(true)}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] overflow-hidden">
        <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col overflow-hidden">
          <TripPlannerForm 
            setRouteData={setRouteData} 
            setTripStops={setTripStops}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            mapboxToken={mapboxToken}
            showCrimeData={showCrimeData}
            onToggleCrimeData={setShowCrimeData}
          />
          <TripItinerary 
            tripStops={tripStops} 
            setTripStops={setTripStops} 
            routeData={routeData}
            selectedStops={selectedStops}
            onSelectedStopsChange={setSelectedStops}
          />
        </div>
        
        <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-muted/20">
          <TripPlannerMap 
            routeData={routeData} 
            tripStops={tripStops} 
            setTripStops={setTripStops}
            isLoading={isLoading}
            mapboxToken={mapboxToken}
            selectedStops={selectedStops}
            onAddToItinerary={handleAddToItinerary}
            className="h-full w-full"
          />
        </div>
      </div>
      
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mapbox API Token</DialogTitle>
            <DialogDescription>
              Enter your Mapbox API token to use the map features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="mapbox-token"
                placeholder="Enter Mapbox token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                localStorage.setItem("mapbox_token", tokenInput);
                window.location.reload();
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Trip</DialogTitle>
            <DialogDescription>
              {isAuthenticated 
                ? "Save this trip to your account." 
                : "Save this trip locally. Sign in to sync your trips across devices."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="trip-name" className="text-sm font-medium">
                Trip Name
              </label>
              <Input
                id="trip-name"
                placeholder="Enter trip name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSaveTrip}
              disabled={isSaving || !tripName.trim()}
            >
              {isSaving ? "Saving..." : "Save Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripPlannerPage;
