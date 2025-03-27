import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useToast } from "@/hooks/use-toast";

interface UseMapInitializerProps {
  mapboxToken: string;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function useMapInitializer({ mapboxToken, onMapReady }: UseMapInitializerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapInitializedRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapboxToken || map.current || !mapContainer.current || mapInitializedRef.current) return;
    
    console.log("Initializing map - this should only happen once");
    mapInitializedRef.current = true;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-97.7431, 30.2672],
        zoom: 10,
        attributionControl: false,
        preserveDrawingBuffer: true
      });

      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-left"
      );

      map.current.on('load', () => {
        if (!map.current) return;
        console.log("Map load event fired");
        setIsMapLoaded(true);
        
        initializeMapSources();
        
        if (onMapReady && map.current) {
          onMapReady(map.current);
        }

        tryGetUserLocation();
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

  const initializeMapSources = () => {
    if (!map.current) return;
    
    // Initialize campsite clustering
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
    
    // Set up cluster click handling
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
    
    // Initialize public lands layer
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
  };

  const tryGetUserLocation = () => {
    if (!map.current) return;
    
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
  };

  return {
    mapContainer,
    map,
    isMapLoaded
  };
}
