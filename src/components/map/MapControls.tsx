
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
      <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col divide-y divide-gray-200 dark:divide-slate-700">
          <Button 
            variant="ghost" 
            className="h-12 w-12 rounded-none hover:bg-gray-100 dark:hover:bg-slate-700" 
            onClick={handleZoomIn}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            className="h-12 w-12 rounded-none hover:bg-gray-100 dark:hover:bg-slate-700" 
            onClick={handleZoomOut}
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="h-12 w-12 bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
        onClick={handleLocate}
      >
        <Compass className="h-5 w-5" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-12 w-12 bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <Layers className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 shadow-lg">
          <DropdownMenuItem onClick={() => handleLayerChange('roadmap')} className="cursor-pointer">
            Standard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange('satellite')} className="cursor-pointer">
            Satellite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange('hybrid')} className="cursor-pointer">
            Hybrid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange('terrain')} className="cursor-pointer">
            Terrain
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MapControls;
