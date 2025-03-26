
import { useState, useEffect } from "react";
import { fetchCrimeData, CountyCrimeData, CrimeDataParams } from "@/lib/trip-planner/crime-data-service";
import type { Map } from "mapbox-gl";

interface UseCrimeDataProps {
  map: React.RefObject<Map | null>;
  enabled: boolean;
}

export const useCrimeData = ({ map, enabled }: UseCrimeDataProps) => {
  const [crimeData, setCrimeData] = useState<CountyCrimeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch crime data when the map moves
  useEffect(() => {
    if (!map.current || !enabled) return;

    const handleMapMove = () => {
      if (!map.current || !enabled) return;
      
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      
      setIsLoading(true);
      fetchCrimeData({
        lat: center.lat,
        lng: center.lng,
        zoom
      })
        .then(data => {
          setCrimeData(data);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching crime data:", err);
          setError("Failed to load crime data. Please try again later.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    // Initial fetch
    handleMapMove();

    // Add event listeners
    map.current.on("moveend", handleMapMove);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off("moveend", handleMapMove);
      }
    };
  }, [map, enabled]);

  return {
    crimeData,
    isLoading,
    error
  };
};
