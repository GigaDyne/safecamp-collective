import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Navigation, MapPin, Info, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTripPlanById } from "@/lib/trip-planner/trip-storage";
import { TripStop, SavedTrip } from "@/lib/trip-planner/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation as useCurrentLocation } from "@/hooks/useLocation";
import TripNavigationMap from "@/components/trip-planner/TripNavigationMap";
import { useAuth } from "@/providers/AuthProvider";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

const TripNavigationPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { location, getLocation } = useCurrentLocation();
  const { isAuthenticated, isOfflineMode } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadTrip() {
      if (!tripId) {
        navigate("/trip-planner");
        return;
      }
      
      try {
        const tripData = await getTripPlanById(tripId);
        if (tripData) {
          setTrip(tripData);
          if (tripData.stops) {
            const sortedStops = [...tripData.stops].sort((a, b) => 
              (a.order || 0) - (b.order || 0)
            );
            tripData.stops = sortedStops;
          }
        } else {
          toast({
            title: "Trip not found",
            description: "The requested trip could not be found",
            variant: "destructive",
          });
          navigate("/trip-planner");
        }
      } catch (error) {
        console.error("Error loading trip:", error);
        toast({
          title: "Error",
          description: "There was a problem loading your trip",
          variant: "destructive",
        });
        navigate("/trip-planner");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTrip();
  }, [tripId, navigate, toast]);
  
  useEffect(() => {
    const updateLocation = async () => {
      try {
        const coords = await getLocation();
        if (coords) {
          setUserLocation({
            lat: coords.latitude,
            lng: coords.longitude
          });
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };
    
    updateLocation();
    
    const intervalId = setInterval(updateLocation, 10000);
    
    return () => clearInterval(intervalId);
  }, [getLocation]);
  
  const calculateDistanceAndEta = (stop: TripStop) => {
    if (!userLocation) return { distance: "Unknown", eta: "Unknown" };
    
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = stop.coordinates.lat;
    const lon2 = stop.coordinates.lng;
    
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distanceMeters = R * c;
    const distanceMiles = distanceMeters / 1609.34;
    
    const timeHours = distanceMiles / 55;
    const hours = Math.floor(timeHours);
    const minutes = Math.floor((timeHours - hours) * 60);
    
    const etaText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    return {
      distance: `${distanceMiles.toFixed(1)} mi`,
      eta: etaText
    };
  };
  
  const handleShare = async () => {
    if (!trip) return;
    
    try {
      await navigator.clipboard.writeText(window.location.href);
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
  
  const handleNextStop = () => {
    if (trip && currentStopIndex < trip.stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
    }
  };
  
  const handlePreviousStop = () => {
    if (currentStopIndex > 0) {
      setCurrentStopIndex(currentStopIndex - 1);
    }
  };
  
  if (isLoading || !trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading trip...</p>
      </div>
    );
  }
  
  const currentStop = trip.stops[currentStopIndex];
  const { distance, eta } = currentStop ? calculateDistanceAndEta(currentStop) : { distance: "N/A", eta: "N/A" };
  
  return (
    <div className="relative h-screen flex flex-col">
      <div className="bg-primary py-3 px-4 flex items-center justify-between text-primary-foreground">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/trip-planner")} 
            className="mr-2 text-primary-foreground hover:bg-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{trip.name}</h1>
            <p className="text-xs text-primary-foreground/80">
              {trip.startLocation} → {trip.endLocation}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-primary-foreground hover:bg-primary/80"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative flex-1">
        <GoogleMapsProvider>
          <TripNavigationMap 
            trip={{
              id: trip.id,
              ownerId: trip.ownerId || "guest",
              name: trip.name,
              startLocation: trip.startLocation,
              endLocation: trip.endLocation,
              stops: trip.stops,
              routeData: trip.routeData,
              createdAt: trip.createdAt,
              updatedAt: trip.updatedAt || trip.createdAt
            }}
            tripStops={trip.stops} 
            currentStopIndex={currentStopIndex}
            userLocation={userLocation}
          />
        </GoogleMapsProvider>
        
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">{currentStop?.name || "No stop selected"}</h2>
                    <Badge variant="outline">{currentStopIndex + 1}/{trip.stops.length}</Badge>
                  </div>
                  
                  <div className="flex items-center mt-1 gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">
                      Distance: {distance}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal">
                      ETA: {eta}
                    </Badge>
                  </div>
                  
                  {currentStop?.details?.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentStop.details.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePreviousStop}
                      disabled={currentStopIndex === 0}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleNextStop}
                      disabled={currentStopIndex === trip.stops.length - 1}
                      className="flex-1"
                    >
                      Next Stop
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripNavigationPage;
