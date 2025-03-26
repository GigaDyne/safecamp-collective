
import { SavedTrip } from "./types";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Local storage key for saved trips
const SAVED_TRIPS_KEY = "safeCamp_savedTrips";
// Guest session ID key
const GUEST_SESSION_ID_KEY = "safeCamp_guestSessionId";

// Get or create a guest session ID
export const getGuestSessionId = (): string => {
  let sessionId = localStorage.getItem(GUEST_SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = `guest-${uuidv4()}`;
    localStorage.setItem(GUEST_SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
};

// Load all saved trip plans from local storage
export const loadTripPlans = async (): Promise<SavedTrip[]> => {
  try {
    // Get user info
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user?.id;
    const guestSessionId = getGuestSessionId();
    
    // Try to load from Supabase first
    let trips: SavedTrip[] = [];
    
    try {
      // Query for trips owned by this user or guest session
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .or(`owner_id.eq.${userId || guestSessionId}`) as any;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map from Supabase format to our SavedTrip format
        trips = data.map((trip: any) => ({
          id: trip.id,
          name: trip.name,
          startLocation: trip.start_location,
          endLocation: trip.end_location,
          stops: trip.stops,
          routeData: trip.route_data,
          createdAt: trip.created_at,
          updatedAt: trip.updated_at
        }));
        
        // Update local storage with the retrieved trips
        localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
        return trips;
      }
    } catch (error) {
      console.error("Error loading trips from Supabase:", error);
      // Continue with local storage fallback
    }
    
    // Fallback to local storage
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
  } catch (error) {
    console.error("Error in loadTripPlans:", error);
    
    // Final fallback to local storage only
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
  }
};

// Save a trip plan to local storage and/or Supabase
export const saveTripPlan = async (trip: SavedTrip): Promise<void> => {
  try {
    // Always save to local storage for offline access
    const existingTrips = await loadTripPlans();
    const updatedTrips = [...existingTrips.filter(t => t.id !== trip.id), trip];
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
    
    // Try to save to Supabase if connectivity is available
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user?.id;
    
    // Determine the owner_id (either user_id or guest session_id)
    const ownerId = userId || getGuestSessionId();
    const isGuest = !userId;
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('trips')
        .upsert({
          id: trip.id,
          owner_id: ownerId,
          is_guest: isGuest,
          name: trip.name,
          start_location: trip.startLocation,
          end_location: trip.endLocation,
          stops: trip.stops,
          route_data: trip.routeData,
          created_at: trip.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error saving trip to Supabase:", error);
      // Continue with local storage only approach
    }
  } catch (error) {
    console.error("Error in saveTripPlan:", error);
    // Fallback to local-only storage
    const existingTripsJson = localStorage.getItem(SAVED_TRIPS_KEY);
    const existingTrips = existingTripsJson ? JSON.parse(existingTripsJson) : [];
    const updatedTrips = [...existingTrips.filter(t => t.id !== trip.id), trip];
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
  }
};

// Delete a saved trip plan
export const deleteTripPlan = async (tripId: string): Promise<void> => {
  try {
    // Remove from local storage
    const existingTrips = await loadTripPlans();
    const updatedTrips = existingTrips.filter(trip => trip.id !== tripId);
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
    
    // Try to remove from Supabase
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId) as any;
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting trip from Supabase:", error);
      // Continue with local-only approach
    }
  } catch (error) {
    console.error("Error in deleteTripPlan:", error);
    // Fallback to local-only deletion
    const existingTripsJson = localStorage.getItem(SAVED_TRIPS_KEY);
    const existingTrips = existingTripsJson ? JSON.parse(existingTripsJson) : [];
    const updatedTrips = existingTrips.filter(trip => trip.id !== tripId);
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
  }
};

// Get a single trip plan by ID
export const getTripPlanById = async (tripId: string): Promise<SavedTrip | undefined> => {
  const trips = await loadTripPlans();
  return trips.find(trip => trip.id === tripId);
};

// Update an existing trip plan
export const updateTripPlan = async (updatedTrip: SavedTrip): Promise<void> => {
  await saveTripPlan(updatedTrip);
};

// Generate a shareable link for a trip
export const generateShareableLink = (tripId: string): string => {
  // In a real app, this might involve creating a short URL or a special token
  // For this demo, we'll just return the local URL path
  return `/trip-navigation/${tripId}`;
};

// Import a shared trip
export const importSharedTrip = async (tripData: SavedTrip): Promise<string> => {
  // Create a new ID for the imported trip to avoid collisions
  const importedTrip = {
    ...tripData,
    id: uuidv4(),
    name: `${tripData.name} (Imported)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await saveTripPlan(importedTrip);
  return importedTrip.id;
};

// Associate guest trips with a user account
export const associateGuestTripsWithUser = async (userId: string): Promise<void> => {
  try {
    const guestSessionId = getGuestSessionId();
    
    // Update trips in Supabase
    const { error } = await supabase
      .from('trips')
      .update({ 
        owner_id: userId,
        is_guest: false,
        updated_at: new Date().toISOString()
      } as any)
      .eq('owner_id', guestSessionId) as any;
    
    if (error) throw error;
    
    // Update local storage trips with the user ID
    const trips = await loadTripPlans();
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
    
    // Keep the guest session ID for future reference but we could clear it here
    // localStorage.removeItem(GUEST_SESSION_ID_KEY);
  } catch (error) {
    console.error("Error associating guest trips with user:", error);
  }
};
