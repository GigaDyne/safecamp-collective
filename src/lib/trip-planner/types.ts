
import { CampSite } from "@/lib/supabase";

// Basic type for a stop on the trip
export interface TripStop {
  id: string;
  name: string;
  type: 'campsite' | 'gas' | 'water' | 'dump';
  coordinates?: { lat: number; lng: number };
  distance?: number; // distance from start in meters
  distanceFromRoute?: number; // distance from route in meters
  duration?: number; // duration from start in seconds
  eta?: string; // estimated time of arrival
  order?: number; // order in the itinerary
  isSelected?: boolean;
  details?: any; // additional details specific to the stop type
  safetyRating?: number; // only for campsites
}

// Mapbox route response
export interface RouteData {
  geometry: {
    type: string;
    coordinates: number[][];
  };
  distance: number; // in meters
  duration: number; // in seconds
  startLocation: string;
  endLocation: string;
}

// Trip planning request
export interface TripPlanRequest {
  startLocation: string;
  endLocation: string;
  bufferDistance: number; // in miles
  includeCampsites: boolean;
  includeGasStations: boolean;
  includeWaterStations: boolean;
  includeDumpStations: boolean;
}

// Trip planning response
export interface TripPlanResponse {
  routeData: RouteData;
  availableStops: TripStop[];
}

// Saved trip
export interface SavedTrip {
  id: string;
  name: string;
  stops: TripStop[];
  created: string;
  startLocation: string;
  endLocation: string;
}

// Convert from CampSite to TripStop
export const campSiteToTripStop = (campsite: CampSite, distanceFromRoute?: number): TripStop => {
  return {
    id: campsite.id,
    name: campsite.name,
    type: 'campsite',
    coordinates: {
      lat: campsite.latitude,
      lng: campsite.longitude
    },
    distanceFromRoute,
    safetyRating: campsite.safetyRating,
    details: {
      description: campsite.description,
      features: campsite.features,
      images: campsite.images
    }
  };
};
