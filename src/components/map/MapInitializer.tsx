
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/hooks/useCampSites";
import { createMapPinElement } from "./MapPin";

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
  const previousCampSitesRef = useRef<CampSite[] | undefined>(undefined);

  // Initialize map only once
  useEffect(() => {
    if (!mapboxToken || map.current || !mapContainer.current || mapInitializedRef.current) return;

    try {
      mapInitializedRef.current = true;
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-111.8910, 40.7608], // Default center
        zoom: 5,
        attributionControl: false,
      });

      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-left"
      );

      // Add basic interactions
      map.current.on("load", () => {
        if (!map.current) return;
        
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

        toast({
          title: "Map loaded successfully!",
          description: "You can now explore safe camping spots.",
        });
      });

      // Get user's location and center map
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
            toast({
              title: "Location access denied",
              description: "Using default map location instead.",
              variant: "destructive",
            });
          }
        );
      }
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
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [mapboxToken, toast, onMapReady]);

  // Handle markers separately with deep comparison of camp sites
  useEffect(() => {
    if (!map.current || isLoading || !mapboxToken || !campSites) return;
    
    // Skip if campSites haven't changed
    if (
      previousCampSitesRef.current &&
      JSON.stringify(previousCampSitesRef.current) === JSON.stringify(campSites)
    ) {
      return;
    }
    
    // Update the ref with current campSites
    previousCampSitesRef.current = campSites;

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
        const handleMarkerClick = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(`/site/${site.id}`);
        };
        
        const markerElement = createMapPinElement(site.safetyRating, handleMarkerClick);
        
        const marker = new mapboxgl.Marker({
          element: markerElement,
        })
          .setLngLat([site.longitude, site.latitude])
          .addTo(map.current!);
          
        markersRef.current.push(marker);
      });
    }
  }, [campSites, isLoading, navigate, mapboxToken]);

  return (
    <div ref={mapContainer} className="w-full h-full bg-muted/20 animate-fade-in" />
  );
};

export default MapInitializer;
