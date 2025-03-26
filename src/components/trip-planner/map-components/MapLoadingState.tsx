
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapLoadingStateProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const MapLoadingState: React.FC<MapLoadingStateProps> = ({ 
  message = "Loading map...",
  onRetry,
  showRetry = false
}) => {
  return (
    <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
        <p className="text-sm font-medium mb-3">{message}</p>
        
        {showRetry && onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

export default MapLoadingState;
