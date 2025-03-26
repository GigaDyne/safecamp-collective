
import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TripStop } from '@/lib/trip-planner/types';
import MapLegend from './map-components/MapLegend';
import MapLoadingState from './map-components/MapLoadingState';
import UserLocationMarker from './map-components/UserLocationMarker';
import { useNavigationMap } from './hooks/useNavigationMap';

interface TripNavigationMapProps {
  tripStops: TripStop[];
  currentStopIndex: number;
  userLocation: { lat: number; lng: number } | null;
}

const TripNavigationMap = ({
  tripStops,
  currentStopIndex,
  userLocation
}: TripNavigationMapProps) => {
  const { mapContainer, loading } = useNavigationMap({
    tripStops,
    currentStopIndex,
    userLocation
  });

  return (
    <div className="relative w-full h-full">
      {loading && <MapLoadingState message="Loading map..." />}
      
      <div 
        ref={mapContainer} 
        className="absolute inset-0" 
        style={{ minHeight: '500px' }} 
      />
      
      <UserLocationMarker isVisible={!!userLocation} />
      <MapLegend />
    </div>
  );
};

export default TripNavigationMap;
