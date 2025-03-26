
import { useState, useEffect } from "react";
import { fetchCrimeData, CountyCrimeData } from "@/lib/trip-planner/crime-data-service";
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
      
      // Ensure fetchCrimeData is called only when map is ready
      try {
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
            setCrimeData([]); // Reset data on error
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (err) {
        console.error("Error initiating crime data fetch:", err);
        setError("Failed to start crime data fetch.");
        setIsLoading(false);
        setCrimeData([]);
      }
    };

    // Initial fetch - wrap in a try/catch to handle any initialization errors
    try {
      handleMapMove();

      // Add event listeners
      map.current.on("moveend", handleMapMove);
    } catch (err) {
      console.error("Error setting up map event listeners:", err);
      setError("Failed to initialize crime data functionality.");
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        try {
          map.current.off("moveend", handleMapMove);
        } catch (err) {
          console.error("Error removing map event listener:", err);
        }
      }
    };
  }, [map, enabled]);

  return {
    crimeData,
    isLoading,
    error
  };
};
