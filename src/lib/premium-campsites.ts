
import { supabase } from "@/lib/supabase";
import { PremiumCampsite } from "@/lib/types/premium-campsite";
import { CampSite, mapSupabaseCampsite } from "@/lib/supabase";
import { ensureAuthenticated } from "@/lib/auth";

// Fetch all premium campsites
export async function fetchPremiumCampsites(): Promise<PremiumCampsite[]> {
  try {
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('premium_campsites')
      .select(`
        *,
        campsite:campsite_id(*)
      `) as any;
    
    if (error) {
      console.error('Error fetching premium campsites:', error);
      return [];
    }
    
    // Map the campsite data to our CampSite type
    return data.map((item: any) => ({
      ...item,
      campsite: item.campsite ? mapSupabaseCampsite(item.campsite) : undefined
    }));
  } catch (error) {
    console.error('Error in fetchPremiumCampsites:', error);
    return [];
  }
}

// Fetch premium campsites for a specific user
export async function fetchUserPremiumCampsites(userId: string): Promise<PremiumCampsite[]> {
  try {
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('premium_campsites')
      .select(`
        *,
        campsite:campsite_id(*)
      `)
      .eq('user_id', userId) as any;
    
    if (error) {
      console.error('Error fetching user premium campsites:', error);
      return [];
    }
    
    return data.map((item: any) => ({
      ...item,
      campsite: item.campsite ? mapSupabaseCampsite(item.campsite) : undefined
    }));
  } catch (error) {
    console.error('Error in fetchUserPremiumCampsites:', error);
    return [];
  }
}

// Fetch a single premium campsite by ID
export async function fetchPremiumCampsite(id: string): Promise<PremiumCampsite | null> {
  try {
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('premium_campsites')
      .select(`
        *,
        campsite:campsite_id(*)
      `)
      .eq('id', id)
      .maybeSingle() as any;
    
    if (error) {
      console.error('Error fetching premium campsite:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      ...data,
      campsite: data.campsite ? mapSupabaseCampsite(data.campsite) : undefined
    };
  } catch (error) {
    console.error('Error in fetchPremiumCampsite:', error);
    return null;
  }
}

// Check if a user has access to a premium campsite
export async function canAccessPremiumCampsite(premiumCampsiteId: string): Promise<boolean> {
  try {
    await ensureAuthenticated();
    
    // First, try to fetch the premium campsite
    // If the RLS policies work, this will only return the campsite if the user has access
    const { data, error } = await supabase
      .from('premium_campsites')
      .select('id')
      .eq('id', premiumCampsiteId)
      .maybeSingle() as any;
    
    if (error) {
      console.error('Error checking premium campsite access:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in canAccessPremiumCampsite:', error);
    return false;
  }
}

// Create a new premium campsite
export async function createPremiumCampsite(premiumCampsite: Omit<PremiumCampsite, 'id' | 'created_at' | 'updated_at'>): Promise<PremiumCampsite | null> {
  try {
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('premium_campsites')
      .insert({
        user_id: premiumCampsite.user_id,
        campsite_id: premiumCampsite.campsite_id,
        title: premiumCampsite.title,
        description: premiumCampsite.description,
        price: premiumCampsite.price
      })
      .select()
      .single() as any;
    
    if (error) {
      console.error('Error creating premium campsite:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createPremiumCampsite:', error);
    return null;
  }
}

// Update an existing premium campsite
export async function updatePremiumCampsite(id: string, updates: Partial<PremiumCampsite>): Promise<PremiumCampsite | null> {
  try {
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('premium_campsites')
      .update({
        title: updates.title,
        description: updates.description,
        price: updates.price
      })
      .eq('id', id)
      .select()
      .single() as any;
    
    if (error) {
      console.error('Error updating premium campsite:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updatePremiumCampsite:', error);
    return null;
  }
}

// Delete a premium campsite
export async function deletePremiumCampsite(id: string): Promise<boolean> {
  try {
    await ensureAuthenticated();
    
    const { error } = await supabase
      .from('premium_campsites')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting premium campsite:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePremiumCampsite:', error);
    return false;
  }
}
