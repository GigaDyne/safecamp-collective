
import React from "react";
import { X, Star, Wifi, Volume2, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampSite } from "@/lib/supabase";

interface CampSiteCardWithPremiumProps {
  site: CampSite;
  onClose: () => void;
  onViewDetails: () => void;
  isPremium?: boolean;
}

const CampSiteCardWithPremium: React.FC<CampSiteCardWithPremiumProps> = ({ 
  site, 
  onClose, 
  onViewDetails,
  isPremium = false
}) => {
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
    <Card className={`shadow-lg border ${isPremium ? 'border-amber-300' : 'border-border/50'} w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 dark:bg-black/70 ${isPremium ? 'bg-gradient-to-r from-amber-50/90 to-white/90 dark:from-amber-950/30 dark:to-black/80' : ''}`}>
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
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg line-clamp-1">{site.name}</h3>
            {isPremium && (
              <Badge className="bg-amber-500 text-white h-5 flex items-center gap-1 px-1.5">
                <Sparkles className="h-3 w-3" /> Premium
              </Badge>
            )}
          </div>
          
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
          className={`w-full gap-1 ${isPremium ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
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

export default CampSiteCardWithPremium;
