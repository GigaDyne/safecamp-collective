
import { MapPin, Fuel, Droplet, Trash2 } from "lucide-react";
import React from "react";

export const getStopTypeIcon = (type: string) => {
  switch (type) {
    case 'campsite':
      return <MapPin className="h-4 w-4 text-green-500" />;
    case 'gas':
      return <Fuel className="h-4 w-4 text-red-500" />;
    case 'water':
      return <Droplet className="h-4 w-4 text-blue-500" />;
    case 'dump':
      return <Trash2 className="h-4 w-4 text-amber-500" />;
    case 'walmart':
      return <MapPin className="h-4 w-4 text-blue-600" />;
    case 'propane':
      return <Fuel className="h-4 w-4 text-orange-500" />;
    case 'repair':
      return <Trash2 className="h-4 w-4 text-zinc-700" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

export const renderEta = (distanceMeters: number) => {
  const distanceMiles = distanceMeters / 1609.34;
  const timeHours = distanceMiles / 55;
  
  const hours = Math.floor(timeHours);
  const minutes = Math.floor((timeHours - hours) * 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
