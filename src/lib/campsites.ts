
import { supabase, CampSite, mapSupabaseCampsite, formatCampsiteForSupabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Fetch all campsites
export const fetchCampSites = async (): Promise<CampSite[]> => {
  try {
    const { data, error } = await supabase
      .from('campsites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campsites:', error);
      return [];
    }

    return data.map(mapSupabaseCampsite);
  } catch (error) {
    console.error('Error in fetchCampSites:', error);
    return [];
  }
};

// Fetch a single campsite by ID
export const fetchCampSiteById = async (id: string): Promise<CampSite | null> => {
  try {
    const { data, error } = await supabase
      .from('campsites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching campsite by ID:', error);
      return null;
    }

    return mapSupabaseCampsite(data);
  } catch (error) {
    console.error('Error in fetchCampSiteById:', error);
    return null;
  }
};

// Save a new campsite or update an existing one
export const saveCampSite = async (campsite: Omit<CampSite, 'id'> | CampSite): Promise<CampSite> => {
  try {
    const formattedCampsite = formatCampsiteForSupabase(campsite);
    let result;

    // If the campsite has an ID, update it
    if ('id' in campsite) {
      const { data, error } = await supabase
        .from('campsites')
        .update(formattedCampsite)
        .eq('id', campsite.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating campsite:', error);
        throw error;
      }

      result = data;
    } else {
      // Generate a new UUID for the campsite
      const id = uuidv4();
      const { data, error } = await supabase
        .from('campsites')
        .insert({ ...formattedCampsite, id })
        .select()
        .single();

      if (error) {
        console.error('Error creating campsite:', error);
        throw error;
      }

      result = data;
    }

    return mapSupabaseCampsite(result);
  } catch (error) {
    console.error('Error in saveCampSite:', error);
    throw error;
  }
};

// Delete a campsite
export const deleteCampSite = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('campsites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campsite:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCampSite:', error);
    return false;
  }
};

// Search campsites by name, description, or location
export const searchCampSites = async (query: string): Promise<CampSite[]> => {
  try {
    const { data, error } = await supabase
      .from('campsites')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);

    if (error) {
      console.error('Error searching campsites:', error);
      return [];
    }

    return data.map(mapSupabaseCampsite);
  } catch (error) {
    console.error('Error in searchCampSites:', error);
    return [];
  }
};

// Get campsites by filter criteria
export const filterCampSites = async (filters: {
  minSafetyRating?: number;
  minCellSignal?: number;
  minQuietness?: number;
  landType?: string;
  features?: string[];
}): Promise<CampSite[]> => {
  try {
    let query = supabase.from('campsites').select('*');

    if (filters.minSafetyRating !== undefined) {
      query = query.gte('safety_rating', filters.minSafetyRating);
    }

    if (filters.minCellSignal !== undefined) {
      query = query.gte('cell_signal', filters.minCellSignal);
    }

    if (filters.minQuietness !== undefined) {
      query = query.gte('quietness', filters.minQuietness);
    }

    if (filters.landType) {
      query = query.eq('land_type', filters.landType);
    }

    if (filters.features && filters.features.length > 0) {
      // For array contains in Supabase, we need to use the contains operator
      // This will check if the features array contains ANY of the filter features
      query = query.contains('features', filters.features);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error filtering campsites:', error);
      return [];
    }

    return data.map(mapSupabaseCampsite);
  } catch (error) {
    console.error('Error in filterCampSites:', error);
    return [];
  }
};

// Get nearby campsites by coordinates and radius (in km)
export const findNearbyCampSites = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 50
): Promise<CampSite[]> => {
  try {
    // Use a Postgres function to calculate distance based on lat/lng
    // Convert the radius from km to degrees (approximately)
    // This is a simple calculation and not entirely accurate for large distances
    const radiusDegrees = radiusKm / 111;

    const { data, error } = await supabase
      .from('campsites')
      .select('*')
      .gte('latitude', latitude - radiusDegrees)
      .lte('latitude', latitude + radiusDegrees)
      .gte('longitude', longitude - radiusDegrees)
      .lte('longitude', longitude + radiusDegrees);

    if (error) {
      console.error('Error finding nearby campsites:', error);
      return [];
    }

    // Further filter results using the Haversine formula
    const filteredData = data.filter(site => {
      const distance = calculateDistance(
        latitude,
        longitude,
        site.latitude,
        site.longitude
      );
      return distance <= radiusKm;
    });

    return filteredData.map(mapSupabaseCampsite);
  } catch (error) {
    console.error('Error in findNearbyCampSites:', error);
    return [];
  }
};

// Helper function to calculate the distance between two points using the Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};
