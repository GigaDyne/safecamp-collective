
import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { TripStop, RouteData } from '@/lib/trip-planner/types';
import { useToast } from '@/hooks/use-toast';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import MapLegend from './map-components/MapLegend';
import MapLoadingState from './map-components/MapLoadingState';
import MapError from './map-components/MapError';
import MapDebugInfo from './map-components/MapDebugInfo';
import { useLoadGoogleMaps } from '@/hooks/useLoadGoogleMaps';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';
import CrimeDataTooltip from './map-components/CrimeDataTooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TripPlannerMapProps {
  routeData: RouteData | null;
  tripStops: TripStop[];
  setTripStops: (stops: TripStop[]) => void;
  isLoading: boolean;
  mapboxToken?: string;
  selectedStops: TripStop[];
  onAddToItinerary: (stop: TripStop) => void;
  className?: string;
  showCrimeData?: boolean;
  setShowCrimeData?: (show: boolean) => void;
}

const TripPlannerMap = ({
  routeData,
  tripStops,
  isLoading,
  mapboxToken,
  selectedStops,
  onAddToItinerary,
  setTripStops,
  className = '',
  showCrimeData = false,
  setShowCrimeData
}: TripPlannerMapProps) => {
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [selectedCrimeData, setSelectedCrimeData] = useState<CountyCrimeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);
  
  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const routePolyline = useRef<google.maps.Polyline | null>(null);
  
  // Load Google Maps API
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";
  const { isLoaded: mapsLoaded, error: mapsError } = useLoadGoogleMaps(googleMapsKey);
  
  useEffect(() => {
    if (mapsError) {
      setError(mapsError);
    }
  }, [mapsError]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapsLoaded) return;
    
    try {
      console.log("Initializing Google Maps in TripPlannerMap");
      // Center map on Austin, Texas by default
      const defaultCenter = { lat: 30.2672, lng: -97.7431 };
      
      map.current = new google.maps.Map(mapContainer.current, {
        center: defaultCenter,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      });
      
      // Add event listener for when map is fully loaded
      google.maps.event.addListenerOnce(map.current, 'idle', () => {
        console.log("Google Maps loaded in TripPlannerMap");
        setMapInitialized(true);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please check your internet connection.");
    }
    
    return () => {
      // Clean up markers
      if (markers.current) {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
      }
      
      // Clean up polyline
      if (routePolyline.current) {
        routePolyline.current.setMap(null);
        routePolyline.current = null;
      }
      
      // No need to explicitly remove map with Google Maps
      map.current = null;
    };
  }, [mapsLoaded]);

  // Add route to map when routeData changes
  useEffect(() => {
    if (!map.current || !mapInitialized || !routeData) return;
    
    // Clear existing polyline
    if (routePolyline.current) {
      routePolyline.current.setMap(null);
      routePolyline.current = null;
    }
    
    // Create route path
    if (routeData.geometry && routeData.geometry.coordinates) {
      const path = routeData.geometry.coordinates.map(coord => ({
        lat: coord[1], 
        lng: coord[0]
      }));
      
      routePolyline.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3887be',
        strokeOpacity: 0.75,
        strokeWeight: 5
      });
      
      routePolyline.current.setMap(map.current);
      
      // Fit bounds to show the route
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      map.current.fitBounds(bounds);
    }
  }, [routeData, mapInitialized]);

  // Add markers for trip stops
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    
    // Add markers for trip stops
    tripStops.forEach(stop => {
      // Create marker for each stop
      const marker = new google.maps.Marker({
        position: { 
          lat: stop.coordinates.lat, 
          lng: stop.coordinates.lng 
        },
        map: map.current,
        title: stop.name,
        // Can customize the icon here if needed
      });
      
      // Add click listener to handle stop selection
      marker.addListener('click', () => {
        setSelectedStop(stop);
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${stop.name}</h3>
              <p class="text-sm">${stop.type || 'campsite'}</p>
              ${stop.distance ? `<p class="text-sm">${(stop.distance / 1609.34).toFixed(1)} miles</p>` : ''}
            </div>
          `
        });
        
        infoWindow.open(map.current, marker);
      });
      
      // Add to markers array
      markers.current.push(marker);
    });
    
    // If we have stops, fit the map to show them
    if (tripStops.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      tripStops.forEach(stop => {
        bounds.extend({ 
          lat: stop.coordinates.lat, 
          lng: stop.coordinates.lng 
        });
      });
      
      map.current.fitBounds(bounds);
    }
  }, [tripStops, mapInitialized]);
  
  // Handle context menu selection
  const handleStopContextMenu = (stop: TripStop) => {
    setSelectedStop(stop);
  };
  
  // Handle basic stop click
  const handleStopClick = (stop: TripStop) => {
    setSelectedStop(stop);
  };

  useEffect(() => {
    const handleDoubleClick = () => {
      setShowDebug(prev => !prev);
    };
    
    document.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  if (error) {
    return <MapError message={error} />;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className={`relative h-full w-full ${className}`}>
        <div 
          ref={mapContainer} 
          className="absolute inset-0 h-[500px] md:h-full w-full" 
          style={{ minHeight: '500px' }} 
          data-testid="map-container"
        />
        
        {isLoading && <MapLoadingState message="Planning your trip..." />}
        
        {!mapsLoaded && (
          <MapLoadingState message="Loading Google Maps..." />
        )}
        
        {!isLoading && !error && tripStops.length === 0 && routeData && (
          <div className="absolute bottom-4 left-4 right-4 bg-card p-4 rounded-md shadow-md text-center">
            <p className="text-sm">No stops found within the search distance. Try increasing the search distance.</p>
          </div>
        )}
        
        {showDebug && (
          <MapDebugInfo 
            mapboxToken={googleMapsKey}
            mapInitialized={mapInitialized}
            mapContainerRef={mapContainer}
            mapRef={map}
            error={error}
          />
        )}
        
        <MapLegend showCrimeData={showCrimeData} />
      </ContextMenuTrigger>
      
      {selectedStop && (
        <ContextMenuContent className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border border-border">
          <ContextMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (selectedStop) {
                onAddToItinerary(selectedStop);
                toast({
                  title: "Stop added",
                  description: `Added ${selectedStop.name} to your itinerary`,
                });
              }
            }}
            disabled={selectedStops.some(s => s.id === selectedStop.id)}
          >
            <Plus className="h-4 w-4" />
            <span>Add to Itinerary</span>
          </ContextMenuItem>
        </ContextMenuContent>
      )}

      <Dialog open={!!selectedCrimeData} onOpenChange={(open) => !open && setSelectedCrimeData(null)}>
        <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Crime Statistics</DialogTitle>
            <DialogDescription>
              {selectedCrimeData?.county_name}, {selectedCrimeData?.state_abbr}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCrimeData && (
            <div className="py-4">
              <CrimeDataTooltip data={selectedCrimeData} />
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setSelectedCrimeData(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  );
};

export default TripPlannerMap;
