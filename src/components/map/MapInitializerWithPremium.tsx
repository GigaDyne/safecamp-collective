import { useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/lib/supabase";
import { AnimatePresence } from "framer-motion";
import { usePremiumCampsites } from "@/hooks/usePremiumCampsites";
import { useCrimeData } from "@/components/trip-planner/hooks/useCrimeData";
import { useCrimeLayer } from "@/components/trip-planner/hooks/useCrimeLayer";
import { Badge } from "@/components/ui/badge";
import { useMapInitializer } from "@/hooks/useMapInitializer";
import { useMapContextMenu } from "@/hooks/useMapContextMenu";
import { useMapPopup } from "@/hooks/useMapPopup";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import AddSiteDialog from "./AddSiteDialog";
import SelectedSiteInfo from "./SelectedSiteInfo";
import { useMemo } from "react";

interface MapInitializerWithPremiumProps {
  mapboxToken: string;
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  onMapReady?: (map: mapboxgl.Map) => void;
  showCrimeData?: boolean;
}

const MapInitializerWithPremium = ({ 
  mapboxToken, 
  campSites, 
  isLoading, 
  onMapReady,
  showCrimeData = false
}: MapInitializerWithPremiumProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [locationToAdd, setLocationToAdd] = useState<{latitude: number, longitude: number} | null>(null);

  const { data: premiumCampsites = [], isLoading: isPremiumLoading } = usePremiumCampsites();
  
  const premiumCampsiteIds = useMemo(() => {
    return new Set(premiumCampsites.map(pc => pc.campsite_id));
  }, [premiumCampsites]);
  
  const { mapContainer, map, isMapLoaded } = useMapInitializer({ 
    mapboxToken, 
    onMapReady 
  });

  useEffect(() => {
    if (map.current && isMapLoaded) {
      map.current.setCenter([-97.7431, 30.2672]);
      map.current.setZoom(10);
    }
  }, [isMapLoaded]);

  const { 
    selectedSite, 
    selectedSiteIsPremium, 
    showPopup,
    showSitePopup,
    handleAddToTrip,
    handleGetDirections,
    handleSubmitLocation,
    clearPopup
  } = useMapPopup({ map });

  const { setLocationToAdd: setContextMenuLocation } = useMapContextMenu({
    map,
    onShowAddLocationDialog: (location) => {
      setLocationToAdd({ latitude: location.lat, longitude: location.lng });
      setShowAddLocationDialog(true);
    }
  });

  useMapMarkers({
    map,
    campSites,
    isLoading,
    isMapLoaded,
    premiumCampsiteIds,
    onSiteClick: showSitePopup
  });

  const { crimeData, isLoading: isCrimeDataLoading, isMockData } = useCrimeData({
    map,
    enabled: showCrimeData && isMapLoaded
  });

  useCrimeLayer({
    map,
    crimeData,
    showCrimeData: showCrimeData && isMapLoaded,
    onMarkerClick: (data) => {
      toast({
        title: `${data.county_name}, ${data.state_abbr}`,
        description: `Safety score: ${data.safety_score}/100`,
        variant: "default"
      });
    }
  });

  const handleAddSiteSubmission = (formData: any) => {
    toast({
      title: "Location submitted",
      description: "Thank you for contributing to SafeCamp!",
    });
    setShowAddLocationDialog(false);
    setLocationToAdd(null);
  };

  const handleExistingSiteSubmission = (site: CampSite) => {
    setLocationToAdd({
      latitude: site.latitude, 
      longitude: site.longitude
    });
    setShowAddLocationDialog(true);
  };

  return (
    <div ref={mapContainer} className="w-full h-full bg-muted/20 animate-fade-in relative">
      {isCrimeDataLoading && showCrimeData && (
        <div className="absolute top-4 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-20">
          Loading crime data...
        </div>
      )}
      
      {showCrimeData && crimeData.length > 0 && (
        <div className="absolute top-4 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-20 flex items-center space-x-2">
          <span>Showing crime data for {crimeData.length} areas</span>
          {isMockData && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
              MOCK DATA
            </Badge>
          )}
          {!isMockData && (
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
              REAL DATA
            </Badge>
          )}
        </div>
      )}
      
      <AddSiteDialog 
        open={showAddLocationDialog} 
        onOpenChange={setShowAddLocationDialog}
        location={locationToAdd}
        onSubmit={handleAddSiteSubmission}
      />
      
      <AnimatePresence>
        {selectedSite && !showPopup && (
          <SelectedSiteInfo
            site={selectedSite}
            onClose={() => clearPopup()}
            onAddToTrip={handleAddToTrip}
            onGetDirections={handleGetDirections}
            onSubmitLocation={handleExistingSiteSubmission}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapInitializerWithPremium;
