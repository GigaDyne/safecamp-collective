
import React from 'react';
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TripPlannerButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => navigate("/trip-planner")}
      >
        <Navigation className="mr-2 h-4 w-4 text-blue-500" />
        Plan a Trip
      </Button>
    </div>
  );
};

export default TripPlannerButton;
