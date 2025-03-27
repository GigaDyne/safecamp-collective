import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { Filter, Plus, Route } from "lucide-react";
import { useCampSites, useAddCampSite } from "@/hooks/useCampSites";
import { useViewportCampsites } from "@/hooks/useViewportCampsites";
import { CampSite } from "@/lib/supabase";
import { ensureAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import MapControls from "./MapControls";
import SearchBar from "./SearchBar";
import MapTokenInput from "./MapTokenInput";
import MapInitializerWithPremium from "./MapInitializerWithPremium";
import AddSiteForm from "./AddSiteForm";
import MapFilterDrawer, { FilterCriteria } from "./MapFilterDrawer";
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const localStorageTokenKey = "mapbox_token";

const MapView = ({ showCrimeData = false }) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const { campSites: apiCampSites, isLoading } = useCampSites();
  const { addCampSite } = useAddCampSite();
  const navigate = useNavigate();
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem(localStorageTokenKey) || "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";
  });
  const [tokenEntered, setTokenEntered] = useState(false);
  const [showAddSiteDialog, setShowAddSiteDialog] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filteredCampSites, setFilteredCampSites] = useState<CampSite[]>([]);
  const { toast } = useToast();
  
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    safetyRating: 0,
    cellSignal: 0,
    quietness: 0,
    maxDistance: 50
  });
  
  const [viewportBounds, setViewportBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  
  const [useViewportLoading, setUseViewportLoading] = useState(false);
  
  const { 
    campsites: viewportCampsites, 
    isLoading: isViewportLoading 
  } = useViewportCampsites(viewportBounds, {
    enabled: useViewportLoading && tokenEntered,
    limit: 50,
    debounceMs: 300
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

  const handleTokenSubmit = useCallback((token: string) => {
    setMapboxToken(token);
    localStorage.setItem(localStorageTokenKey, token);
    setTokenEntered(true);
  }, []);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    map.current = mapInstance;
    
    mapInstance.on('moveend', () => {
      const zoom = mapInstance.getZoom();
      const bounds = mapInstance.getBounds();
      
      if (zoom >= 8 && zoom <= 15) {
        setUseViewportLoading(true);
        setViewportBounds({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      } else {
        setUseViewportLoading(false);
      }
    });
    
    const bounds = mapInstance.getBounds();
    const zoom = mapInstance.getZoom();
    if (zoom >= 8 && zoom <= 15) {
      setUseViewportLoading(true);
      setViewportBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    }
  }, []);

  useEffect(() => {
    if (mapboxToken) {
      setTokenEntered(true);
    }
    
    const authenticateUser = async () => {
      try {
        await ensureAuthenticated();
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Authentication Error",
          description: "Unable to authenticate. Some features may be limited.",
          variant: "destructive",
        });
      }
    };
    
    authenticateUser();
  }, [mapboxToken, toast]);

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

  const handleAddSite = useCallback((siteData: any) => {
    const newCampSite: Omit<CampSite, 'id'> = {
      name: siteData.name || `Campsite at ${siteData.latitude.toFixed(4)}, ${siteData.longitude.toFixed(4)}`,
      description: siteData.description || "",
      location: `${siteData.latitude.toFixed(4)}, ${siteData.longitude.toFixed(4)}`,
      coordinates: { lat: siteData.latitude, lng: siteData.longitude },
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      landType: "unknown",
      safetyRating: siteData.safetyRating,
      cellSignal: siteData.cellSignal,
      accessibility: siteData.accessibility || 3, 
      quietness: siteData.noiseLevel,
      features: [
        ...(siteData.isRemote ? ["Remote"] : []),
        ...(siteData.hasWater ? ["Water Source"] : []),
        ...(siteData.hasRestrooms ? ["Restrooms"] : []),
        ...(siteData.isFreeToStay ? ["Free"] : []),
      ],
      images: siteData.images || [],
      reviewCount: 0,
    };

    addCampSite(newCampSite);
    
    setShowAddSiteDialog(false);
    
    if (map.current) {
      map.current.flyTo({
        center: [newCampSite.longitude, newCampSite.latitude],
        zoom: 13,
        essential: true,
      });
    }
  }, [addCampSite]);

  const handleApplyFilters = useCallback((filters: FilterCriteria) => {
    setFilterCriteria(filters);
    
    toast({
      title: "Filters Applied",
      description: `Showing campsites with safety ${filters.safetyRating}+, signal ${filters.cellSignal}+, and quietness ${filters.quietness}+`,
    });
  }, [toast]);

  return (
    <div className="map-container bg-muted/20 relative h-full">
      {!tokenEntered ? (
        <MapTokenInput 
          onTokenSubmit={handleTokenSubmit} 
          defaultToken={mapboxToken}
        />
      ) : null}
      
      <MapInitializerWithPremium 
        mapboxToken={mapboxToken}
        campSites={combinedCampsites}
        isLoading={isLoading || isViewportLoading}
        onMapReady={handleMapReady}
        showCrimeData={showCrimeData}
      />
      
      {useViewportLoading && (
        <div className="absolute top-20 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-20">
          {isViewportLoading ? 'Loading campsites in view...' : `${viewportCampsites?.length || 0} campsites in current view`}
        </div>
      )}
      
      <div className="absolute top-4 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out">
        <SearchBar visible={searchVisible} setVisible={setSearchVisible} />
      </div>
      
      {tokenEntered && <MapControls map={map} />}
      
      {tokenEntered && (
        <>
          <div className="absolute bottom-24 right-4 z-10">
            <Button 
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg animate-fade-in"
              onClick={() => setShowAddSiteDialog(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          
          <Dialog open={showAddSiteDialog} onOpenChange={setShowAddSiteDialog}>
            <DialogContent className="sm:max-w-[425px] p-0">
              <AddSiteForm 
                onSubmit={handleAddSite}
                onCancel={() => setShowAddSiteDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
      
      {tokenEntered && (
        <div className="absolute bottom-24 right-20 z-10">
          <Button 
            variant="default"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg animate-fade-in bg-amber-500 hover:bg-amber-600"
            onClick={() => navigate('/trip-planner')}
            title="Trip Planner"
          >
            <Route className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {tokenEntered && (
        <>
          <div className="absolute bottom-24 left-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full glass-card shadow-lg"
              onClick={() => setShowFilterDrawer(true)}
            >
              <Filter className="h-6 w-6" />
            </Button>
          </div>
          
          <MapFilterDrawer
            open={showFilterDrawer}
            onOpenChange={setShowFilterDrawer}
            filters={filterCriteria}
            onApplyFilters={handleApplyFilters}
          />
        </>
      )}
    </div>
  );
};

export default MapView;
