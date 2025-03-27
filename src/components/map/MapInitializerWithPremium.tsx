import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CampSite } from "@/lib/supabase";
import { createMapPinWithPremium } from "./MapPinWithPremium";
import MapPopupContent from "./MapPopupContent";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumCampsites } from "@/hooks/usePremiumCampsites";
import { useCrimeData } from "@/components/trip-planner/hooks/useCrimeData";
import { useCrimeLayer } from "@/components/trip-planner/hooks/useCrimeLayer";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddSiteForm from "./AddSiteForm";
import { TripStop } from "@/lib/trip-planner/types";
import { createRoot } from 'react-dom/client';

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
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapInitializedRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CampSite | null>(null);
  const [selectedSiteIsPremium, setSelectedSiteIsPremium] = useState(false);
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [locationToAdd, setLocationToAdd] = useState<{lat: number, lng: number} | null>(null);
  const [showPopup, setShowPopup] = useState(false);

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

      map.current.on('click', (e) => {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
          setShowPopup(false);
        }
        setSelectedSite(null);
        setSelectedSiteIsPremium(false);
      });
      
      // Add context menu functionality for adding new locations
      map.current.on('contextmenu', (e) => {
        e.preventDefault();
        
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
        
        // Get coordinates from where user right-clicked
        const coordinates = e.lngLat;
        setLocationToAdd({lat: coordinates.lat, lng: coordinates.lng});
        
        // Create a popup with "Add location here" option
        popupRef.current = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2 text-center">
              <p class="text-sm mb-2">Add a new location here?</p>
              <button id="add-location-btn" class="px-3 py-1 bg-primary text-primary-foreground text-xs rounded">
                Add Location
              </button>
            </div>
          `)
          .addTo(map.current);
          
        // Add event listener to the button
        document.getElementById('add-location-btn')?.addEventListener('click', () => {
          popupRef.current?.remove();
          setShowAddLocationDialog(true);
        });
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

  // New function to show a popup on the map for a campsite
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
        onSubmitLocation={site.source !== 'supabase' ? () => handleSubmitLocation(site) : undefined}
      />
    );
    
    // Add listener for popup close
    popup.on('close', () => {
      setShowPopup(false);
      setSelectedSite(null);
      popupRef.current = null;
    });
  };
  
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
  
  // Handle submitting a new location
  const handleSubmitLocation = (site: CampSite) => {
    setLocationToAdd({lat: site.latitude, lng: site.longitude});
    setShowAddLocationDialog(true);
    
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

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
          showSitePopup(site, isPremium);
        }
      });
    };
    
    return getTypeBasedPin();
  };

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
      showSitePopup(site, isPremium);
    });
    
    return el;
  };

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
  }, [campSitesString, isLoading, isMapLoaded, premiumCampsiteIds, campSites, isPremiumLoading]);

  useEffect(() => {
    const handleMapClick = (e: MouseEvent) => {
      if (e.target && !(e.target as HTMLElement).closest('.marker-element') && 
          !(e.target as HTMLElement).closest('.site-popup-container')) {
        setSelectedSite(null);
        setSelectedSiteIsPremium(false);
        
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
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

  // Handle submission of new location
  const handleAddSiteSubmission = (formData: any) => {
    // This would typically submit to your backend
    toast({
      title: "Location submitted",
      description: "Thank you for contributing to SafeCamp!",
    });
    setShowAddLocationDialog(false);
    setLocationToAdd(null);
  };

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
      
      {/* Add Site Dialog */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a New Location</DialogTitle>
          </DialogHeader>
          
          {locationToAdd && (
            <AddSiteForm 
              initialLocation={{
                latitude: locationToAdd.lat,
                longitude: locationToAdd.lng
              }}
              onSubmit={handleAddSiteSubmission}
              onCancel={() => setShowAddLocationDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AnimatePresence>
        {selectedSite && !showPopup && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-4 left-0 right-0 mx-auto px-4 z-20"
          >
            <div className="bg-card rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
              <MapPopupContent 
                item={selectedSite} 
                isFromDatabase={selectedSite.source === 'supabase'}
                isAlreadyInTrip={false}
                onAddToTrip={handleAddToTrip}
                onGetDirections={handleGetDirections}
                onSubmitLocation={selectedSite.source !== 'supabase' ? () => handleSubmitLocation(selectedSite) : undefined}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => setSelectedSite(null)}
              >
                &times;
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapInitializerWithPremium;
