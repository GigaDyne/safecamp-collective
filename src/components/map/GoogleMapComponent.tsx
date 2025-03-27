
import { useRef, useEffect } from "react";
import { useGoogleMapInitializer } from "@/hooks/useGoogleMapInitializer";
import MapControls from "./MapControls";
import { CampSite } from "@/lib/supabase";

interface GoogleMapComponentProps {
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  showCrimeData?: boolean;
  onMapReady?: (map: google.maps.Map) => void;
}

const GoogleMapComponent = ({ 
  campSites, 
  isLoading, 
  showCrimeData = false,
  onMapReady
}: GoogleMapComponentProps) => {
  const markers = useRef<google.maps.Marker[]>([]);
  const { mapContainer, map, isMapLoaded, mapsError } = useGoogleMapInitializer({
    onMapReady
  });

  // Add markers for campsites
  useEffect(() => {
    if (!map.current || !isMapLoaded || !campSites) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add new markers
    campSites.forEach(site => {
      const marker = new google.maps.Marker({
        position: { lat: site.latitude, lng: site.longitude },
        map: map.current,
        title: site.name,
        // You can add custom icon here if needed
      });

      // Add click listener
      marker.addListener('click', () => {
        // Handle marker click - e.g., show popup
        if (map.current) {
          map.current.panTo({ lat: site.latitude, lng: site.longitude });
          
          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${site.name}</h3>
                <p class="text-sm">${site.description || ''}</p>
                <p class="text-sm">Safety Rating: ${site.safetyRating}/5</p>
              </div>
            `
          });
          
          infoWindow.open(map.current, marker);
        }
      });

      markers.current.push(marker);
    });
  }, [campSites, isMapLoaded]);

  // Center map on Austin, TX
  useEffect(() => {
    if (map.current && isMapLoaded) {
      const austinCoordinates = { lat: 30.2672, lng: -97.7431 };
      map.current.setCenter(austinCoordinates);
      map.current.setZoom(10);
    }
  }, [isMapLoaded]);

  if (mapsError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="p-4 bg-white rounded shadow-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Map Error</h3>
          <p>{mapsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <MapControls />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
          <div className="animate-spin mr-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span>Loading map...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
