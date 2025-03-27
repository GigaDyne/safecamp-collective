import { useMapContext } from "@/contexts/MapContext";
import { useNavigate } from "react-router-dom";
import { Filter, Plus, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddSiteForm from "./AddSiteForm";
import MapFilterDrawer from "./MapFilterDrawer";
import MissingSitesDialog from "./MissingSitesDialog";
import { useAddCampSite } from "@/hooks/useCampSites";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/lib/supabase";

interface MapActionButtonsProps {
  onApplyFilters: (filters: any) => void;
}

const MapActionButtons = ({ onApplyFilters }: MapActionButtonsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addCampSite } = useAddCampSite();
  
  const {
    map,
    showAddSiteDialog,
    setShowAddSiteDialog,
    showFilterDrawer,
    setShowFilterDrawer,
    showMissingSiteDialog,
    setShowMissingSiteDialog
  } = useMapContext();

  const handleAddSite = (siteData: any) => {
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
  };

  return (
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
      
      <MissingSitesDialog handleAddSite={handleAddSite} />
      
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
        filters={{
          safetyRating: 0,
          cellSignal: 0,
          quietness: 0,
          maxDistance: 50
        }}
        onApplyFilters={onApplyFilters}
      />
    </>
  );
};

export default MapActionButtons;
