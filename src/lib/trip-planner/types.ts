export interface TripStop {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  details?: any;
  order?: number;
}

export interface RouteData {
  distance: number;
  duration: number;
  geometry: [number, number][];
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
