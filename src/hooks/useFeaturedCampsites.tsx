
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedCampsite {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
}

// Real campsite data with reliable image URLs
const realCampsites = [
  {
    id: "1",
    name: "Lone Rock Beach Campground",
    description: "Beautiful camping area on the shores of Lake Powell",
    location: "Utah",
    image_url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "2",
    name: "Jenny Lake Campground",
    description: "Scenic campground in Grand Teton National Park",
    location: "Wyoming",
    image_url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "3",
    name: "Kirk Creek Campground",
    description: "Breathtaking ocean views on the Big Sur coastline",
    location: "California",
    image_url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "4",
    name: "Kalaloch Campground",
    description: "Coastal camping in Olympic National Park",
    location: "Washington",
    image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "5",
    name: "White River Campground",
    description: "Alpine camping near Mount Rainier",
    location: "Washington",
    image_url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "6",
    name: "Assateague Island Campground",
    description: "Beach camping with wild horses nearby",
    location: "Maryland",
    image_url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  }
];

// Reliable fallback images
const fallbackImages = [
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
];

export function useFeaturedCampsites() {
  return useQuery<FeaturedCampsite[]>({
    queryKey: ['featuredCampsites'],
    queryFn: async () => {
      try {
        // First try to get data from Supabase
        const { data, error } = await supabase
          .from('featured_campsites')
          .select('*')
          .order('created_at');
        
        if (error) {
          console.error('Error fetching featured campsites:', error);
          return realCampsites; // Fall back to real campsite data
        }
        
        // If we have data from the database, ensure it has valid image URLs
        if (data && data.length > 0) {
          console.log('Supabase featured campsites data:', data);
          
          const processedData = data.map((campsite, index) => {
            // Check if the image URL is missing or invalid
            const hasValidImageUrl = campsite.image_url && campsite.image_url.startsWith('http');
            
            return {
              ...campsite,
              // Use the provided image URL if valid, otherwise use our reliable ones
              image_url: hasValidImageUrl ? campsite.image_url : fallbackImages[index % fallbackImages.length]
            };
          });
          
          return processedData;
        }
        
        // If no database data, use our real campsite data
        console.log('Using hardcoded campsite data');
        return realCampsites;
      } catch (error) {
        console.error('Error in useFeaturedCampsites:', error);
        return realCampsites; // Fall back to real campsite data on any error
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
