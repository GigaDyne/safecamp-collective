
import { useState } from "react";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Shield, Wifi, MapPin, Volume2 } from "lucide-react";

export interface FilterCriteria {
  safetyRating: number;
  cellSignal: number;
  quietness: number;
  maxDistance: number; // in miles
}

interface MapFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterCriteria;
  onApplyFilters: (filters: FilterCriteria) => void;
}

const MapFilterDrawer = ({ 
  open, 
  onOpenChange, 
  filters,
  onApplyFilters
}: MapFilterDrawerProps) => {
  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);

  const handleReset = () => {
    const resetFilters = {
      safetyRating: 0,
      cellSignal: 0,
      quietness: 0,
      maxDistance: 50
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filter Campsites</DrawerTitle>
          <DrawerDescription>
            Adjust the sliders to filter campsite results
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 pb-4 space-y-6">
          {/* Safety Rating Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-safe" />
                <span className="text-sm font-medium">Safety Rating</span>
              </div>
              <span className="text-sm">{localFilters.safetyRating}/5+</span>
            </div>
            <Slider
              value={[localFilters.safetyRating]}
              max={5}
              step={1}
              onValueChange={(value) => 
                setLocalFilters({...localFilters, safetyRating: value[0]})
              }
            />
          </div>
          
          {/* Cell Signal Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Cell Signal</span>
              </div>
              <span className="text-sm">{localFilters.cellSignal}/5+</span>
            </div>
            <Slider
              value={[localFilters.cellSignal]}
              max={5}
              step={1}
              onValueChange={(value) => 
                setLocalFilters({...localFilters, cellSignal: value[0]})
              }
            />
          </div>
          
          {/* Quietness Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Quietness</span>
              </div>
              <span className="text-sm">{localFilters.quietness}/5+</span>
            </div>
            <Slider
              value={[localFilters.quietness]}
              max={5}
              step={1}
              onValueChange={(value) => 
                setLocalFilters({...localFilters, quietness: value[0]})
              }
            />
          </div>
          
          {/* Distance Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Max Distance</span>
              </div>
              <span className="text-sm">{localFilters.maxDistance} miles</span>
            </div>
            <Slider
              value={[localFilters.maxDistance]}
              min={5}
              max={100}
              step={5}
              onValueChange={(value) => 
                setLocalFilters({...localFilters, maxDistance: value[0]})
              }
            />
          </div>
        </div>
        <DrawerFooter className="flex-row gap-2 justify-end">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MapFilterDrawer;
