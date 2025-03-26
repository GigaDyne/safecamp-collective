
import React from 'react';
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFeaturedCampsites } from "@/hooks/useFeaturedCampsites";

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
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Popular Campsites</h2>
      
      <div className="space-y-4">
        {featuredCampsites.map((campsite) => (
          <div key={campsite.id} className="mb-4">
            <div className="overflow-hidden rounded-md mb-2">
              {campsite.image_url ? (
                <img 
                  src={campsite.image_url} 
                  alt={campsite.name} 
                  className="w-full h-48 object-cover rounded-md transition-transform hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Lone_Rock_Beach_Campground.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-semibold">{campsite.name}</h3>
            <p className="text-sm text-muted-foreground">provided by SafeCamp</p>
          </div>
        ))}
      </div>
      
      <Button variant="link" className="mt-4 px-0" onClick={() => navigate("/map")}>
        View all
      </Button>
    </div>
  );
};

export default PopularCampsites;
