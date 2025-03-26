
import { supabase } from "@/integrations/supabase/client";

// Check connectivity to Supabase
export const checkSupabaseConnectivity = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('health_check').select('count', { count: 'exact', head: true });
    const elapsed = Date.now() - start;
    
    console.log(`Supabase connectivity check: ${error ? 'failed' : 'succeeded'} in ${elapsed}ms`);
    
    return !error;
  } catch (e) {
    console.error("Supabase connectivity check error:", e);
    return false;
  }
};
