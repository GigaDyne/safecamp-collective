import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { Filter, Plus, Route, MapPin } from "lucide-react";
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
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [showMissingSiteDialog, setShowMissingSiteDialog] = useState(false);
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
      source: 'supabase'
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
      
      {missingCampsites && (
        <button 
          onClick={() => setShowMissingSiteDialog(true)}
          className="absolute top-32 left-4 bg-amber-100 text-amber-900 text-sm py-1 px-3 rounded-full shadow-sm border border-amber-300 z-20 flex items-center gap-2 hover:bg-amber-200 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span>Map shows unmarked campsites - Click to add them</span>
        </button>
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
          
          <Dialog open={showMissingSiteDialog} onOpenChange={setShowMissingSiteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Missing Campsites</DialogTitle>
                <DialogDescription>
                  We've detected campground labels on the map that aren't in our database. Would you like to add them?
                </DialogDescription>
              </DialogHeader>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 my-4">
                {viewportCampsites?.filter(site => site.source === 'mapbox').map(site => (
                  <div key={site.id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <p className="font-medium text-sm">{site.name}</p>
                      <p className="text-xs text-muted-foreground">{site.location}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const siteData = {
                          name: site.name,
                          latitude: site.latitude,
                          longitude: site.longitude,
                          description: "Found on map",
                          safetyRating: 3,
                          cellSignal: 3,
                          noiseLevel: 3,
                          accessibility: 3,
                          isFreeToStay: true
                        };
                        
                        handleAddSite(siteData);
                        toast({
                          title: "Campsite Added",
                          description: `${site.name} has been added to our database.`,
                        });
                      }}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMissingSiteDialog(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    const missingSites = viewportCampsites?.filter(site => site.source === 'mapbox') || [];
                    let added = 0;
                    
                    missingSites.forEach(site => {
                      const siteData = {
                        name: site.name,
                        latitude: site.latitude,
                        longitude: site.longitude,
                        description: "Found on map",
                        safetyRating: 3,
                        cellSignal: 3,
                        noiseLevel: 3,
                        accessibility: 3,
                        isFreeToStay: true
                      };
                      
                      addCampSite(siteData);
                      added++;
                    });
                    
                    setShowMissingSiteDialog(false);
                    
                    if (added > 0) {
                      toast({
                        title: "Campsites Added",
                        description: `Added ${added} new campsites to our database.`,
                      });
                    }
                  }}
                >
                  Add All
                </Button>
              </DialogFooter>
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
