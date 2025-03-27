
import React from 'react';
import { Loader2 } from 'lucide-react';

interface MapLoadingStateProps {
  message: string;
}

const MapLoadingState = ({ message }: MapLoadingStateProps) => {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
