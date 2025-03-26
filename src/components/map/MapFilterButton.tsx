
import { useState } from "react";
import { Filter, Wifi, MapPin, Volume2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MapFilterButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [safetyFilter, setSafetyFilter] = useState([0]);
  const [cellSignalFilter, setCellSignalFilter] = useState([0]);
  const [accessibilityFilter, setAccessibilityFilter] = useState([0]);
  const [noiseFilter, setNoiseFilter] = useState([0]);

  return (
    <div className="absolute bottom-24 left-4 z-10">
      <Button
        variant="secondary"
        size="icon"
        className="h-14 w-14 rounded-full glass-card shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className={cn(
          "h-6 w-6 transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Filter Panel */}
      <div className={cn(
        "absolute bottom-16 left-0 transform transition-all duration-300 ease-in-out glass-card rounded-xl p-4 w-64 shadow-xl",
        isOpen 
          ? "translate-y-0 opacity-100" 
          : "translate-y-4 opacity-0 pointer-events-none"
      )}>
        <h3 className="font-medium text-sm mb-4">Filter Camp Sites</h3>
        
        <div className="space-y-6">
          {/* Safety Rating Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Safety Rating</span>
              </div>
              <span className="text-xs">{safetyFilter[0]}/5+</span>
            </div>
            <Slider
              defaultValue={[0]}
              max={5}
              step={1}
              value={safetyFilter}
              onValueChange={setSafetyFilter}
              className="h-1.5"
            />
          </div>
          
          {/* Cell Signal Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Cell Signal</span>
              </div>
              <span className="text-xs">{cellSignalFilter[0]}/5+</span>
            </div>
            <Slider
              defaultValue={[0]}
              max={5}
              step={1}
              value={cellSignalFilter}
              onValueChange={setCellSignalFilter}
              className="h-1.5"
            />
          </div>
          
          {/* Accessibility Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Accessibility</span>
              </div>
              <span className="text-xs">{accessibilityFilter[0]}/5+</span>
            </div>
            <Slider
              defaultValue={[0]}
              max={5}
              step={1}
              value={accessibilityFilter}
              onValueChange={setAccessibilityFilter}
              className="h-1.5"
            />
          </div>
          
          {/* Noise Level Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Quietness</span>
              </div>
              <span className="text-xs">{noiseFilter[0]}/5+</span>
            </div>
            <Slider
              defaultValue={[0]}
              max={5}
              step={1}
              value={noiseFilter}
              onValueChange={setNoiseFilter}
              className="h-1.5"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9"
              onClick={() => {
                setSafetyFilter([0]);
                setCellSignalFilter([0]);
                setAccessibilityFilter([0]);
                setNoiseFilter([0]);
              }}
            >
              Reset
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs h-9"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFilterButton;
