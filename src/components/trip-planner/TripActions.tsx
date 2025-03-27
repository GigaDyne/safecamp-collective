import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Save, Check, Navigation, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripStop, SavedTrip } from "@/lib/trip-planner/types";
import { v4 as uuidv4 } from "uuid";
import { saveTripPlan, generateShareableLink } from "@/lib/trip-planner/trip-storage";

interface TripActionsProps {
  selectedStops: TripStop[];
  tripName: string;
  setTripName: (name: string) => void;
  routeData: any;
  savedTripId: string | null;
  setSavedTripId: (id: string | null) => void;
}

const TripActions: React.FC<TripActionsProps> = ({
  selectedStops,
  tripName,
  setTripName,
  routeData,
  savedTripId,
  setSavedTripId
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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
        id: savedTripId || uuidv4(),
        name: tripName,
        stops: selectedStops,
        createdAt: new Date().toISOString(),
        startLocation: routeData?.startLocation || "",
        endLocation: routeData?.endLocation || "",
      };
      
      saveTripPlan(newTrip);
      setSavedTripId(newTrip.id);
      
      toast({
        title: "Trip saved!",
        description: `"${tripName}" has been saved successfully`,
      });
    } catch (error) {
      console.error("Error saving trip:", error);
      toast({
        title: "Error",
        description: "Failed to save trip",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartTrip = () => {
    if (!savedTripId) {
      if (selectedStops.length === 0) {
        toast({
          title: "No stops to navigate",
          description: "Please add at least one stop to your trip",
          variant: "destructive",
        });
        return;
      }
      
      if (!tripName.trim()) {
        toast({
          title: "Missing trip name",
          description: "Please name your trip before starting navigation",
          variant: "destructive",
        });
        return;
      }
      
      handleSaveTrip();
    } else {
      navigate(`/navigation/${savedTripId}`);
    }
  };

  const handleShareTrip = async () => {
    if (!savedTripId) {
      toast({
        title: "Save trip first",
        description: "Please save your trip before sharing",
        variant: "destructive",
      });
      return;
    }

    const shareUrl = window.location.origin + generateShareableLink(savedTripId);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with others to show your trip",
      });
    } catch (error) {
      toast({
        title: "Couldn't copy link",
        description: "Please copy the URL manually",
      });
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex gap-2 mb-3">
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
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="default"
          onClick={handleStartTrip}
          disabled={selectedStops.length === 0}
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Start Trip
        </Button>
        
        <Button
          variant="outline"
          onClick={handleShareTrip}
          disabled={!savedTripId}
          className="w-full"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        {savedTripId 
          ? "Trip saved! You can start navigation or share it with others."
          : "Save your itinerary to access it later or start navigation."}
      </p>
    </div>
  );
};

export default TripActions;
