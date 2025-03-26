
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapLegendProps {
  showCrimeData?: boolean;
}

const MapLegend = ({ showCrimeData = false }: MapLegendProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`absolute ${isMobile ? 'bottom-16' : 'bottom-4'} right-4 bg-background/90 rounded-md shadow-md border border-border p-2 text-xs min-w-[200px] max-h-[300px] overflow-y-auto`}
      style={{ maxHeight: isMobile ? 'calc(100vh - 170px)' : 'calc(100vh - 100px)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">Map Legend</span>
        <HoverCard>
          <HoverCardTrigger asChild>
            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="text-xs space-y-1">
              <p>Icons on the map represent different types of stops.</p>
              {showCrimeData && (
                <p className="text-amber-600">
                  Colored circles show crime data. Red areas have higher crime rates, green areas are safer.
                </p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-green-600"></div>
          <span>Campsite</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span>Gas Station</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span>Water</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
          <span>Dump Station</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-600"></div>
          <span>Walmart</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-orange-500"></div>
          <span>Propane</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-zinc-700"></div>
          <span>Repair Shop</span>
        </div>
      </div>
      
      {showCrimeData && (
        <div className="border-t border-border/50 mt-2 pt-2">
          <p className="font-semibold text-[10px] mb-1">Crime Data</p>
          <div className="flex items-center">
            <div className="h-2 flex-1 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded-sm"></div>
          </div>
          <div className="flex justify-between text-[9px] mt-0.5">
            <span>High Crime</span>
            <span>Low Crime</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
