
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedCampsite {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
}

export function useFeaturedCampsites() {
  return useQuery<FeaturedCampsite[]>({
    queryKey: ['featuredCampsites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_campsites')
        .select('*')
        .order('created_at');
      
      if (error) {
        console.error('Error fetching featured campsites:', error);
        return [];
      }
      
      // Ensure we have valid image URLs for all campsites
      const processedData = data?.map(campsite => ({
        ...campsite,
        // If the database field is using 'image' but our component expects 'image_url'
        image_url: campsite.image_url || campsite.image || '/placeholder.svg'
      })) || [];
      
      return processedData;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
