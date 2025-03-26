import { v4 as uuidv4 } from "uuid";
import { TripPlanRequest, TripPlanResponse, RouteData, TripStop } from "./types";
import { mockCampSites } from "@/data/mockData";

// Mapbox API endpoints
const MAPBOX_DIRECTIONS_API = "https://api.mapbox.com/directions/v5/mapbox/driving";
const MAPBOX_GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";

// Helper function to get Mapbox token from localStorage
const getMapboxToken = (): string => {
  return localStorage.getItem("mapbox_token") || "";
};

// Helper to check if a string is coordinates
const isCoordinates = (location: string): boolean => {
  return /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(location);
};

// Convert address to coordinates
const geocodeLocation = async (location: string): Promise<[number, number]> => {
  const mapboxToken = getMapboxToken();
  if (!mapboxToken) {
    throw new Error("Mapbox token is missing");
  }

  // If it's already coordinates, parse and return
  if (isCoordinates(location)) {
    const [lng, lat] = location.split(',').map(Number);
    return [lng, lat];
  }

  // Otherwise, geocode the address
  const response = await fetch(
    `${MAPBOX_GEOCODING_API}/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.features || data.features.length === 0) {
    throw new Error(`No results found for location: ${location}`);
  }

  return data.features[0].center;
};

// Get directions between two locations
const getDirections = async (start: string, end: string): Promise<RouteData> => {
  const mapboxToken = getMapboxToken();
  if (!mapboxToken) {
    throw new Error("Mapbox token is missing");
  }

  // Get coordinates for start and end
  const startCoords = await geocodeLocation(start);
  const endCoords = await geocodeLocation(end);

  // Build the request URL
  const url = `${MAPBOX_DIRECTIONS_API}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Directions API failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found");
  }

  return {
    geometry: data.routes[0].geometry,
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
    startLocation: start,
    endLocation: end
  };
};

// Check if a point is within a buffer distance of a route
const isPointNearRoute = (
  point: [number, number],
  route: number[][],
  bufferDistanceKm: number
): { isNear: boolean; distance: number } => {
  // Find the minimum distance from the point to any point on the route
  let minDistance = Infinity;
  
  for (const routePoint of route) {
    const distance = getDistanceBetweenPoints(
      point[1], point[0],
      routePoint[1], routePoint[0]
    );
    
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return {
    isNear: minDistance <= bufferDistanceKm * 1000, // Convert km to meters
    distance: minDistance
  };
};

// Calculate distance between two points using Haversine formula
const getDistanceBetweenPoints = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
};

// Find campsites along a route
const findCampsitesAlongRoute = (
  route: number[][],
  bufferDistanceMiles: number
): TripStop[] => {
  const bufferDistanceKm = bufferDistanceMiles * 1.60934; // Convert miles to km
  
  // Use mock data for campsites (in a real app, we'd fetch from Supabase)
  return mockCampSites
    .map(campsite => {
      const point: [number, number] = [campsite.longitude, campsite.latitude];
      const nearRoute = isPointNearRoute(point, route, bufferDistanceKm);
      
      if (nearRoute.isNear) {
        return {
          id: campsite.id,
          name: campsite.name,
          type: 'campsite' as const,
          coordinates: {
            lat: campsite.latitude,
            lng: campsite.longitude
          },
          distanceFromRoute: nearRoute.distance,
          safetyRating: campsite.safetyRating,
          details: {
            description: campsite.description,
            features: campsite.features,
            images: campsite.images,
            reviewCount: campsite.reviewCount
          }
        };
      }
      return null;
    })
    .filter(Boolean) as TripStop[];
};

// Generate mock amenities along the route
const generateMockAmenities = (
  route: number[][],
  bufferDistanceMiles: number,
  types: ('gas' | 'water' | 'dump')[]
): TripStop[] => {
  const bufferDistanceKm = bufferDistanceMiles * 1.60934;
  const amenities: TripStop[] = [];
  
  // Generate an amenity every ~100km along the route
  const interval = Math.max(Math.floor(route.length / 10), 1);
  
  for (let i = 0; i < route.length; i += interval) {
    const basePoint = route[i];
    
    // For each type, create a point with random offset
    types.forEach(type => {
      // Random offset in meters (up to half the buffer distance)
      const offsetKm = (Math.random() * bufferDistanceKm / 2) / 1000;
      const bearingRad = Math.random() * 2 * Math.PI;
      
      // Calculate new point with offset (approximate)
      const lat = basePoint[1] + (offsetKm / 111) * Math.cos(bearingRad);
      const lng = basePoint[0] + (offsetKm / (111 * Math.cos(basePoint[1] * Math.PI / 180))) * Math.sin(bearingRad);
      
      // Generate names based on type
      let name = "";
      switch (type) {
        case 'gas':
          name = `${['Shell', 'Chevron', 'Mobil', 'BP', 'Love\'s'][Math.floor(Math.random() * 5)]} Gas Station`;
          break;
        case 'water':
          name = `${['Clear', 'Mountain', 'Spring', 'Pure', 'Fresh'][Math.floor(Math.random() * 5)]} Water Fill`;
          break;
        case 'dump':
          name = `${['RV', 'Campground', 'Park', 'Highway', 'Rest Area'][Math.floor(Math.random() * 5)]} Dump Station`;
          break;
      }
      
      amenities.push({
        id: uuidv4(),
        name,
        type,
        coordinates: { lat, lng },
        distanceFromRoute: 0, // It's on the route
        distance: i / route.length * bufferDistanceKm * 1000, // Approximate distance from start
        eta: formatETA(i / route.length * 3 * 60 * 60) // Estimated time assuming 3 hour trip
      });
    });
  }
  
  return amenities;
};

// Format ETA in hours and minutes
const formatETA = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Main function to plan a trip
export const planTrip = async (
  request: TripPlanRequest
): Promise<TripPlanResponse> => {
  // Get directions from start to end
  const routeData = await getDirections(
    request.startLocation,
    request.endLocation
  );
  
  // Find stops along the route
  const stops: TripStop[] = [];
  
  // Add campsites if requested
  if (request.includeCampsites) {
    const campsites = findCampsitesAlongRoute(
      routeData.geometry.coordinates,
      request.bufferDistance
    );
    stops.push(...campsites);
  }
  
  // Add other amenities if requested (in a real app, we'd fetch from an API)
  const amenityTypes: ('gas' | 'water' | 'dump')[] = [];
  if (request.includeGasStations) amenityTypes.push('gas');
  if (request.includeWaterStations) amenityTypes.push('water');
  if (request.includeDumpStations) amenityTypes.push('dump');
  
  if (amenityTypes.length > 0) {
    const amenities = generateMockAmenities(
      routeData.geometry.coordinates,
      request.bufferDistance,
      amenityTypes
    );
    stops.push(...amenities);
  }
  
  return {
    routeData,
    availableStops: stops
  };
};
