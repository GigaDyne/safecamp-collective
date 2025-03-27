
import { useMapContext, MapProvider } from "@/contexts/MapContext";
import MapViewContainer from "./MapViewContainer";

interface MapViewProps {
  showCrimeData?: boolean;
}

const MapView = ({ showCrimeData = false }: MapViewProps) => {
  return (
    <MapProvider>
      <MapViewContainer showCrimeData={showCrimeData} />
    </MapProvider>
  );
};

export default MapView;
