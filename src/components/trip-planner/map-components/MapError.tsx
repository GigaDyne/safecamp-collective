
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface MapErrorProps {
  message: string;
}

const MapError: React.FC<MapErrorProps> = ({ message }) => {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
        <AlertTitle>Map Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};

export default MapError;
