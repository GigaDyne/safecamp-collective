
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { CampSite } from "@/lib/supabase";
import { createMapPinWithPremium } from "@/components/map/MapPinWithPremium";

interface UseMapMarkersProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  isMapLoaded: boolean;
  premiumCampsiteIds: Set<string>;
  onSiteClick: (site: CampSite, isPremium: boolean) => void;
}

export function useMapMarkers({ 
  map, 
  campSites, 
  isLoading, 
  isMapLoaded,
  premiumCampsiteIds, 
  onSiteClick 
}: UseMapMarkersProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Update GeoJSON source when campsites change
  useEffect(() => {
    if (!map.current || !isMapLoaded || !campSites) return;
    
    const features = campSites.map(site => ({
      type: 'Feature' as const,
      properties: {
        id: site.id,
        title: site.name,
        description: site.description || '',
        safety: site.safetyRating,
        isPremium: premiumCampsiteIds.has(site.id)
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [site.longitude, site.latitude]
      }
    }));
    
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features
    };
    
    const source = map.current.getSource('campsites') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojsonData);
    }
  }, [campSites, isMapLoaded, premiumCampsiteIds]);
  
  // Create specialized marker element for different site types
  const createMapPinForType = (site: CampSite, isPremium: boolean) => {
    const getTypeBasedPin = () => {
      if (site.type === 'walmart') {
        return createSpecialPin('walmart', site, isPremium);
      }
      
      return createMapPinWithPremium({
        safetyRating: site.safetyRating,
        isPremium,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onSiteClick(site, isPremium);
        }
      });
    };
    
    return getTypeBasedPin();
  };
  
  // Create special pin for specific types
  const createSpecialPin = (type: string, site: CampSite, isPremium: boolean) => {
    const el = document.createElement("div");
    el.className = "marker-element relative";
    
    let iconHtml = '';
    
    if (type === 'walmart') {
      iconHtml = `
        <div class="cursor-pointer transition-all hover:scale-110 bg-blue-600 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center font-bold">
          W
        </div>
      `;
    }
    
    el.innerHTML = iconHtml;
    
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onSiteClick(site, isPremium);
    });
    
    return el;
  };
  
  // Manage markers on the map
  useEffect(() => {
    if (!map.current || isLoading || !isMapLoaded || !campSites) {
      return;
    }
    
    const shouldShowMarkers = map.current.getZoom() >= 8;
    
    // Generate a hash of the current campsite data to detect changes
    const currentCampSitesString = JSON.stringify(
      campSites.map(site => ({
        id: site.id,
        lat: site.latitude,
        lng: site.longitude,
        safety: site.safetyRating,
        isPremium: premiumCampsiteIds.has(site.id)
      }))
    );
    
    const needsUpdate = markersRef.current.length === 0 || 
                      (markersRef.current.length > 0 && 
                        currentCampSitesString !== markersRef.current[0]?.getElement().dataset.sitesHash);
    
    if (!shouldShowMarkers || needsUpdate) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }
    
    if (!shouldShowMarkers) {
      return;
    }
    
    if (!needsUpdate) {
      return;
    }
    
    console.log("Updating markers - campsites have changed");
    
    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once('load', addMarkers);
    }

    function addMarkers() {
      if (!map.current || !campSites) return;
      
      campSites.forEach(site => {
        try {
          const isPremium = premiumCampsiteIds.has(site.id);
          
          const markerElement = createMapPinForType(site, isPremium);
          
          markerElement.dataset.sitesHash = currentCampSitesString;
          
          const marker = new mapboxgl.Marker({
            element: markerElement,
          })
            .setLngLat([site.longitude, site.latitude])
            .addTo(map.current!);
            
          markersRef.current.push(marker);
        } catch (error) {
          console.error("Error adding marker:", error);
        }
      });
    }
    
    const updateMarkerVisibility = () => {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      markersRef.current.forEach(marker => {
        const el = marker.getElement();
        el.style.display = zoom >= 8 ? 'block' : 'none';
      });
    };
    
    map.current.on('zoom', updateMarkerVisibility);
    updateMarkerVisibility();
    
    return () => {
      if (map.current) {
        map.current.off('zoom', updateMarkerVisibility);
      }
    };
  }, [campSites, isLoading, isMapLoaded, premiumCampsiteIds, onSiteClick]);
  
  return {
    markers: markersRef.current
  };
}
