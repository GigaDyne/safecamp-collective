
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Search } from "lucide-react";
import { mockCampSites } from "@/data/mockData";
import { useCampSites } from "@/hooks/useCampSites";
import MapControls from "./MapControls";
import MapFilterButton from "./MapFilterButton";
import SearchBar from "./SearchBar";
import MapTokenInput from "./MapTokenInput";
import MapInitializer from "./MapInitializer";
import AddSiteButton from "./AddSiteButton";

// This will store the token once provided by the user
let mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";

const MapView = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const { campSites, isLoading } = useCampSites();
  const [tokenEntered, setTokenEntered] = useState(false);

  // Handle token submission
  const handleTokenSubmit = (token: string) => {
    mapboxToken = token;
    setTokenEntered(true);
  };

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token") || mapboxToken;
    if (savedToken) {
      mapboxToken = savedToken;
      setTokenEntered(true);
    }
  }, []);

  return (
    <div className="map-container bg-muted/20 relative h-full">
      {!tokenEntered ? (
        <MapTokenInput 
          onTokenSubmit={handleTokenSubmit} 
          defaultToken={mapboxToken}
        />
      ) : null}
      
      {/* Map Container */}
      <MapInitializer 
        mapboxToken={mapboxToken}
        campSites={campSites || mockCampSites}
        isLoading={isLoading}
      />
      
      {/* Search Bar */}
      <div className="absolute top-4 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out">
        <SearchBar visible={searchVisible} setVisible={setSearchVisible} />
      </div>
      
      {/* Map Controls */}
      {tokenEntered && <MapControls map={map} />}
      
      {/* Add New Camp Site Button */}
      {tokenEntered && <AddSiteButton />}
      
      {/* Map Filter Button */}
      {tokenEntered && <MapFilterButton />}
    </div>
  );
};

export default MapView;
