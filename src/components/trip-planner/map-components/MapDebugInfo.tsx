
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
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-md shadow-md text-xs font-mono z-50 max-h-40 overflow-auto">
      <h4 className="font-bold mb-1">Map Debug Info</h4>
      <ul className="space-y-1">
        <li>Token: {mapboxToken ? "✅ Present" : "❌ Missing"}</li>
        <li>Map Initialized: {mapInitialized ? "✅ Yes" : "❌ No"}</li>
        <li>Map Container: {mapContainerRef.current ? "✅ Present" : "❌ Missing"}</li>
        <li>Map Object: {mapRef.current ? "✅ Present" : "❌ Missing"}</li>
        <li>Error: {error ? `❌ ${error}` : "✅ None"}</li>
      </ul>
    </div>
  );
};

export default MapDebugInfo;
