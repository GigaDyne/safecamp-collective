
import { useState, useEffect } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type LocationHookReturn = {
  location: Coordinates | null;
  error: string | null;
  isLoading: boolean;
  getLocation: () => Promise<Coordinates | null>;
};

export function useLocation(): LocationHookReturn {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getLocation = async (): Promise<Coordinates | null> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const coordinates: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(coordinates);
      setIsLoading(false);
      return coordinates;
    } catch (err) {
      const errorMessage = err instanceof GeolocationPositionError
        ? getPositionErrorMessage(err)
        : "An unknown error occurred";
        
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Get the location on mount
  useEffect(() => {
    getLocation();
  }, []);

  return { location, error, isLoading, getLocation };
}

// Helper function to get user-friendly error messages
function getPositionErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. Please enable location services to use this feature.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable. Please try again later.";
    case error.TIMEOUT:
      return "The request to get your location timed out. Please try again.";
    default:
      return "An unknown error occurred while trying to get your location.";
  }
}
