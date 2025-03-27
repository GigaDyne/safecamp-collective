
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MapPopupContent from "./MapPopupContent";
import { CampSite } from "@/lib/supabase";

interface SelectedSiteInfoProps {
  site: CampSite | null;
  onClose: () => void;
  onAddToTrip: (site: CampSite) => void;
  onGetDirections: (site: CampSite) => void;
  onSubmitLocation?: (site: CampSite) => void;
}

const SelectedSiteInfo = ({ 
  site, 
  onClose, 
  onAddToTrip, 
  onGetDirections,
  onSubmitLocation
}: SelectedSiteInfoProps) => {
  if (!site) return null;
  
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute bottom-4 left-0 right-0 mx-auto px-4 z-20"
    >
      <div className="bg-card rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
        <MapPopupContent 
          item={site} 
          isFromDatabase={site.source === 'supabase'}
          isAlreadyInTrip={false}
          onAddToTrip={onAddToTrip}
          onGetDirections={onGetDirections}
          onSubmitLocation={site.source !== 'supabase' ? () => onSubmitLocation?.(site) : undefined}
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          &times;
        </Button>
      </div>
    </motion.div>
  );
};

export default SelectedSiteInfo;
