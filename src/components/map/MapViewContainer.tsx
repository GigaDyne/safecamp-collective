
import { useState, useEffect, useMemo } from "react";
import { Filter, Plus, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/lib/supabase";
import { useMapContext } from "@/contexts/MapContext";
import { useCampSites } from "@/hooks/useCampSites";
import { useViewportCampsites } from "@/hooks/viewport-campsites";
import MapVisualizer from "./MapVisualizer";
import SearchBar from "./SearchBar";
import MapTokenInput from "./MapTokenInput";
import MapControls from "./MapControls";
import MissingSitesButton from "./MissingSitesButton";
import ViewportIndicator from "./ViewportIndicator";
import MapActionButtons from "./MapActionButtons";

interface MapViewContainerProps {
  showCrimeData?: boolean;
}

const MapViewContainer = ({ showCrimeData = false }: MapViewContainerProps) => {
  const {
    tokenEntered,
    setTokenEntered,
    mapboxToken,
    setMapboxToken,
    map,
    useViewportLoading,
    viewportBounds
  } = useMapContext();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchVisible, setSearchVisible] = useState(false);
  const { campSites: apiCampSites, isLoading } = useCampSites();
  const [filterCriteria, setFilterCriteria] = useState({
    safetyRating: 0,
    cellSignal: 0,
    quietness: 0,
    maxDistance: 50
  });
  const [filteredCampSites, setFilteredCampSites] = useState<CampSite[]>([]);
  
  const { 
    campsites: viewportCampsites, 
    isLoading: isViewportLoading,
    missingCampsites,
  } = useViewportCampsites(viewportBounds, {
    enabled: useViewportLoading && tokenEntered,
    limit: 50,
    debounceMs: 300,
    includeMapboxPOIs: true,
    map: map.current
  });
  
  const combinedCampsites = useMemo(() => {
    if (!useViewportLoading) {
      return filteredCampSites.length > 0 ? filteredCampSites : apiCampSites || [];
    }
    
    const allCampsites = [...(viewportCampsites || [])];
    
    if (filteredCampSites.length > 0) {
      filteredCampSites.forEach(site => {
        if (!allCampsites.some(c => c.id === site.id)) {
          allCampsites.push(site);
        }
      });
    } else if (apiCampSites) {
      apiCampSites.forEach(site => {
        if (!allCampsites.some(c => c.id === site.id)) {
          allCampsites.push(site);
        }
      });
    }
    
    return allCampsites;
  }, [useViewportLoading, filteredCampSites, apiCampSites, viewportCampsites]);

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    localStorage.setItem("mapbox_token", token);
    setTokenEntered(true);
  };
  
  useEffect(() => {
    if (mapboxToken) {
      setTokenEntered(true);
    }
  }, [mapboxToken, setTokenEntered]);

  useEffect(() => {
    if (apiCampSites) {
      const filtered = apiCampSites.filter(site => 
        site.safetyRating >= filterCriteria.safetyRating &&
        site.cellSignal >= filterCriteria.cellSignal &&
        site.quietness >= filterCriteria.quietness
      );
      
      setFilteredCampSites(filtered);
    }
  }, [apiCampSites, filterCriteria]);

  const handleApplyFilters = (filters: any) => {
    setFilterCriteria(filters);
    
    toast({
      title: "Filters Applied",
      description: `Showing campsites with safety ${filters.safetyRating}+, signal ${filters.cellSignal}+, and quietness ${filters.quietness}+`,
    });
  };

  useEffect(() => {
    if (missingCampsites) {
      toast({
        title: "Additional Campsites Found",
        description: "We've found campsites on the map that aren't in our database. Click the banner to add them.",
        duration: 7000,
      });
    }
  }, [missingCampsites, toast]);

  return (
    <div className="map-container bg-muted/20 relative h-full">
      {!tokenEntered ? (
        <MapTokenInput 
          onTokenSubmit={handleTokenSubmit} 
          defaultToken={mapboxToken}
        />
      ) : null}
      
      <MapVisualizer
        mapboxToken={mapboxToken}
        campSites={combinedCampsites}
        isLoading={isLoading || isViewportLoading}
        showCrimeData={showCrimeData}
      />
      
      {useViewportLoading && (
        <ViewportIndicator isLoading={isViewportLoading} campsiteCount={viewportCampsites?.length || 0} />
      )}
      
      {missingCampsites && <MissingSitesButton />}
      
      <div className="absolute top-4 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out">
        <SearchBar visible={searchVisible} setVisible={setSearchVisible} />
      </div>
      
      {tokenEntered && <MapControls />}
      {tokenEntered && <MapActionButtons onApplyFilters={handleApplyFilters} />}
    </div>
  );
};

export default MapViewContainer;
