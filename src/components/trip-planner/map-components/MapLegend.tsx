
import React from 'react';
import { MapPin, ShoppingCart, Flame, Wrench } from 'lucide-react';

const MapLegend = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-md shadow-md max-h-[50vh] overflow-y-auto">
      <h4 className="text-xs font-medium mb-2">Stop Types</h4>
      <div className="space-y-2 grid grid-cols-2 gap-x-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <MapPin className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs">Campsites</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><rect width="8" height="5" x="7" y="5" rx="1"/><path d="M7 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><path d="M8 13v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>
          </div>
          <span className="text-xs">Gas Stations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z"/></svg>
          </div>
          <span className="text-xs">Water Stations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </div>
          <span className="text-xs">Dump Stations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs">Walmarts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs">Propane</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center">
            <Wrench className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs">Repair Shops</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
