
import React from 'react';
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFeaturedCampsites } from "@/hooks/useFeaturedCampsites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeaturedCampsite {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
}

const PopularCampsites: React.FC = () => {
  const navigate = useNavigate();
  const { data: featuredCampsites = [] } = useFeaturedCampsites();

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Popular Campsites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuredCampsites.slice(0, 3).map((campsite) => (
            <div key={campsite.id} className="group cursor-pointer" onClick={() => navigate(`/site/${campsite.id}`)}>
              <div className="overflow-hidden rounded-md mb-2 h-32">
                {campsite.image_url ? (
                  <img 
                    src={campsite.image_url} 
                    alt={campsite.name} 
                    className="w-full h-32 object-cover rounded-md transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Lone_Rock_Beach_Campground.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center rounded-md">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm line-clamp-1">{campsite.name}</h3>
              <p className="text-xs text-muted-foreground">{campsite.location}</p>
              <p className="text-xs text-muted-foreground mt-1">provided by SafeCamp</p>
            </div>
          ))}
        </div>
        
        <Button variant="link" className="mt-4 px-0 w-full justify-center" onClick={() => navigate("/map")}>
          View all campsites
        </Button>
      </CardContent>
    </Card>
  );
};

export default PopularCampsites;
