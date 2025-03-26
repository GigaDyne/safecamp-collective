
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/lib/supabase";
import { createMapPinElement } from "./MapPin";
import CampSiteCard from "./CampSiteCard";
import { motion, AnimatePresence } from "framer-motion";

interface MapInitializerProps {
  mapboxToken: string;
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  onMapReady?: (map: mapboxgl.Map) => void;
}

const MapInitializer = ({ mapboxToken, campSites, isLoading, onMapReady }: MapInitializerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapInitializedRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CampSite | null>(null);
  
  // Create a stable stringified version of campSites for comparison
  const campSitesString = useMemo(() => {
    if (!campSites) return "";
    
    // Create a simplified version with only the essential properties for comparison
    const simplifiedSites = campSites.map(site => ({
      id: site.id,
      lat: site.latitude,
      lng: site.longitude,
      safety: site.safetyRating
    }));
    
    return JSON.stringify(simplifiedSites);
  }, [campSites]);

  // Initialize map only once
  useEffect(() => {
    if (!mapboxToken || map.current || !mapContainer.current || mapInitializedRef.current) return;
    
    console.log("Initializing map - this should only happen once");
    mapInitializedRef.current = true;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-111.8910, 40.7608], // Default center
        zoom: 5,
        attributionControl: false,
        preserveDrawingBuffer: true // Prevents redraws
      });

      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-left"
      );

      // Close the site card when clicking on the map (but not on a marker)
      map.current.on('click', () => {
        setSelectedSite(null);
      });

      // Add basic interactions
      map.current.on("load", () => {
        if (!map.current) return;
        console.log("Map load event fired");
        setIsMapLoaded(true);
        
        // Add public lands layer (would be more complex in production)
        map.current.addSource("public-lands", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
        
        map.current.addLayer({
          id: "public-lands-fill",
          type: "fill",
          source: "public-lands",
          layout: {},
          paint: {
            "fill-color": [
              "match",
              ["get", "agency"],
              "BLM", "rgba(254, 213, 111, 0.2)",
              "USFS", "rgba(52, 211, 153, 0.2)",
              "rgba(155, 155, 155, 0.2)" // default
            ],
            "fill-outline-color": [
              "match",
              ["get", "agency"],
              "BLM", "rgba(254, 213, 111, 0.5)",
              "USFS", "rgba(52, 211, 153, 0.5)",
              "rgba(155, 155, 155, 0.5)" // default
            ],
          },
        });

        if (onMapReady && map.current) {
          onMapReady(map.current);
        }

        // Fetch user location after map is loaded
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (map.current) {
                map.current.flyTo({
                  center: [position.coords.longitude, position.coords.latitude],
                  zoom: 10,
                  essential: true,
                });
              }
            },
            () => {
              console.log("Unable to get user location");
            }
          );
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map initialization failed",
        description: "Please check if your Mapbox token is valid.",
        variant: "destructive",
      });
    }

    // Cleanup function - only run when component unmounts
    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]); // Only re-run when mapboxToken changes

  // Function to fly to a marker
  const flyToMarker = (site: CampSite) => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [site.longitude, site.latitude],
      zoom: 14,
      essential: true,
      duration: 1500,
      padding: { bottom: 250 } // Make room for the card at the bottom
    });
  };

  // Handle markers separately with deep comparison of camp sites
  useEffect(() => {
    if (!map.current || isLoading || !isMapLoaded || !campSites) {
      return;
    }
    
    // Store the current string representation in a ref to avoid re-renders
    const currentCampSitesString = campSitesString;
    
    // Skip if campSites haven't changed
    if (markersRef.current.length > 0 && currentCampSitesString === markersRef.current[0]?.getElement().dataset.sitesHash) {
      return;
    }
    
    console.log("Updating markers - campSites have changed");
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers only if the map is fully loaded
    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once('load', addMarkers);
    }

    function addMarkers() {
      if (!map.current || !campSites) return;
      
      // Add new markers
      campSites.forEach(site => {
        try {
          // Create a DOM click handler that works with native MouseEvent
          const handleMarkerClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Set the selected site and fly to it
            setSelectedSite(site);
            flyToMarker(site);
          };
          
          const markerElement = createMapPinElement(site.safetyRating, handleMarkerClick);
          
          // Store the hash in the element for comparison
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
  }, [campSitesString, isLoading, isMapLoaded]); // Removed navigate from dependencies

  // Close card on map click (not marker click)
  useEffect(() => {
    const handleMapClick = (e: MouseEvent) => {
      // Only close if we're not clicking on a marker
      if (e.target && !(e.target as HTMLElement).closest('.marker-element')) {
        setSelectedSite(null);
      }
    };

    if (map.current && isMapLoaded) {
      map.current.getCanvas().addEventListener('click', handleMapClick);
    }

    return () => {
      if (map.current) {
        map.current.getCanvas().removeEventListener('click', handleMapClick);
      }
    };
  }, [isMapLoaded]);

  return (
    <div ref={mapContainer} className="w-full h-full bg-muted/20 animate-fade-in relative">
      <AnimatePresence>
        {selectedSite && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-4 left-0 right-0 mx-auto px-4 z-20"
          >
            <CampSiteCard 
              site={selectedSite} 
              onClose={() => setSelectedSite(null)}
              onViewDetails={() => navigate(`/site/${selectedSite.id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapInitializer;
