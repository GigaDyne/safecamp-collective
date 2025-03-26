
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedCampsite {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
}

// Sample external image URLs to use as fallbacks when database images are not available
const fallbackImages = [
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1496545672447-f699b503d270?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
  'https://images.unsplash.com/photo-1596097155664-4f5cbd7dbb12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
];

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
      const processedData = data?.map((campsite, index) => ({
        ...campsite,
        // Try to use the database image_url field, fallback to external images if not available
        image_url: campsite.image_url || 
                 campsite.image || 
                 fallbackImages[index % fallbackImages.length] || 
                 '/placeholder.svg'
      })) || [];
      
      return processedData;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
