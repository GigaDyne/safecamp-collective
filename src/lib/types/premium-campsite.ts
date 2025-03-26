
import { CampSite } from "@/lib/supabase";

export interface PremiumCampsite {
  id: string;
  user_id: string;
  campsite_id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  campsite?: CampSite;
}
