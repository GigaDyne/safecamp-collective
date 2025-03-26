
import React from 'react';
import { Loader2 } from 'lucide-react';

interface MapLoadingStateProps {
  message?: string;
}

const MapLoadingState: React.FC<MapLoadingStateProps> = ({ message = "Loading map..." }) => {
  return (
    <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
