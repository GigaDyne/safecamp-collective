

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { CampSite } from "@/lib/supabase";
import MapPopupContent from "@/components/map/MapPopupContent";
import { createRoot } from 'react-dom/client';
import { TripStop } from "@/lib/trip-planner/types";
import { useToast } from "@/hooks/use-toast";

interface UseMapPopupProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
}

export function useMapPopup({ map }: UseMapPopupProps) {
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedSite, setSelectedSite] = useState<CampSite | null>(null);
  const [selectedSiteIsPremium, setSelectedSiteIsPremium] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { toast } = useToast();
  
  // Clear popup on map click
  useEffect(() => {
    if (!map.current) return;
    
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
        setShowPopup(false);
      }
      setSelectedSite(null);
      setSelectedSiteIsPremium(false);
    };
    
    map.current.on('click', handleMapClick);
    
    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [map]);
  
  // Handle adding site to trip
  const handleAddToTrip = (site: CampSite) => {
    if (!site) return;
    
    // Convert CampSite to TripStop
    const tripStop: TripStop = {
      id: site.id,
      name: site.name,
      location: site.location,
      coordinates: { lat: site.latitude, lng: site.longitude },
      type: (site.type as TripStop['type']) || 'campsite',
      safetyRating: site.safetyRating,
    };
    
    // Store in localStorage for trip planning
    const currentTrip = localStorage.getItem('pendingTripStops');
    const tripStops: TripStop[] = currentTrip ? JSON.parse(currentTrip) : [];
    
    // Check if already in trip
    if (!tripStops.some(stop => stop.id === tripStop.id)) {
      tripStops.push(tripStop);
      localStorage.setItem('pendingTripStops', JSON.stringify(tripStops));
      
      toast({
        title: "Added to trip",
        description: `${site.name} has been added to your trip planner`,
      });
    } else {
      toast({
        title: "Already in trip",
        description: `${site.name} is already in your trip planner`,
      });
    }
  };
  
  // Handle get directions
  const handleGetDirections = (site: CampSite) => {
    if (!site) return;
    
    // Create a Google Maps directions URL
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}&destination_place_id=${encodeURIComponent(site.name)}`;
    
    // Open in a new tab
    window.open(mapsUrl, '_blank');
  };
  
  // Function to show a popup on the map for a campsite
  const showSitePopup = (site: CampSite, isPremium: boolean) => {
    if (!map.current || !site) return;
    
    // Remove existing popup if any
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    
    setSelectedSite(site);
    setSelectedSiteIsPremium(isPremium);
    setShowPopup(true);
    
    const popupNode = document.createElement('div');
    popupNode.className = 'site-popup-container';
    
    // Render our React component to a DOM node for the popup
    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
      className: 'interactive-map-popup'
    })
      .setLngLat([site.longitude, site.latitude])
      .setDOMContent(popupNode)
      .addTo(map.current);
    
    // Store popup reference
    popupRef.current = popup;
    
    // Fly to the location
    map.current.flyTo({
      center: [site.longitude, site.latitude],
      zoom: 14,
      padding: { bottom: 250 },
      essential: true,
      duration: 1000
    });
    
    // Use ReactDOM to render our component into the popup
    const root = createRoot(popupNode);
    root.render(
      <MapPopupContent 
        item={site} 
        isFromDatabase={site.source === 'supabase'}
        isAlreadyInTrip={false}
        onAddToTrip={(site) => handleAddToTrip(site as CampSite)}
        onGetDirections={(site) => handleGetDirections(site as CampSite)}
        onSubmitLocation={site.source !== 'supabase' ? () => {
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
          return handleSubmitLocation(site);
        } : undefined}
      />
    );
    
    // Add listener for popup close
    popup.on('close', () => {
      setShowPopup(false);
      setSelectedSite(null);
      popupRef.current = null;
    });
  };
  
  // Handle submitting a new location
  const handleSubmitLocation = (site: CampSite) => {
    return {
      lat: site.latitude,
      lng: site.longitude
    };
  };

  return {
    selectedSite,
    selectedSiteIsPremium,
    showPopup,
    showSitePopup,
    handleAddToTrip,
    handleGetDirections,
    handleSubmitLocation,
    clearPopup: () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
        setShowPopup(false);
      }
      setSelectedSite(null);
    }
  };
}
