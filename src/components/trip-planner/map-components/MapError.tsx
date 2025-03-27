
import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface MapErrorProps {
  error: string;
}

const MapError = ({ error }: MapErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background/50 p-4">
      <AlertCircle className="h-10 w-10 text-destructive mb-2" />
      <h3 className="text-lg font-medium mb-1">Map Error</h3>
      <p className="text-sm text-muted-foreground text-center">{error}</p>
    </div>
  );
};

export default MapError;
