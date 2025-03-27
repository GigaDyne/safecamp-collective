
import React from 'react';
import { Loader2 } from 'lucide-react';

interface MapLoadingStateProps {
  message: string;
}

const MapLoadingState = ({ message }: MapLoadingStateProps) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-white dark:bg-slate-800 px-8 py-6 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-base font-medium text-center">{message}</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
