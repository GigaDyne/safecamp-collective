
export interface TripStop {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'campsite' | 'water' | 'rest_area' | 'point_of_interest' | 'gas_station' | 'grocery' | 'walmart';
  safetyRating?: number;
  description?: string;
  imageUrl?: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: TripStop[];
  routeData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TripFilters {
  maxDistance: number;
  includeRestAreas: boolean;
  includeWalmarts: boolean;
  includeCampsites: boolean;
  minSafetyRating: number;
}

export interface RouteOptions {
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  optimizeWaypoints?: boolean;
}

export interface RouteResponse {
  distance: number;
  duration: number;
  polyline: string;
  legs: RouteLeg[];
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface RouteLeg {
  distance: number;
  duration: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  steps: RouteStep[];
}

export interface RouteStep {
  distance: number;
  duration: number;
  instructions: string;
  maneuver?: string;
}

export interface CrimeDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  type: string;
  description?: string;
  date?: string;
  count?: number;
}
