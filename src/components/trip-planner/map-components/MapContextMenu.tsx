
import React from 'react';
import { Plus } from 'lucide-react';
import { TripStop } from '@/lib/trip-planner/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';

interface MapContextMenuProps {
  children: React.ReactNode;
  selectedStop: TripStop | null;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
}

const MapContextMenu = ({ 
  children, 
  selectedStop, 
  selectedStops, 
  onAddToItinerary 
}: MapContextMenuProps) => {
  const { toast } = useToast();

  return (
    <ContextMenu>
      <ContextMenuTrigger className="relative h-full w-full">
        {children}
      </ContextMenuTrigger>
      
      {selectedStop && (
        <ContextMenuContent className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border border-border">
          <ContextMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (selectedStop) {
                onAddToItinerary(selectedStop);
                toast({
                  title: "Stop added",
                  description: `Added ${selectedStop.name} to your itinerary`,
                });
              }
            }}
            disabled={selectedStops.some(s => s.id === selectedStop.id)}
          >
            <Plus className="h-4 w-4" />
            <span>Add to Itinerary</span>
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export default MapContextMenu;
