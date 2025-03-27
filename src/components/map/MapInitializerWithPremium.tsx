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
import { useCrimeData } from "@/components/trip-planner/hooks/useCrimeData";
import { useCrimeLayer } from "@/components/trip-planner/hooks/useCrimeLayer";
import { Badge } from "@/components/ui/badge";

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
        
        map.current.addSource("campsites", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "campsites",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              10,
              "#f1f075",
              30,
              "#f28cb1"
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40
            ]
          }
        });
        
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "campsites",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
          }
        });
        
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "campsites",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 0,
            "circle-stroke-width": 0
          }
        });
        
        map.current.on('click', 'clusters', (e) => {
          if (!map.current) return;
          
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          
          if (features.length > 0) {
            const clusterId = features[0].properties?.cluster_id;
            if (clusterId) {
              const source = map.current.getSource('campsites') as mapboxgl.GeoJSONSource;
              source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err || !map.current) return;
                
                const coordinates = (features[0].geometry as any).coordinates;
                
                map.current.easeTo({
                  center: coordinates,
                  zoom: Math.min((zoom || 0) + 1, 14)
                });
              });
            }
          }
          
          e.preventDefault();
        });
        
        map.current.on('mouseenter', 'clusters', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });
        
        map.current.on('mouseleave', 'clusters', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });
        
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
  }, [mapboxToken, toast, onMapReady]);

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

  useEffect(() => {
    if (!map.current || isLoading || !isMapLoaded || !campSites || isPremiumLoading) {
      return;
    }
    
    const shouldShowMarkers = map.current.getZoom() >= 8;
    
    const currentCampSitesString = campSitesString;
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
