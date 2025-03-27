
import { createContext, useContext, useState, useRef, ReactNode, MutableRefObject } from "react";

// Define the Google Maps types
interface GoogleMapsContextType {
  map: MutableRefObject<google.maps.Map | null>;
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  googleMapsKey: string;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const map = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";

  return (
    <GoogleMapsContext.Provider
      value={{
        map,
        isLoaded,
        setIsLoaded,
        googleMapsKey,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMapsContext() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMapsContext must be used within a GoogleMapsProvider");
  }
  return context;
}
