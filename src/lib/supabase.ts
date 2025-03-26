
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

// Create a bucket for profile images if not exists
(async () => {
  const { data, error } = await supabase.storage.getBucket('profiles');
  if (!data && error?.code === '404') {
    await supabase.storage.createBucket('profiles', {
      public: true, // Make the bucket public
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
  }
})();

export default supabase;
