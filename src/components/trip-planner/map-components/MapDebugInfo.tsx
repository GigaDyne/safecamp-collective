
import React from 'react';

interface MapDebugInfoProps {
  mapboxToken?: string;
  mapInitialized: boolean;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  mapRef: React.RefObject<google.maps.Map | null>;
  error: string | null;
}

const MapDebugInfo: React.FC<MapDebugInfoProps> = ({ 
  mapboxToken, 
  mapInitialized, 
  mapContainerRef,
  mapRef,
  error 
}) => {
  const containerDimensions = mapContainerRef.current ? {
    width: mapContainerRef.current.offsetWidth,
    height: mapContainerRef.current.offsetHeight
  } : { width: 'unknown', height: 'unknown' };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-md shadow-md text-xs font-mono z-50 max-h-40 overflow-auto">
      <h4 className="font-bold mb-1">Map Debug Info</h4>
      <ul className="space-y-1">
        <li>Token: {mapboxToken ? "✅ Present" : "❌ Missing"}</li>
        <li>Map Initialized: {mapInitialized ? "✅ Yes" : "❌ No"}</li>
        <li>Map Container: {mapContainerRef.current ? `✅ Present (${containerDimensions.width}x${containerDimensions.height})` : "❌ Missing"}</li>
        <li>Map Object: {mapRef.current ? "✅ Present" : "❌ Missing"}</li>
        <li>Google Maps Loaded: {window.google && window.google.maps ? "✅ Yes" : "❌ No"}</li>
        <li>Error: {error ? `❌ ${error}` : "✅ None"}</li>
      </ul>
    </div>
  );
};

export default MapDebugInfo;
