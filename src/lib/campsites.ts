
import { supabase, CampSite, formatCampsiteForSupabase, mapSupabaseCampsite } from "@/lib/supabase";
import { mockCampSites } from "@/data/mockData";
import { ensureAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Fetch campsites from Supabase
export const fetchCampSites = async (): Promise<CampSite[]> => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated();
    
    // Fetch campsites from Supabase
    const { data, error } = await supabase
      .from('campsites')
      .select('*');
    
    if (error) {
      console.error('Error fetching campsites:', error);
      return mockCampSites; // Fallback to mock data
    }
    
    if (!data || data.length === 0) {
      // If no campsites in database, seed with mock data
      await seedCampsitesIfEmpty();
      return mockCampSites;
    }
    
    // Map to our format
    return data.map(mapSupabaseCampsite);
  } catch (error) {
    console.error('Error in fetchCampSites:', error);
    return mockCampSites; // Fallback to mock data
  }
};

// Seed campsites if none exist
export const seedCampsitesIfEmpty = async (): Promise<void> => {
  try {
    // Check if campsites table exists and is empty
    const { count, error } = await supabase
      .from('campsites')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking campsites:', error);
      return;
    }
    
    if (count === 0) {
      // Convert mock data to Supabase format
      const formattedCampsites = mockCampSites.map(site => formatCampsiteForSupabase(site));
      
      // Insert mock data
      const { error: insertError } = await supabase
        .from('campsites')
        .insert(formattedCampsites);
      
      if (insertError) {
        console.error('Error seeding campsites:', insertError);
      } else {
        console.log('Successfully seeded campsites');
      }
    }
  } catch (error) {
    console.error('Error in seedCampsitesIfEmpty:', error);
  }
};

// Function to save campsite to Supabase
export const saveCampSite = async (campsite: Omit<CampSite, 'id'>): Promise<CampSite> => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated();
    
    // Format campsite for Supabase
    const supabaseCampsite = formatCampsiteForSupabase(campsite);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('campsites')
      .insert(supabaseCampsite)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map back to our format
    return mapSupabaseCampsite(data);
  } catch (error) {
    console.error('Error saving campsite to Supabase:', error);
    
    // Fallback - create an in-memory campsite
    const newCampsite = {
      ...campsite,
      id: uuidv4(),
    };
    
    return newCampsite;
  }
};
