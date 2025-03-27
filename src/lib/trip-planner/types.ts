
export interface TripStop {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'campsite' | 'water' | 'rest_area' | 'point_of_interest' | 'gas_station' | 'grocery' | 'walmart' | 'gas' | 'dump' | 'propane' | 'repair';
  safetyRating?: number;
  description?: string;
  imageUrl?: string;
  // Additional properties that were missing
  source?: 'mapbox' | 'supabase';
  distance?: number;
  distanceFromRoute?: number;
  eta?: string;
  order?: number;
  details?: {
    description?: string;
    [key: string]: any;
  };
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

export interface SavedTrip {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: TripStop[];
  routeData?: any;
  createdAt: string;
  updatedAt?: string;
  ownerId?: string;
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

export interface RouteData {
  geometry?: {
    coordinates: [number, number][];
    type: string;
  };
  distance?: number;
  duration?: number;
  startLocation?: string;
  endLocation?: string;
  bounds?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
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

export interface TripPlanRequest {
  startLocation: string;
  endLocation: string;
  bufferDistance?: number;
  includeCampsites?: boolean;
  includeGasStations?: boolean;
  includeWaterStations?: boolean;
  includeDumpStations?: boolean;
  includeWalmarts?: boolean;
  includePropaneStations?: boolean;
  includeRepairShops?: boolean;
  mapboxToken?: string;
}

export interface TripPlanResponse {
  routeData: RouteData | null;
  availableStops: TripStop[];
}
