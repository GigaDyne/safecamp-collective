
import { useMapContext, MapProvider } from "@/contexts/MapContext";
import { SearchProvider } from "@/contexts/SearchContext";
import MapViewContainer from "./MapViewContainer";

interface MapViewProps {
  showCrimeData?: boolean;
}

const MapView = ({ showCrimeData = false }: MapViewProps) => {
  return (
    <MapProvider>
      <SearchProvider>
        <MapViewContainer showCrimeData={showCrimeData} />
      </SearchProvider>
    </MapProvider>
  );
};

export default MapView;
