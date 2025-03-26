import { v4 as uuidv4 } from "uuid";
import { TripPlanRequest, TripPlanResponse, RouteData, TripStop } from "./types";
import { mockCampSites } from "@/data/mockData";

// Mapbox API endpoints
const MAPBOX_DIRECTIONS_API = "https://api.mapbox.com/directions/v5/mapbox/driving";
const MAPBOX_GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";

// Helper to check if a string is coordinates
const isCoordinates = (location: string): boolean => {
  return /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(location);
};

// Convert address to coordinates
const geocodeLocation = async (location: string, mapboxToken: string): Promise<[number, number]> => {
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
const getDirections = async (start: string, end: string, mapboxToken: string): Promise<RouteData> => {
  if (!mapboxToken) {
    throw new Error("Mapbox token is missing");
  }

  // Get coordinates for start and end
  const startCoords = await geocodeLocation(start, mapboxToken);
  const endCoords = await geocodeLocation(end, mapboxToken);

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

  // Ensure the route data is properly structured for our application
  return {
    geometry: {
      coordinates: data.routes[0].geometry.coordinates
    },
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
  route: { coordinates: [number, number][] },
  bufferDistanceMiles: number
): TripStop[] => {
  const bufferDistanceKm = bufferDistanceMiles * 1.60934; // Convert miles to km
  
  // Use mock data for campsites (in a real app, we'd fetch from Supabase)
  return mockCampSites
    .map(campsite => {
      const point: [number, number] = [campsite.longitude, campsite.latitude];
      const nearRoute = isPointNearRoute(point, route.coordinates, bufferDistanceKm);
      
      if (nearRoute.isNear) {
        return {
          id: campsite.id,
          name: campsite.name,
          location: `${campsite.latitude},${campsite.longitude}`,
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
  route: { coordinates: [number, number][] },
  bufferDistanceMiles: number,
  types: ('gas' | 'water' | 'dump' | 'walmart' | 'propane' | 'repair')[]
): TripStop[] => {
  const bufferDistanceKm = bufferDistanceMiles * 1.60934;
  const amenities: TripStop[] = [];
  
  // For each type, generate multiple instances along the route
  types.forEach(type => {
    // Generate 3-8 instances of each type
    const count = Math.floor(Math.random() * 6) + 3;
    
    // Create evenly spaced points along the route
    for (let i = 0; i < count; i++) {
      // Calculate position along the route (spread out evenly)
      const routeIndex = Math.floor((route.coordinates.length - 1) * (i / (count - 1)));
      const basePoint = route.coordinates[routeIndex];
      
      if (!basePoint) continue; // Skip if we somehow got an invalid point
      
      // Random offset in meters (up to half the buffer distance)
      const offsetKm = (Math.random() * bufferDistanceKm / 2);
      const bearingRad = Math.random() * 2 * Math.PI;
      
      // Calculate new point with offset (approximate)
      const lat = basePoint[1] + (offsetKm / 111) * Math.cos(bearingRad);
      const lng = basePoint[0] + (offsetKm / (111 * Math.cos(basePoint[1] * Math.PI / 180))) * Math.sin(bearingRad);
      
      // Generate names based on type
      let name = "";
      let details = { description: "", features: [] as string[] };
      
      switch (type) {
        case 'gas':
          name = `${['Shell', 'Chevron', 'Mobil', 'BP', 'Love\'s', 'Circle K', 'Exxon'][Math.floor(Math.random() * 7)]} Gas Station`;
          details.description = "Fuel station with convenience store.";
          details.features = ['Fuel', 'Convenience Store', Math.random() > 0.5 ? 'RV Friendly' : 'Restrooms'];
          break;
        case 'water':
          name = `${['Clear', 'Mountain', 'Spring', 'Pure', 'Fresh', 'Valley', 'River'][Math.floor(Math.random() * 7)]} Water Fill`;
          details.description = "Clean potable water fill station.";
          details.features = ['Potable Water', Math.random() > 0.5 ? 'Free' : 'Paid'];
          break;
        case 'dump':
          name = `${['RV', 'Campground', 'Park', 'Highway', 'Rest Area', 'Travel Plaza'][Math.floor(Math.random() * 6)]} Dump Station`;
          details.description = "Dump station for RV waste tanks.";
          details.features = ['Sewage Dump', 'Grey Water', Math.random() > 0.5 ? 'Rinse Hose' : 'Fee Required'];
          break;
        case 'walmart':
          name = `Walmart Supercenter #${Math.floor(Math.random() * 5000)}`;
          details = {
            description: "Many Walmarts allow overnight RV parking. Always check with store management first.",
            features: ['24/7', 'Groceries', 'RV Supplies', 'Overnight Parking']
          };
          break;
        case 'propane':
          name = `${['AmeriGas', 'Blue Rhino', 'U-Haul', 'Tractor Supply', 'Suburban Propane'][Math.floor(Math.random() * 5)]} Propane`;
          details = {
            description: "Propane refill and tank exchange station",
            features: ['Propane Refill', 'Tank Exchange', Math.random() > 0.5 ? 'RV Hookup' : 'Small Tanks Only']
          };
          break;
        case 'repair':
          name = `${['Quick', 'Express', 'Reliable', 'Pro', 'Ace', 'Expert'][Math.floor(Math.random() * 6)]} ${Math.random() > 0.5 ? 'RV' : 'Auto'} Repair`;
          details = {
            description: `${Math.random() > 0.5 ? 'RV' : 'Automotive'} repair services with experienced technicians`,
            features: ['Maintenance', 'Repairs', Math.random() > 0.5 ? 'RV Specialists' : 'General Mechanics']
          };
          break;
      }
      
      // Calculate distance and ETA
      const distancePercent = routeIndex / (route.coordinates.length - 1);
      
      amenities.push({
        id: uuidv4(),
        name,
        location: `${lat},${lng}`,
        type,
        coordinates: { lat, lng },
        distanceFromRoute: offsetKm * 1000, // Convert to meters
        distance: distancePercent * bufferDistanceKm * 1000, // Approximate distance from start in meters
        eta: formatETA(distancePercent * 3 * 60 * 60), // Estimated time assuming 3 hour trip
        details,
        safetyRating: Math.floor(Math.random() * 3) + 3 // Random safety rating 3-5
      });
    }
  });
  
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
  request: TripPlanRequest & { mapboxToken?: string }
): Promise<TripPlanResponse> => {
  const { 
    mapboxToken, 
    startLocation, 
    endLocation, 
    bufferDistance, 
    includeCampsites, 
    includeGasStations, 
    includeWaterStations, 
    includeDumpStations,
    includeWalmarts,
    includePropaneStations,
    includeRepairShops
  } = request;
  
  if (!mapboxToken) {
    throw new Error("Mapbox token is missing");
  }

  // Get directions from start to end
  const routeData = await getDirections(
    startLocation,
    endLocation,
    mapboxToken
  );
  
  // Log the route data for debugging
  console.log("Route data fetched:", {
    hasGeometry: !!routeData.geometry,
    coordinateCount: routeData.geometry?.coordinates?.length || 0,
    start: startLocation,
    end: endLocation
  });
  
  // Find stops along the route
  const stops: TripStop[] = [];
  
  // Add campsites if requested
  if (includeCampsites) {
    const campsites = findCampsitesAlongRoute(
      routeData.geometry,
      bufferDistance
    );
    stops.push(...campsites);
  }
  
  // Add other amenities if requested (in a real app, we'd fetch from an API)
  const amenityTypes: ('gas' | 'water' | 'dump' | 'walmart' | 'propane' | 'repair')[] = [];
  if (includeGasStations) amenityTypes.push('gas');
  if (includeWaterStations) amenityTypes.push('water');
  if (includeDumpStations) amenityTypes.push('dump');
  if (includeWalmarts) amenityTypes.push('walmart');
  if (includePropaneStations) amenityTypes.push('propane');
  if (includeRepairShops) amenityTypes.push('repair');
  
  if (amenityTypes.length > 0) {
    const amenities = generateMockAmenities(
      routeData.geometry,
      bufferDistance,
      amenityTypes
    );
    stops.push(...amenities);
  }
  
  return {
    routeData,
    availableStops: stops
  };
};
