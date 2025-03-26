
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Map, Navigation, MapPin, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Handle navigation to map view
  const handleExploreClick = () => {
    navigate("/map"); // Changed this to navigate to the /map route
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Map className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-3">Welcome to SafeCamp</h1>
        
        <p className="text-muted-foreground mb-8">
          Find and share safe camping spots for nomads and adventurers. 
          Browse our map to discover locations rated by the community.
        </p>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
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
        
        <Button 
          className="w-full"
          size="lg"
          onClick={handleExploreClick}
        >
          Explore the Map
        </Button>
      </div>
    </div>
  );
};

export default Index;
