import { createContext, useContext, useState, useRef, ReactNode } from "react";
import mapboxgl from "mapbox-gl";

interface MapContextType {
  map: React.RefObject<mapboxgl.Map | null>;
  tokenEntered: boolean;
  setTokenEntered: (entered: boolean) => void;
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  useViewportLoading: boolean;
  setUseViewportLoading: (loading: boolean) => void;
  viewportBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
  setViewportBounds: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null) => void;
  showAddSiteDialog: boolean;
  setShowAddSiteDialog: (show: boolean) => void;
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  showMissingSiteDialog: boolean;
  setShowMissingSiteDialog: (show: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const map = useRef<mapboxgl.Map | null>(null);
  const [tokenEntered, setTokenEntered] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    const localStorageTokenKey = "mapbox_token";
    return localStorage.getItem(localStorageTokenKey) || "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
  });
  const [useViewportLoading, setUseViewportLoading] = useState(false);
  const [viewportBounds, setViewportBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [showAddSiteDialog, setShowAddSiteDialog] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showMissingSiteDialog, setShowMissingSiteDialog] = useState(false);

  return (
    <MapContext.Provider
      value={{
        map,
        tokenEntered,
        setTokenEntered,
        mapboxToken,
        setMapboxToken,
        useViewportLoading,
        setUseViewportLoading,
        viewportBounds,
        setViewportBounds,
        showAddSiteDialog,
        setShowAddSiteDialog,
        showFilterDrawer,
        setShowFilterDrawer,
        showMissingSiteDialog,
        setShowMissingSiteDialog,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
}
