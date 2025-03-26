
// Types for trip planning
export interface TripPlanRequest {
  startLocation: string;
  endLocation: string;
  bufferDistance: number;
  includeCampsites: boolean;
  includeGasStations: boolean;
  includeWaterStations: boolean;
  includeDumpStations: boolean;
  mapboxToken?: string; // Added mapboxToken as an optional parameter
}

export interface TripPlanResponse {
  routeData: RouteData;
  availableStops: TripStop[];
}

export interface RouteData {
  geometry: {
    coordinates: number[][];
    type: string;
  };
  distance: number;
  duration: number;
  startLocation: string;
  endLocation: string;
}

export interface TripStop {
  id: string;
  name: string;
  type: 'campsite' | 'gas' | 'water' | 'dump';
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceFromRoute: number;
  distance?: number;
  eta?: string;
  safetyRating?: number;
  isSelected?: boolean;
  details?: {
    description?: string;
    features?: string[];
    images?: string[];
    reviewCount?: number;
  };
}
