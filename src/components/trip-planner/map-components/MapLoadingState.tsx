
import { Loader2 } from 'lucide-react';

interface MapLoadingStateProps {
  message?: string;
}

const MapLoadingState = ({ message = "Loading map..." }: MapLoadingStateProps) => {
  return (
    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
