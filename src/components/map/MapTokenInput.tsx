
import { useState } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MapTokenInputProps {
  onTokenSubmit?: (token: string) => void;
  defaultToken?: string;
}

const MapTokenInput = ({ onTokenSubmit, defaultToken }: MapTokenInputProps = {}) => {
  const { toast } = useToast();
  const googleMapsKey = "AIzaSyC4AviHEkjo5wMQwSm8IbX29UVbcPfmr1U";

  const handleContinue = () => {
    // Since we're now using a fixed Google Maps API key, we can just reload the page
    if (onTokenSubmit) {
      onTokenSubmit(googleMapsKey);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/95 z-50">
      <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <MapPin className="h-8 w-8 text-primary mr-2" />
          <h2 className="text-2xl font-bold">SafeCamp</h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Google Maps Integration</h3>
          <p className="text-muted-foreground text-sm mb-4">
            We're using Google Maps for mapping functionality. The API key has been pre-configured.
          </p>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleContinue} className="w-full">
              Continue to Map
            </Button>
          </div>
          
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md text-xs">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Your SafeCamp application is now using Google Maps instead of Mapbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTokenInput;
