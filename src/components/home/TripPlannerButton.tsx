
import React from 'react';
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TripPlannerButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Plan Your Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Create a custom trip itinerary with safe camping spots and routes.
        </p>
        <Button 
          className="w-full"
          onClick={() => navigate("/trip-planner")}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Start Planning
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripPlannerButton;
