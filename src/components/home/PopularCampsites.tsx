
import React from 'react';
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

// Static reliable image URLs
const reliableImageUrls = [
  'https://images.unsplash.com/photo-1472396961693-142e6e269027',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e'
];

const PopularCampsites: React.FC = () => {
  const navigate = useNavigate();
  const { data: featuredCampsites = [] } = useFeaturedCampsites();

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <img 
            src="/lovable-uploads/974b1500-32b1-47af-869e-1c14f36159dd.png" 
            alt="SafeCamp Logo" 
            className="h-5 w-5 mr-2"
          />
          Popular Campsites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuredCampsites.slice(0, 3).map((campsite, index) => (
            <div key={campsite.id} className="group cursor-pointer" onClick={() => navigate(`/site/${campsite.id}`)}>
              <div className="overflow-hidden rounded-md mb-2 h-32">
                {/* Use static reliable images from the array */}
                <img 
                  src={reliableImageUrls[index % reliableImageUrls.length]} 
                  alt={campsite.name} 
                  className="w-full h-32 object-cover rounded-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null; 
                    // If even our reliable URLs fail, use a further fallback
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e';
                  }}
                />
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
