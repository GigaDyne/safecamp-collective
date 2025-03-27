
import React from 'react';
import { MapPin } from 'lucide-react';
import { useMapContext } from '@/contexts/MapContext';

const MissingSitesButton = () => {
  const { setShowMissingSiteDialog } = useMapContext();
  
  return (
    <button 
      onClick={() => setShowMissingSiteDialog(true)}
      className="absolute top-32 left-4 bg-amber-100 text-amber-900 text-sm py-1 px-3 rounded-full shadow-sm border border-amber-300 z-20 flex items-center gap-2 hover:bg-amber-200 transition-colors"
    >
      <MapPin className="h-4 w-4" />
      <span>Map shows unmarked campsites - Click to add them</span>
    </button>
  );
};

export default MissingSitesButton;
