import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Search, Filter, Plus, X } from "lucide-react";
import { mockCampSites } from "@/data/mockData";
import { useCampSites, CampSite } from "@/hooks/useCampSites";
import { useToast } from "@/hooks/use-toast";
import MapControls from "./MapControls";
import MapFilterButton from "./MapFilterButton";
import SearchBar from "./SearchBar";
import MapTokenInput from "./MapTokenInput";
import MapInitializer from "./MapInitializer";
import AddSiteButton from "./AddSiteButton";
import AddSiteForm from "./AddSiteForm";
import MapFilterDrawer, { FilterCriteria } from "./MapFilterDrawer";
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// This will store the token once provided by the user
let mapboxToken = "pk.eyJ1IjoianRvdzUxMiIsImEiOiJjbThweWpkZzAwZjc4MmpwbjN0a28zdG56In0.ntV0C2ozH2xs8T5enECjyg";

// In-memory storage for user-submitted campsites (would be replaced by Supabase/Firebase)
const userSubmittedCampSites: CampSite[] = [];

const MapView = () => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const { campSites: apiCampSites, isLoading } = useCampSites();
  const [tokenEntered, setTokenEntered] = useState(false);
  const [showAddSiteDialog, setShowAddSiteDialog] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [allCampSites, setAllCampSites] = useState<CampSite[]>([]);
  const [filteredCampSites, setFilteredCampSites] = useState<CampSite[]>([]);
  const { toast } = useToast();
  
  // Initial filter criteria
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    safetyRating: 0,
    cellSignal: 0,
    quietness: 0,
    maxDistance: 50
  });

  // Handle token submission
  const handleTokenSubmit = (token: string) => {
    mapboxToken = token;
    localStorage.setItem("mapbox_token", token);
    setTokenEntered(true);
  };

  // Store map reference when the map is ready
  const handleMapReady = (mapInstance: mapboxgl.Map) => {
    map.current = mapInstance;
  };

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token") || mapboxToken;
    if (savedToken) {
      mapboxToken = savedToken;
      setTokenEntered(true);
    }
  }, []);

  // Combine API and user-submitted campsites
  useEffect(() => {
    if (apiCampSites) {
      setAllCampSites([...apiCampSites, ...userSubmittedCampSites]);
    } else {
      setAllCampSites([...mockCampSites, ...userSubmittedCampSites]);
    }
  }, [apiCampSites, userSubmittedCampSites]);

  // Apply filters to campsites
  useEffect(() => {
    const filtered = allCampSites.filter(site => 
      site.safetyRating >= filterCriteria.safetyRating &&
      site.cellSignal >= filterCriteria.cellSignal &&
      site.quietness >= filterCriteria.quietness
      // Distance filter would be applied here in a real implementation
    );
    
    setFilteredCampSites(filtered);
  }, [allCampSites, filterCriteria]);

  // Handle campsite submission
  const handleAddSite = (siteData: any) => {
    // Convert form data to CampSite format
    const newCampSite: CampSite = {
      id: siteData.id || String(Date.now()),
      name: siteData.name || `Campsite at ${siteData.latitude.toFixed(4)}, ${siteData.longitude.toFixed(4)}`,
      description: siteData.description || "",
      location: `${siteData.latitude.toFixed(4)}, ${siteData.longitude.toFixed(4)}`,
      coordinates: { lat: siteData.latitude, lng: siteData.longitude },
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      landType: "unknown",
      safetyRating: siteData.safetyRating,
      cellSignal: siteData.cellSignal,
      accessibility: siteData.accessibility || 3, // Make sure accessibility is always provided
      quietness: siteData.noiseLevel,
      features: [
        ...(siteData.isRemote ? ["Remote"] : []),
        ...(siteData.hasWater ? ["Water Source"] : []),
        ...(siteData.hasRestrooms ? ["Restrooms"] : []),
        ...(siteData.isFreeToStay ? ["Free"] : []),
      ],
      images: siteData.images || [],
      reviewCount: 1,
    };

    // In a real app, this would be sent to Supabase/Firebase
    // For now, we'll just add it to our in-memory array
    userSubmittedCampSites.push(newCampSite);
    
    // Update allCampSites to include the new site
    setAllCampSites([...allCampSites, newCampSite]);
    
    // Close the dialog
    setShowAddSiteDialog(false);
    
    // Show success message
    toast({
      title: "Campsite Added",
      description: "Your campsite has been added to the map.",
    });
    
    // If we have the map reference, fly to the new campsite
    if (map.current) {
      map.current.flyTo({
        center: [newCampSite.longitude, newCampSite.latitude],
        zoom: 13,
        essential: true,
      });
    }
  };

  // Handle filter application
  const handleApplyFilters = (filters: FilterCriteria) => {
    setFilterCriteria(filters);
    
    // Show toast with applied filters
    toast({
      title: "Filters Applied",
      description: `Showing campsites with safety ${filters.safetyRating}+, signal ${filters.cellSignal}+, and quietness ${filters.quietness}+`,
    });
  };

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
        campSites={filteredCampSites.length > 0 ? filteredCampSites : allCampSites}
        isLoading={isLoading}
        onMapReady={handleMapReady}
      />
      
      {/* Search Bar */}
      <div className="absolute top-4 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out">
        <SearchBar visible={searchVisible} setVisible={setSearchVisible} />
      </div>
      
      {/* Map Controls */}
      {tokenEntered && <MapControls map={map} />}
      
      {/* Add New Camp Site Button and Dialog */}
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
      
      {/* Map Filter Button and Drawer */}
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
