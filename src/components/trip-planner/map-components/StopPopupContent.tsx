
import { TripStop } from '@/lib/trip-planner/types';
import { createRoot } from 'react-dom/client';
import MapPopupContent from '@/components/map/MapPopupContent';

interface StopPopupContentProps {
  stop: TripStop;
  onAddToItinerary: (stop: TripStop) => void;
  isAlreadyAdded: boolean;
}

// This is a utility function, not a React component
const StopPopupContent = ({ 
  stop, 
  onAddToItinerary, 
  isAlreadyAdded 
}: StopPopupContentProps) => {
  // Function to create the popup content as a DOM element
  const createPopupContent = () => {
    const container = document.createElement('div');
    container.className = 'trip-popup-container p-0';
    
    // Use React to render our MapPopupContent component
    const root = createRoot(container);
    root.render(
      <MapPopupContent
        item={stop}
        isAlreadyInTrip={isAlreadyAdded}
        onAddToTrip={() => onAddToItinerary(stop)}
        isFromDatabase={stop.source === 'supabase'}
      />
    );
    
    return container;
  };

  return { createPopupContent };
};

export default StopPopupContent;
