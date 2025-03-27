
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { TripStop, RouteData, SavedTrip } from "@/lib/trip-planner/types";
import { saveTripPlan } from "@/lib/trip-planner/trip-storage";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/providers/AuthProvider";

import TripPlannerHeader from "@/components/trip-planner/TripPlannerHeader";
import TripPlannerContent from "@/components/trip-planner/TripPlannerContent";
import MapboxTokenDialog from "@/components/trip-planner/MapboxTokenDialog";
import SaveTripDialog from "@/components/trip-planner/SaveTripDialog";
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationState {
  startLocation?: string;
  destination?: string;
  startCoordinates?: { lat: number; lng: number };
  destinationCoordinates?: { lat: number; lng: number };
}

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState || {};
  
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
  const [initialStartLocation, setInitialStartLocation] = useState<string | undefined>(locationState.startLocation);
  const [initialDestination, setInitialDestination] = useState<string | undefined>(locationState.destination);
  const [initialStartCoords, setInitialStartCoords] = useState<{lat: number; lng: number} | undefined>(locationState.startCoordinates);
  const [initialDestCoords, setInitialDestCoords] = useState<{lat: number; lng: number} | undefined>(locationState.destinationCoordinates);
  
  const { user, isAuthenticated, isOfflineMode } = useAuth();
  
  // Use the provided Mapbox token or get it from localStorage
  const mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
  
  // Debug logging
  console.log("TripPlannerPage - mapboxToken:", mapboxToken);
  
  const { toast } = useToast();

  useEffect(() => {
    console.log("TripPlannerPage mounted with location state:", locationState);
    
    if (locationState.startLocation && locationState.destination) {
      toast({
        title: "Route loaded",
        description: `Planning route from ${locationState.startLocation} to ${locationState.destination}`,
      });
    }
  }, [locationState, toast]);

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
  
  const handleSaveToken = () => {
    localStorage.setItem("mapbox_token", tokenInput);
    window.location.reload();
  };

  return (
    <div className="relative h-screen flex flex-col">
      <TripPlannerHeader 
        onOpenSettings={() => setShowTokenDialog(true)}
        onSaveTrip={handleSaveTrip}
        selectedStopsCount={selectedStops.length}
      />

      <TripPlannerContent 
        routeData={routeData}
        setRouteData={setRouteData}
        tripStops={tripStops}
        setTripStops={setTripStops}
        selectedStops={selectedStops}
        setSelectedStops={setSelectedStops}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mapboxToken={mapboxToken}
        showCrimeData={showCrimeData}
        setShowCrimeData={setShowCrimeData}
        onAddToItinerary={handleAddToItinerary}
        initialStartLocation={initialStartLocation}
        initialDestination={initialDestination}
        initialStartCoords={initialStartCoords}
        initialDestCoords={initialDestCoords}
      />
      
      <MapboxTokenDialog 
        open={showTokenDialog}
        onOpenChange={setShowTokenDialog}
        tokenInput={tokenInput}
        onTokenInputChange={setTokenInput}
        onSaveToken={handleSaveToken}
      />
      
      <SaveTripDialog 
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        tripName={tripName}
        onTripNameChange={setTripName}
        onSave={confirmSaveTrip}
        isSaving={isSaving}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default TripPlannerPage;
