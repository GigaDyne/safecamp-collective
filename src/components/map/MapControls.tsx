
import { Button } from "@/components/ui/button";
import { Plus, Minus, Compass, Layers } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMapContext } from "@/contexts/MapContext";

const MapControls = () => {
  const { map } = useMapContext();

  const handleZoomIn = () => {
    if (map.current) {
      // @ts-ignore - Temporarily ignore type issues during transition
      const zoom = map.current.getZoom();
      if (zoom !== undefined) {
        // @ts-ignore
        map.current.setZoom(zoom + 1);
      }
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      // @ts-ignore - Temporarily ignore type issues during transition
      const zoom = map.current.getZoom();
      if (zoom !== undefined) {
        // @ts-ignore
        map.current.setZoom(zoom - 1);
      }
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation && map.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            // @ts-ignore - Temporarily ignore type issues during transition
            map.current.panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            // @ts-ignore
            map.current.setZoom(14);
          }
        },
        () => {
          // If geolocation fails, center on Austin
          if (map.current) {
            // @ts-ignore - Temporarily ignore type issues during transition
            map.current.panTo({
              lat: 30.2672, 
              lng: -97.7431 // Austin, Texas
            });
            // @ts-ignore
            map.current.setZoom(10);
          }
          console.log("Unable to get user location, defaulting to Austin");
        }
      );
    } else if (map.current) {
      // If geolocation is not available, center on Austin
      // @ts-ignore - Temporarily ignore type issues during transition
      map.current.panTo({
        lat: 30.2672, 
        lng: -97.7431 // Austin, Texas
      });
      // @ts-ignore
      map.current.setZoom(10);
    }
  };

  const handleLayerChange = (mapTypeId: string) => {
    if (map.current) {
      // @ts-ignore - Temporarily ignore type issues during transition
      map.current.setMapTypeId(mapTypeId);
    }
  };

  return (
    <div className="absolute right-4 top-20 z-10 flex flex-col gap-2">
      <div className="glass-card rounded-lg overflow-hidden shadow-md">
        <div className="flex flex-col divide-y divide-border/30">
          <Button 
            variant="ghost" 
            className="h-10 px-2 rounded-none hover:bg-white/10" 
            onClick={handleZoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="h-10 px-2 rounded-none hover:bg-white/10" 
            onClick={handleZoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="glass-card h-10 w-10 shadow-md"
        onClick={handleLocate}
      >
        <Compass className="h-4 w-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            size="icon" 
            className="glass-card h-10 w-10 shadow-md"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleLayerChange('roadmap')}>
            Standard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange('satellite')}>
            Satellite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange('hybrid')}>
            Hybrid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange('terrain')}>
            Terrain
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MapControls;
