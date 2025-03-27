
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { CampSite } from "@/lib/supabase";
import { XIcon, MapPinIcon, Route, FlagIcon } from "lucide-react";
import FlagSiteDialog from "@/components/flags/FlagSiteDialog";
import CheckinButton from "@/components/social/CheckinButton";

interface SelectedSiteInfoProps {
  site: CampSite;
  onClose: () => void;
  onAddToTrip?: (site: CampSite) => void;
  onGetDirections?: (site: CampSite) => void;
  onSubmitLocation?: (site: CampSite) => void;
}

const SelectedSiteInfo: React.FC<SelectedSiteInfoProps> = ({
  site,
  onClose,
  onAddToTrip,
  onGetDirections,
  onSubmitLocation
}) => {
  const [showFlagDialog, setShowFlagDialog] = React.useState(false);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-10 p-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{site.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1 inline" />
            {site.location}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{site.safetyRating}/5</span>
              <span className="text-xs text-muted-foreground ml-1">Safety</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{site.cellSignal}/5</span>
              <span className="text-xs text-muted-foreground ml-1">Signal</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{site.quietness}/5</span>
              <span className="text-xs text-muted-foreground ml-1">Quiet</span>
            </div>
          </div>
          {site.description && (
            <p className="text-sm line-clamp-2 text-muted-foreground mb-2">
              {site.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2 pt-0">
          <Button size="sm" variant="outline" onClick={() => onGetDirections?.(site)}>
            <Route className="h-4 w-4 mr-2" />
            Directions
          </Button>
          
          <CheckinButton 
            campsiteId={site.id}
            campsiteName={site.name}
            size="sm"
            variant="outline"
          />
          
          <Button size="sm" onClick={() => onAddToTrip?.(site)}>
            Add to Trip
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFlagDialog(true)}
          >
            <FlagIcon className="h-4 w-4 mr-2" />
            Report
          </Button>
        </CardFooter>
      </Card>
      <FlagSiteDialog
        siteId={site.id}
        siteName={site.name}
        isOpen={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
      />
    </motion.div>
  );
};

export default SelectedSiteInfo;
