
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MapLegendProps {
  showCrimeData?: boolean;
}

const MapLegend = ({ showCrimeData = false }: MapLegendProps) => {
  if (!showCrimeData) return null;
  
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-slate-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="text-xs font-medium mb-2 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
        <span>Crime Data Legend</span>
      </div>
      
      <div className="grid grid-cols-1 gap-1.5">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>
          <span className="text-xs">Low crime rate</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-yellow-500 mr-2"></div>
          <span className="text-xs">Medium crime rate</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-red-500 mr-2"></div>
          <span className="text-xs">High crime rate</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
