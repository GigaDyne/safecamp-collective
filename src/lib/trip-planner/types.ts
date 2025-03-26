
export interface TripStop {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  details?: any;
  order?: number;
  type?: 'campsite' | 'gas' | 'water' | 'dump' | 'walmart' | 'propane' | 'repair';
  safetyRating?: number;
  distanceFromRoute?: number;
  distance?: number;
  eta?: string;
}

export interface RouteData {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
  startLocation?: string;
  endLocation?: string;
}

export interface SavedTrip {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: TripStop[];
  routeData?: RouteData | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupabaseTrip {
  id: string;
  owner_id: string;
  is_guest: boolean;
  name: string;
  start_location: string;
  end_location: string;
  stops: TripStop[];
  route_data?: RouteData | null;
  created_at: string;
  updated_at: string;
}

export interface TripPlanRequest {
  startLocation: string;
  endLocation: string;
  bufferDistance: number;
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
  routeData: RouteData;
  availableStops: TripStop[];
}
