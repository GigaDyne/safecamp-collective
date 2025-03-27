
import mapboxgl from "mapbox-gl";
import { CampSite } from "@/lib/supabase";

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UseViewportCampsitesOptions {
  enabled?: boolean;
  limit?: number;
  debounceMs?: number;
  includeMapboxPOIs?: boolean;
  map?: mapboxgl.Map | null;
}

export interface UseViewportCampsitesResult {
  campsites: CampSite[];
  supabaseCampsites: CampSite[];
  mapboxCampsites: CampSite[];
  isLoading: boolean;
  error: Error | null;
  missingCampsites: boolean;
  refetch: () => void;
}
