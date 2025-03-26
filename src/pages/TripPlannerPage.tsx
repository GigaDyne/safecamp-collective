
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TripPlannerMap from "@/components/trip-planner/TripPlannerMap";
import TripPlannerForm from "@/components/trip-planner/TripPlannerForm";
import TripItinerary from "@/components/trip-planner/TripItinerary";
import { TripStop, RouteData } from "@/lib/trip-planner/types";

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [tripStops, setTripStops] = useState<TripStop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary py-3 px-4 flex items-center text-primary-foreground">
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

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left panel - Form and Itinerary */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col overflow-hidden">
          <TripPlannerForm 
            setRouteData={setRouteData} 
            setTripStops={setTripStops}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
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
          />
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;
