
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFeaturedCampsites } from "@/hooks/useFeaturedCampsites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reliableImageUrls = [
  'https://images.unsplash.com/photo-1472396961693-142e6e269027',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e'
];

const PopularCampsites: React.FC = () => {
  const navigate = useNavigate();
  const { data: featuredCampsites = [], isLoading, error } = useFeaturedCampsites();

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <div className="h-5 w-5 overflow-hidden rounded-full bg-transparent mr-2">
            <img 
              src="/lovable-uploads/0e349219-2a18-4d3a-b419-cef60a0b18f5.png" 
              alt="SafeCamp Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          Popular Campsites
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            Unable to load campsites. Please try again later.
          </div>
        ) : featuredCampsites.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No popular campsites found.
          </div>
        ) : (
          <div className="space-y-4">
            {featuredCampsites.slice(0, 3).map((campsite, index) => (
              <div key={campsite.id} className="group cursor-pointer" onClick={() => navigate(`/site/${campsite.id}`)}>
                <div className="overflow-hidden rounded-md mb-2 h-32">
                  <img 
                    src={reliableImageUrls[index % reliableImageUrls.length]} 
                    alt={campsite.name} 
                    className="w-full h-32 object-cover rounded-md transition-transform group-hover:scale-105"
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{campsite.name}</h3>
                <p className="text-xs text-muted-foreground">{campsite.location}</p>
                <p className="text-xs text-muted-foreground mt-1">provided by SafeCamp</p>
              </div>
            ))}
          </div>
        )}
        
        <Button variant="link" className="mt-4 px-0 w-full justify-center" onClick={() => navigate("/map")}>
          View all campsites
        </Button>
      </CardContent>
    </Card>
  );
};

export default PopularCampsites;
