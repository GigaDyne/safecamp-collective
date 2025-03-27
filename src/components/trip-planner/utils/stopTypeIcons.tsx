
import { MapPin, Droplet, Gas, Coffee, ShoppingCart, Mountain, Bike, Wrench } from "lucide-react";

export const getStopTypeIcon = (type: string) => {
  switch (type) {
    case 'campsite':
      return <Mountain className="h-4 w-4 text-green-600" />;
    case 'water':
      return <Droplet className="h-4 w-4 text-blue-600" />;
    case 'rest_area':
      return <Coffee className="h-4 w-4 text-amber-600" />;
    case 'gas_station':
    case 'gas':
      return <Gas className="h-4 w-4 text-red-600" />;
    case 'grocery':
      return <ShoppingCart className="h-4 w-4 text-purple-600" />;
    case 'walmart':
      return <ShoppingCart className="h-4 w-4 text-blue-600" />;
    case 'propane':
      return <Gas className="h-4 w-4 text-orange-600" />;
    case 'dump':
      return <Droplet className="h-4 w-4 text-brown-600" />;
    case 'repair':
      return <Wrench className="h-4 w-4 text-gray-600" />;
    case 'point_of_interest':
      return <MapPin className="h-4 w-4 text-indigo-600" />;
    default:
      return <MapPin className="h-4 w-4 text-gray-600" />;
  }
};

export const renderEta = (distance: number) => {
  // Simple estimate: assume 55 mph average speed
  const hours = Math.floor(distance / (1609.34 * 55));
  const minutes = Math.round((distance / (1609.34 * 55) - hours) * 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
