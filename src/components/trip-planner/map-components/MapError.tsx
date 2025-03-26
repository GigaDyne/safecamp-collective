
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MapErrorProps {
  message: string;
}

const MapError: React.FC<MapErrorProps> = ({ message }) => {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};

export default MapError;
