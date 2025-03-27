
import { supabase, CampSite, mapSupabaseCampsite } from "@/lib/supabase";
import { ViewportBounds } from "./types";

export async function fetchSupabaseCampsites(
  viewportBounds: ViewportBounds,
  limit: number = 50
): Promise<{ data: CampSite[], error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('campsites')
      .select('*')
      .gte('latitude', viewportBounds.south)
      .lte('latitude', viewportBounds.north)
      .gte('longitude', viewportBounds.west)
      .lte('longitude', viewportBounds.east)
      .limit(limit);
    
    if (error) throw error;
    
    if (data) {
      // Map Supabase response to CampSite format
      const mappedCampsites = data.map(site => ({
        id: site.id,
        name: site.name,
        description: site.description,
        location: site.location,
        coordinates: site.latitude && site.longitude ? { lat: site.latitude, lng: site.longitude } : undefined,
        latitude: site.latitude,
        longitude: site.longitude,
        landType: site.land_type,
        safetyRating: site.safety_rating,
        cellSignal: site.cell_signal,
        accessibility: site.accessibility,
        quietness: site.quietness,
        features: site.features || [],
        images: site.images || [],
        reviewCount: site.review_count || 0,
        source: 'supabase' as const
      }));
      
      return { data: mappedCampsites, error: null };
    }
    
    return { data: [], error: null };
  } catch (err) {
    console.error('Error fetching campsites by viewport:', err);
    return { 
      data: [], 
      error: err instanceof Error ? err : new Error('Unknown error fetching campsites') 
    };
  }
}
