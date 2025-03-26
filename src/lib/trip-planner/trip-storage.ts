
import { SavedTrip } from "./types";

// Local storage key for saved trips
const SAVED_TRIPS_KEY = "safeCamp_savedTrips";

// Save a trip plan to local storage
export const saveTripPlan = (trip: SavedTrip): void => {
  const existingTrips = loadTripPlans();
  const updatedTrips = [...existingTrips, trip];
  
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
};

// Load all saved trip plans from local storage
export const loadTripPlans = (): SavedTrip[] => {
  const tripsJson = localStorage.getItem(SAVED_TRIPS_KEY);
  if (!tripsJson) {
    return [];
  }
  
  try {
    return JSON.parse(tripsJson);
  } catch (error) {
    console.error("Error parsing saved trips:", error);
    return [];
  }
};

// Delete a saved trip plan
export const deleteTripPlan = (tripId: string): void => {
  const existingTrips = loadTripPlans();
  const updatedTrips = existingTrips.filter(trip => trip.id !== tripId);
  
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
};

// Get a single trip plan by ID
export const getTripPlanById = (tripId: string): SavedTrip | undefined => {
  const trips = loadTripPlans();
  return trips.find(trip => trip.id === tripId);
};

// Update an existing trip plan
export const updateTripPlan = (updatedTrip: SavedTrip): void => {
  const existingTrips = loadTripPlans();
  const updatedTrips = existingTrips.map(trip => 
    trip.id === updatedTrip.id ? updatedTrip : trip
  );
  
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
};
