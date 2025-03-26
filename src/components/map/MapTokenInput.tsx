
import { useState, useEffect } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MapTokenInputProps {
  onTokenSubmit: (token: string) => void;
  defaultToken: string;
}

const MapTokenInput = ({ onTokenSubmit, defaultToken }: MapTokenInputProps) => {
  const [tokenValue, setTokenValue] = useState(defaultToken);
  const { toast } = useToast();

  const handleTokenSubmit = () => {
    if (!tokenValue.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox token to view the map.",
        variant: "destructive",
      });
      return;
    }
    
    onTokenSubmit(tokenValue.trim());
    
    // Save to localStorage for convenience (in a real app, handle this more securely)
    localStorage.setItem("mapbox_token", tokenValue.trim());
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/95 z-50">
      <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <MapPin className="h-8 w-8 text-primary mr-2" />
          <h2 className="text-2xl font-bold">SafeCamp</h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">MapBox Token</h3>
          <p className="text-muted-foreground text-sm mb-4">
            A default MapBox token has been provided. You can replace it with your own token from{" "}
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              mapbox.com
            </a>
          </p>
          
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Enter Mapbox token"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Load Map
            </Button>
          </div>
          
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md text-xs">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              This is a temporary solution. In a production app, the token would be securely managed server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTokenInput;
