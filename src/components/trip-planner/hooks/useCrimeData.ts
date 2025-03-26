
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
  const [isMockData, setIsMockData] = useState<boolean>(false);

  // Fetch crime data when the map moves
  useEffect(() => {
    if (!map.current || !enabled) {
      console.log("Crime data disabled or map not available");
      return;
    }

    const handleMapMove = () => {
      if (!map.current || !enabled) return;
      
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      
      console.log("Fetching crime data for", center.lat, center.lng, "at zoom", zoom);
      setIsLoading(true);
      
      // Ensure fetchCrimeData is called only when map is ready
      try {
        fetchCrimeData({
          lat: center.lat,
          lng: center.lng,
          zoom
        })
          .then(data => {
            console.log("Received crime data:", data.length, "counties");
            setCrimeData(data);
            
            // Set isMockData based on a simple heuristic - real data from FBI would have 
            // county names that aren't just "County 1", "County 2", etc.
            const hasMockCountyNames = data.some(county => 
              county.county_name.match(/County \d+/) !== null
            );
            
            setIsMockData(hasMockCountyNames);
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
      console.log("Setting up crime data fetch");
      // Only fetch if the map is loaded
      if (map.current.loaded()) {
        console.log("Map is loaded, fetching crime data now");
        handleMapMove();
      } else {
        console.log("Map not loaded yet, waiting for load event");
        map.current.once('load', () => {
          console.log("Map loaded, now fetching crime data");
          handleMapMove();
        });
      }

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
    error,
    isMockData
  };
};
