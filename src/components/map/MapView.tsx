
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Minus, Layers, Menu } from "lucide-react";
import { mockCampSites } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import MapControls from "./MapControls";
import MapFilterButton from "./MapFilterButton";
import { createMapPinElement } from "./MapPin";
import SearchBar from "./SearchBar";
import { useCampSites } from "@/hooks/useCampSites";

// This would be stored in an environment variable in production
const MAPBOX_TOKEN = "REPLACE_WITH_YOUR_MAPBOX_TOKEN";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);
  const { campSites, isLoading } = useCampSites();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-111.8910, 40.7608], // Default center (can be replaced with user's location)
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
        }
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers for camp sites
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    const sites = campSites || mockCampSites;
    sites.forEach(site => {
      if (!map.current) return;
      
      const markerElement = createMapPinElement(site.safetyRating);
      
      const marker = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat([site.longitude, site.latitude])
        .addTo(map.current);
        
      marker.getElement().addEventListener('click', () => {
        navigate(`/site/${site.id}`);
      });
      
      markersRef.current.push(marker);
    });
  }, [campSites, isLoading, navigate]);

  return (
    <div className="map-container bg-muted/20">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-muted/20 animate-fade-in"
      />
      
      {/* Search Bar */}
      <div className="absolute top-4 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out">
        <SearchBar visible={searchVisible} setVisible={setSearchVisible} />
      </div>
      
      {/* Map Controls */}
      <MapControls map={map} />
      
      {/* Add New Camp Site Button */}
      <div className="absolute bottom-24 right-4 z-10">
        <Button 
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg animate-fade-in"
          onClick={() => navigate('/add-site')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Map Filter Button */}
      <MapFilterButton />
    </div>
  );
};

export default MapView;
