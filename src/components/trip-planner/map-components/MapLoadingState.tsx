
import React from 'react';
import { Loader2 } from 'lucide-react';

interface MapLoadingStateProps {
  message: string;
}

const MapLoadingState = ({ message }: MapLoadingStateProps) => {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-background px-8 py-6 rounded-lg shadow-xl border border-border flex flex-col items-center max-w-md">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-base font-medium text-center text-foreground">{message}</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
