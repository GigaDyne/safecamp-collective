import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/lib/supabase";
import { createMapPinWithPremium } from "./MapPinWithPremium";
import CampSiteCardWithPremium from "./CampSiteCardWithPremium";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumCampsites } from "@/hooks/usePremiumCampsites";
import { useCrimeData } from "@/hooks/useCrimeData";
import { useCrimeLayer } from "@/hooks/useCrimeLayer";
import Badge from "@/components/Badge";

interface MapInitializerWithPremiumProps {
  mapboxToken: string;
  campSites: CampSite[] | undefined;
  isLoading: boolean;
  onMapReady?: (map: mapboxgl.Map) => void;
  showCrimeData?: boolean;
}

const MapInitializerWithPremium = ({ 
  mapboxToken, 
  campSites, 
  isLoading, 
  onMapReady,
  showCrimeData = false
}: MapInitializerWithPremiumProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapInitializedRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CampSite | null>(null);
  const [selectedSiteIsPremium, setSelectedSiteIsPremium] = useState(false);
  
  const { data: premiumCampsites = [], isLoading: isPremiumLoading } = usePremiumCampsites();
  
  const premiumCampsiteIds = useMemo(() => {
    return new Set(premiumCampsites.map(pc => pc.campsite_id));
  }, [premiumCampsites]);
  
  const campSitesString = useMemo(() => {
    if (!campSites) return "";
    
    const simplifiedSites = campSites.map(site => ({
      id: site.id,
      lat: site.latitude,
      lng: site.longitude,
      safety: site.safetyRating,
      isPremium: premiumCampsiteIds.has(site.id)
    }));
    
    return JSON.stringify(simplifiedSites);
  }, [campSites, premiumCampsiteIds]);

  const { crimeData, isLoading: isCrimeDataLoading, isMockData } = useCrimeData({
    map,
    enabled: showCrimeData && isMapLoaded
  });

  useCrimeLayer({
    map,
    crimeData,
    enabled: showCrimeData && isMapLoaded,
    onMarkerClick: (data) => {
      toast({
        title: `${data.county_name}, ${data.state_abbr}`,
        description: `Safety score: ${data.safety_score}/100`,
        variant: "default"
      });
    }
  });

  useEffect(() => {
    if (!mapboxToken || map.current || !mapContainer.current || mapInitializedRef.current) return;
    
    console.log("Initializing map - this should only happen once");
    mapInitializedRef.current = true;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-111.8910, 40.7608],
        zoom: 5,
        attributionControl: false,
        preserveDrawingBuffer: true
      });

      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-left"
      );

      map.current.on('click', () => {
        setSelectedSite(null);
        setSelectedSiteIsPremium(false);
      });

      map.current.on("load", () => {
        if (!map.current) return;
        console.log("Map load event fired");
        setIsMapLoaded(true);
        
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
              "rgba(155, 155, 155, 0.2)"
            ],
            "fill-outline-color": [
              "match",
              ["get", "agency"],
              "BLM", "rgba(254, 213, 111, 0.5)",
              "USFS", "rgba(52, 211, 153, 0.5)",
              "rgba(155, 155, 155, 0.5)"
            ],
          },
        });

        if (onMapReady && map.current) {
          onMapReady(map.current);
        }

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

    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, toast]);

  const flyToMarker = (site: CampSite) => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [site.longitude, site.latitude],
      zoom: 14,
      essential: true,
      duration: 1500,
      padding: { bottom: 250 }
    });
  };

  useEffect(() => {
    if (!map.current || isLoading || !isMapLoaded || !campSites || isPremiumLoading) {
      return;
    }
    
    const currentCampSitesString = campSitesString;
    
    if (markersRef.current.length > 0 && currentCampSitesString === markersRef.current[0]?.getElement().dataset.sitesHash) {
      return;
    }
    
    console.log("Updating markers - campSites have changed");
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

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
          
          const handleMarkerClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            setSelectedSite(site);
            setSelectedSiteIsPremium(isPremium);
            flyToMarker(site);
          };
          
          const markerElement = createMapPinWithPremium({
            safetyRating: site.safetyRating,
            isPremium,
            onClick: handleMarkerClick
          });
          
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
  }, [campSitesString, isLoading, isMapLoaded, premiumCampsiteIds, campSites, isPremiumLoading]);

  useEffect(() => {
    const handleMapClick = (e: MouseEvent) => {
      if (e.target && !(e.target as HTMLElement).closest('.marker-element')) {
        setSelectedSite(null);
        setSelectedSiteIsPremium(false);
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
      {isCrimeDataLoading && showCrimeData && (
        <div className="absolute top-4 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-20">
          Loading crime data...
        </div>
      )}
      
      {showCrimeData && crimeData.length > 0 && (
        <div className="absolute top-4 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-20 flex items-center space-x-2">
          <span>Showing crime data for {crimeData.length} areas</span>
          {isMockData && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
              MOCK DATA
            </Badge>
          )}
          {!isMockData && (
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
              REAL DATA
            </Badge>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {selectedSite && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-4 left-0 right-0 mx-auto px-4 z-20"
          >
            <CampSiteCardWithPremium 
              site={selectedSite} 
              onClose={() => {
                setSelectedSite(null);
                setSelectedSiteIsPremium(false);
              }}
              onViewDetails={() => navigate(`/site/${selectedSite.id}`)}
              isPremium={selectedSiteIsPremium}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapInitializerWithPremium;
