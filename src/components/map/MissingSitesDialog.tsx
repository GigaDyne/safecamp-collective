
import { useMapContext } from "@/contexts/MapContext";
import { useViewportCampsites } from "@/hooks/viewport-campsites";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface MissingSitesDialogProps {
  handleAddSite: (siteData: any) => void;
}

const MissingSitesDialog = ({ handleAddSite }: MissingSitesDialogProps) => {
  const { toast } = useToast();
  const {
    viewportBounds,
    showMissingSiteDialog,
    setShowMissingSiteDialog
  } = useMapContext();
  
  const { 
    campsites: viewportCampsites
  } = useViewportCampsites(viewportBounds, {
    enabled: showMissingSiteDialog && !!viewportBounds,
  });

  return (
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
                
                handleAddSite(siteData);
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
  );
};

export default MissingSitesDialog;
