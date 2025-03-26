
import React from 'react';

const MapLegend = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-2 rounded-md shadow-md z-10 text-xs font-medium">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span>Campsite</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Gas Station</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Water Station</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Dump Station</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Walmart</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Propane</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
          <span>Repair Shop</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
