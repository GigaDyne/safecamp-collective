
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
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation && map.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 14,
              essential: true,
            });
          }
        },
        () => {
          // If geolocation fails, center on Austin
          if (map.current) {
            map.current.flyTo({
              center: [-97.7431, 30.2672], // Austin, Texas
              zoom: 10,
              essential: true,
            });
          }
          console.log("Unable to get user location, defaulting to Austin");
        }
      );
    } else if (map.current) {
      // If geolocation is not available, center on Austin
      map.current.flyTo({
        center: [-97.7431, 30.2672], // Austin, Texas
        zoom: 10,
        essential: true,
      });
    }
  };

  const handleLayerChange = (style: string) => {
    if (map.current) {
      map.current.setStyle(`mapbox://styles/mapbox/${style}`);
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
          <DropdownMenuItem onClick={() => handleLayerChange("outdoors-v12")}>
            Outdoors
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange("satellite-streets-v12")}>
            Satellite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange("light-v11")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayerChange("dark-v11")}>
            Dark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MapControls;
