
import mapboxgl from "mapbox-gl";
import { CampSite } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export function fetchMapboxCampsites(
  mapInstance: mapboxgl.Map,
  existingCampsites: CampSite[]
): CampSite[] {
  if (!mapInstance || !mapInstance.loaded()) return [];
  
  try {
    // Query all visible POIs/symbols on the map
    const campingRelatedFeatures = mapInstance.queryRenderedFeatures(undefined, {
      layers: ['poi-label', 'symbol']  // Common Mapbox layers for POIs
    });
    
    // Filter for camping-related features
    const campingKeywords = ['campground', 'camp', 'camping', 'rv', 'park', 'caravan'];
    
    const mapboxPOIs: CampSite[] = [];
    const existingSupabaseIds = new Set(existingCampsites.map(c => c.id));
    const existingLocations = new Set(existingCampsites.map(c => `${c.latitude.toFixed(5)},${c.longitude.toFixed(5)}`));
    
    campingRelatedFeatures.forEach(feature => {
      if (!feature.properties) return;
      
      // Check if this is potentially a camping-related POI
      const name = (feature.properties.name || '').toLowerCase();
      const poiType = (feature.properties.type || feature.properties.class || '').toLowerCase();
      
      const isCampingRelated = 
        campingKeywords.some(keyword => name.includes(keyword)) || 
        poiType === 'campsite' || 
        poiType === 'campground' ||
        poiType === 'camp_site' || 
        feature.properties.tourism === 'camp_site' ||
        feature.properties.leisure === 'camp_site';
      
      if (isCampingRelated && feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates;
        
        // Skip if we already have this location in our Supabase dataset
        const locationKey = `${coordinates[1].toFixed(5)},${coordinates[0].toFixed(5)}`;
        if (existingLocations.has(locationKey)) return;
        
        // Create a CampSite object from the map feature
        const newCampsite: CampSite = {
          id: `mapbox-${uuidv4()}`,
          name: feature.properties.name || 'Unnamed Campground',
          description: 'This campsite was found on the map. Details may be limited.',
          location: `${coordinates[1]},${coordinates[0]}`,
          coordinates: { lat: coordinates[1], lng: coordinates[0] },
          latitude: coordinates[1],
          longitude: coordinates[0],
          landType: 'unknown',
          safetyRating: 3, // Default middle rating
          cellSignal: 3,
          accessibility: 3,
          quietness: 3,
          features: ['Found on map'],
          images: [],
          reviewCount: 0,
          source: 'mapbox'
        };
        
        mapboxPOIs.push(newCampsite);
      }
    });
    
    console.log(`Found ${mapboxPOIs.length} camping POIs from Mapbox that aren't in Supabase`);
    return mapboxPOIs;
    
  } catch (err) {
    console.error('Error fetching Mapbox campsites:', err);
    return [];
  }
}
