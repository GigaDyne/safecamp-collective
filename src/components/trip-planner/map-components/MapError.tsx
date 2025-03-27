
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MapErrorProps {
  errorMessage: string;
}

const MapError: React.FC<MapErrorProps> = ({ errorMessage }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Map Error</AlertTitle>
        <AlertDescription>
          {errorMessage || "There was a problem loading the map. Please try again."}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MapError;
