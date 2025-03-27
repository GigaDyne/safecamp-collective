
import { MapProvider } from "@/contexts/MapContext";
import { SearchProvider } from "@/contexts/SearchContext";
import MapViewContainer from "./MapViewContainer";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { useRef } from "react";

interface MapViewProps {
  showCrimeData?: boolean;
}

const MapView = ({ showCrimeData = false }: MapViewProps) => {
  // We don't need the reference as it's handled in the providers
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
