
import React from "react";
import { X, Star, Wifi, Volume2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampSite } from "@/lib/supabase";

interface CampSiteCardProps {
  site: CampSite;
  onClose: () => void;
  onViewDetails: () => void;
}

const CampSiteCard: React.FC<CampSiteCardProps> = ({ site, onClose, onViewDetails }) => {
  // Helper function to render safety stars
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16}
        fill={i < Math.round(rating) ? "currentColor" : "none"} 
        className={i < Math.round(rating) ? "text-yellow-500" : "text-gray-300"} 
      />
    ));
  };

  // Get tags based on site properties
  const getTags = () => {
    const tags = [];
    
    if (site.cellSignal >= 4) tags.push({ label: "Good Signal", icon: <Wifi size={12} className="text-primary" /> });
    else if (site.cellSignal <= 2) tags.push({ label: "Poor Signal", icon: <Wifi size={12} className="text-muted-foreground" /> });
    
    if (site.quietness >= 4) tags.push({ label: "Quiet", icon: <Volume2 size={12} className="text-primary" /> });
    else if (site.quietness <= 2) tags.push({ label: "Noisy", icon: <Volume2 size={12} className="text-muted-foreground" /> });
    
    return tags;
  };

  return (
    <Card className="shadow-lg border border-border/50 w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 dark:bg-black/70">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </div>
      
      <div className="flex flex-row p-4 gap-3">
        {/* Thumbnail on the left */}
        <div className="w-24 h-24 rounded-md bg-muted overflow-hidden flex-shrink-0">
          {site.images && site.images.length > 0 ? (
            <img 
              src={site.images[0]} 
              alt={site.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        
        {/* Site details on the right */}
        <div className="flex flex-col flex-grow">
          <h3 className="font-medium text-lg line-clamp-1">{site.name}</h3>
          
          <div className="flex items-center gap-0.5 my-1">
            {renderStars(site.safetyRating)}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {getTags().map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs flex gap-1 items-center py-0 h-5">
                {tag.icon}
                <span>{tag.label}</span>
              </Badge>
            ))}
            {site.features.slice(0, 1).map((feature, i) => (
              <Badge key={`feature-${i}`} variant="outline" className="text-xs flex gap-1 items-center py-0 h-5">
                <span>{feature}</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <CardFooter className="pt-0 pb-4 px-4">
        <Button 
          className="w-full gap-1" 
          onClick={onViewDetails} 
          variant="default"
        >
          View Details
          <ArrowRight size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampSiteCard;
