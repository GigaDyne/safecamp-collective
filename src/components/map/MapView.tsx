
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Minus, Layers, Menu, MapPin, AlertCircle } from "lucide-react";
import { mockCampSites } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapControls from "./MapControls";
import MapFilterButton from "./MapFilterButton";
import { createMapPinElement } from "./MapPin";
import SearchBar from "./SearchBar";
import { useCampSites } from "@/hooks/useCampSites";
import { useToast } from "@/hooks/use-toast";

// This will store the token once provided by the user
let mapboxToken = "";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);
  const { campSites, isLoading } = useCampSites();
  const [tokenEntered, setTokenEntered] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const { toast } = useToast();

  // Initialize map when token is provided
  useEffect(() => {
    if (!tokenEntered || map.current || !mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
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
      setTokenEntered(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [tokenEntered, toast]);

  // Add markers for camp sites
  useEffect(() => {
    if (!map.current || isLoading || !tokenEntered) return;

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
  }, [campSites, isLoading, navigate, tokenEntered]);

  // Handle token submission
  const handleTokenSubmit = () => {
    if (!tokenValue.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox token to view the map.",
        variant: "destructive",
      });
      return;
    }
    
    mapboxToken = tokenValue.trim();
    setTokenEntered(true);
    
    // Save to localStorage for convenience (in a real app, handle this more securely)
    localStorage.setItem("mapbox_token", mapboxToken);
  };

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      mapboxToken = savedToken;
      setTokenValue(savedToken);
      setTokenEntered(true);
    }
  }, []);

  return (
    <div className="map-container bg-muted/20 relative h-full">
      {!tokenEntered ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/95 z-50">
          <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="h-8 w-8 text-primary mr-2" />
              <h2 className="text-2xl font-bold">SafeCamp</h2>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Enter Mapbox Token</h3>
              <p className="text-muted-foreground text-sm mb-4">
                To view the map, please enter your Mapbox public token. You can get one by creating an account at{" "}
                <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  mapbox.com
                </a>
              </p>
              
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
                  value={tokenValue}
                  onChange={(e) => setTokenValue(e.target.value)}
                  className="w-full"
                />
                <Button onClick={handleTokenSubmit} className="w-full">
                  Load Map
                </Button>
              </div>
              
              <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  This is a temporary solution for demonstration purposes. In a production app, the token would be securely managed server-side.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      
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
      {tokenEntered && <MapControls map={map} />}
      
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
      {tokenEntered && <MapFilterButton />}
    </div>
  );
};

export default MapView;
