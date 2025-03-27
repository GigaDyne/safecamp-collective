
import { MapProvider } from "@/contexts/MapContext";
import { SearchProvider } from "@/contexts/SearchContext";
import MapViewContainer from "./MapViewContainer";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

interface MapViewProps {
  showCrimeData?: boolean;
}

const MapView = ({ showCrimeData = false }: MapViewProps) => {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <SearchProvider>
          <MapViewContainer showCrimeData={showCrimeData} />
        </SearchProvider>
      </MapProvider>
    </GoogleMapsProvider>
  );
};

export default MapView;
