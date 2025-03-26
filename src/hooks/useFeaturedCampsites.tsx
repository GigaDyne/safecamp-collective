
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedCampsite {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
}

// Real campsite data with public image URLs
const realCampsites = [
  {
    id: "1",
    name: "Lone Rock Beach Campground",
    description: "Beautiful camping area on the shores of Lake Powell",
    location: "Utah",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lone_Rock_Beach_Campground.jpg"
  },
  {
    id: "2",
    name: "Jenny Lake Campground",
    description: "Scenic campground in Grand Teton National Park",
    location: "Wyoming",
    image_url: "https://www.nps.gov/common/uploads/structured_data/3C7F514F-1DD8-B71B-0BFF69F7BD38DD8C.jpg"
  },
  {
    id: "3",
    name: "Kirk Creek Campground",
    description: "Breathtaking ocean views on the Big Sur coastline",
    location: "California",
    image_url: "https://www.fs.usda.gov/Internet/FSE_MEDIA/fseprd1037485.jpg"
  },
  {
    id: "4",
    name: "Kalaloch Campground",
    description: "Coastal camping in Olympic National Park",
    location: "Washington",
    image_url: "https://www.nps.gov/common/uploads/structured_data/3C7F5432-1DD8-B71B-0B00E2AD5F9CB8DD.jpg"
  },
  {
    id: "5",
    name: "White River Campground",
    description: "Alpine camping near Mount Rainier",
    location: "Washington",
    image_url: "https://www.nps.gov/mora/planyourvisit/images/White-River-Loop.jpg"
  },
  {
    id: "6",
    name: "Assateague Island Campground",
    description: "Beach camping with wild horses nearby",
    location: "Maryland",
    image_url: "https://www.nps.gov/common/uploads/structured_data/3C7E3F35-1DD8-B71B-0B201D216E3CB842.jpg"
  }
];

// Fallback images if needed
const fallbackImages = [
  'https://www.nps.gov/common/uploads/structured_data/3C7F2E4F-1DD8-B71B-0B18D1ACF2A24DC2.jpg', // Watchman Campground
  'https://upload.wikimedia.org/wikipedia/commons/5/58/Wai%CA%BBanapanapa_State_Park_beach.jpg', // Waiʻānapanapa State Park
  'https://www.nps.gov/common/uploads/structured_data/3C7F4566-1DD8-B71B-0B593D6E8E0D9C3E.jpg', // Shenandoah
  'https://www.fs.usda.gov/Internet/FSE_MEDIA/stelprdb5400717.jpg', // Lava Lake
  'https://www.nps.gov/common/uploads/structured_data/3C7F30D2-1DD8-B71B-0B1F1A1D648E4F7D.jpg', // Big Bend
  'https://www.nps.gov/common/uploads/structured_data/3C7F3164-1DD8-B71B-0B24888FC3CE836E.jpg'  // Glacier Bay
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
        
        // If we have data from the database, use it with appropriate fallbacks
        if (data && data.length > 0) {
          console.log('Supabase featured campsites data:', data);
          
          const processedData = data.map((campsite, index) => ({
            ...campsite,
            // Try database image first, then fall back to our curated images
            image_url: campsite.image_url || 
                      realCampsites[index % realCampsites.length]?.image_url ||
                      fallbackImages[index % fallbackImages.length]
          }));
          
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
