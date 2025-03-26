
import { MouseEvent as ReactMouseEvent } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Star, Wifi, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CampSite } from "@/hooks/useCampSites";

interface MapPinProps {
  site: CampSite;
  onClick: (e: ReactMouseEvent, siteId: string) => void;
}

// Helper function to create a custom map pin element
export const createMapPinElement = (safetyRating: number, onClick?: (e: MouseEvent) => void) => {
  // Create the pin container
  const pinElement = document.createElement('div');
  pinElement.className = 'relative flex items-center justify-center';
  
  // Create the pin
  const pin = document.createElement('div');
  pin.className = 'w-10 h-10 flex items-center justify-center transform-gpu transition-all duration-300 hover:scale-110 cursor-pointer';
  
  if (onClick) {
    // Need to use a native DOM event listener here
    pin.addEventListener('click', onClick);
  }
  
  // Determine pin color based on safety rating
  let pinColor: string;
  if (safetyRating >= 4) {
    pinColor = 'bg-safe';
  } else if (safetyRating >= 2.5) {
    pinColor = 'bg-caution';
  } else {
    pinColor = 'bg-danger';
  }
  
  // Apply pin styles with pulse effect
  pin.innerHTML = `
    <div class="relative">
      <div class="absolute -top-1 -left-1 w-8 h-8 ${pinColor} opacity-20 rounded-full pin-pulse"></div>
      <div class="w-6 h-6 ${pinColor} rounded-full flex items-center justify-center shadow-md">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    </div>
  `;
  
  pinElement.appendChild(pin);
  return pinElement;
};

const MapPin = ({ site, onClick }: MapPinProps) => {
  const handleClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onClick(e, site.id);
  };

  // Helper function to render safety stars
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14}
        fill={i < rating ? "currentColor" : "none"} 
        className={i < rating ? "text-yellow-500" : "text-gray-300"} 
      />
    ));
  };

  // Get tags based on site properties
  const getTags = () => {
    const tags = [];
    
    if (site.cellSignal >= 4) tags.push({ label: "Good Signal", icon: <Wifi size={12} /> });
    else if (site.cellSignal <= 2) tags.push({ label: "Poor Signal", icon: <Wifi size={12} /> });
    
    if (site.quietness >= 4) tags.push({ label: "Quiet", icon: <Volume2 size={12} /> });
    else if (site.quietness <= 2) tags.push({ label: "Noisy", icon: <Volume2 size={12} /> });
    
    if (site.safetyRating <= 2) tags.push({ label: "Sketchy", icon: null });
    
    return tags;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div onClick={handleClick} className="cursor-pointer">
          {/* Pin content goes here - this is just for the Popover, actual pin is created elsewhere */}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">{site.name}</h3>
          
          <div className="flex items-center gap-1">
            {renderStars(site.safetyRating)}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {getTags().map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs flex gap-1 items-center py-0 h-5">
                {tag.icon}
                <span>{tag.label}</span>
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MapPin;
