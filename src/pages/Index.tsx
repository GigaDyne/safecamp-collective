
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Map, Navigation, MapPin, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import PopularCampsites from "@/components/home/PopularCampsites";
import AddressAutocompleteInput from "@/components/trip-planner/AddressAutocompleteInput";

const Index = () => {
  const navigate = useNavigate();
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";

  const handleExploreClick = () => {
    navigate("/map", { replace: false });
  };

  const handlePlanTripClick = () => {
    navigate("/planner", { 
      state: { 
        startLocation: startLocation, 
        destination: destination 
      } 
    });
  };

  const handleStartLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setStartLocation(location.name);
  };

  const handleDestinationSelect = (location: { name: string; lat: number; lng: number }) => {
    setDestination(location.name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
          {/* Trip Planner Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-muted order-2 md:order-1">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Navigation className="h-6 w-6 mr-2 text-primary" />
              Start Planning Your Trip
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="start-location" className="block text-sm font-medium mb-1">Starting Point</label>
                <AddressAutocompleteInput
                  placeholder="Enter your starting point"
                  onSelect={handleStartLocationSelect}
                  mapboxToken={mapboxToken}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-1">Destination</label>
                <AddressAutocompleteInput
                  placeholder="Enter your destination"
                  onSelect={handleDestinationSelect}
                  mapboxToken={mapboxToken}
                  className="w-full"
                />
              </div>
              
              <Button 
                className="w-full"
                size="lg"
                onClick={handlePlanTripClick}
                disabled={!startLocation || !destination}
              >
                Plan My Route
              </Button>
            </div>
          </div>
          
          {/* Welcome Section */}
          <div className="text-center md:text-left order-1 md:order-2">
            <div className="mb-6 flex justify-center md:justify-start">
              <div className="h-48 w-48 overflow-hidden rounded-full bg-transparent">
                <img 
                  src="/lovable-uploads/def200c5-de41-49bb-b376-ac14a7bdc292.png" 
                  alt="SafeCamp Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-3">Welcome to SafeCamp</h1>
            
            <p className="text-muted-foreground mb-6 text-lg">
              Find and share safe camping spots for nomads and adventurers. 
              Browse our map to discover locations rated by the community.
            </p>
            
            <Button 
              className="md:w-auto"
              size="lg"
              onClick={handleExploreClick}
            >
              <Map className="mr-2 h-5 w-5" />
              Explore the Map
            </Button>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start border rounded-lg p-4 text-left">
            <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm mb-1">Discover Safe Locations</h3>
              <p className="text-xs text-muted-foreground">
                Browse campsites rated by safety, cell signal, and quietness
              </p>
            </div>
          </div>
          
          <div className="flex items-start border rounded-lg p-4 text-left">
            <Shield className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm mb-1">Community Ratings</h3>
              <p className="text-xs text-muted-foreground">
                See what others say about locations before you go
              </p>
            </div>
          </div>
          
          <div className="flex items-start border rounded-lg p-4 text-left">
            <Navigation className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm mb-1">Share Your Finds</h3>
              <p className="text-xs text-muted-foreground">
                Add new campsites and help others find safe places to stay
              </p>
            </div>
          </div>
        </div>
        
        {/* Popular Campsites Section */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">Popular Campsites</h2>
          <PopularCampsites />
        </div>
      </div>
    </div>
  );
};

export default Index;
