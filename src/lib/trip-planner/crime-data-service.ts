
import debounce from 'lodash.debounce';

// FBI Crime Data API base URL
const FBI_API_BASE_URL = 'https://api.usa.gov/crime/fbi/sapi';
// This would typically be stored in environment variables
const API_KEY = 'iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv';

// Types for crime data
export interface CrimeDataParams {
  lat: number;
  lng: number;
  zoom: number;
}

export interface CrimeStatistic {
  county: string;
  state: string;
  violent_crime: number;
  property_crime: number;
  homicide: number;
  rape: number;
  robbery: number;
  aggravated_assault: number;
  burglary: number;
  larceny: number;
  motor_vehicle_theft: number;
  arson: number;
  year: number;
}

export interface CountyCrimeData {
  county_name: string;
  state_abbr: string;
  fips_state_code: string;
  fips_county_code: string;
  lat: number;
  lng: number;
  crime_stats: CrimeStatistic[];
  safety_score: number; // 0-100, higher is safer
}

// Mock data for development since the actual FBI API requires registration
const MOCK_CRIME_DATA: { [key: string]: CountyCrimeData[] } = {
  // Map regions to mock data (using rough coordinates as keys)
  '-95_35': [
    {
      county_name: 'Travis County',
      state_abbr: 'TX',
      fips_state_code: '48',
      fips_county_code: '453',
      lat: 30.3074624,
      lng: -97.8703941,
      crime_stats: [
        {
          county: 'Travis County',
          state: 'Texas',
          violent_crime: 450,
          property_crime: 2800,
          homicide: 32,
          rape: 120,
          robbery: 180,
          aggravated_assault: 310,
          burglary: 800,
          larceny: 1600,
          motor_vehicle_theft: 400,
          arson: 15,
          year: 2022
        }
      ],
      safety_score: 68
    },
    {
      county_name: 'Williamson County',
      state_abbr: 'TX',
      fips_state_code: '48',
      fips_county_code: '491',
      lat: 30.6459,
      lng: -97.6077,
      crime_stats: [
        {
          county: 'Williamson County',
          state: 'Texas',
          violent_crime: 210,
          property_crime: 1800,
          homicide: 8,
          rape: 65,
          robbery: 45,
          aggravated_assault: 120,
          burglary: 500,
          larceny: 1100,
          motor_vehicle_theft: 200,
          arson: 5,
          year: 2022
        }
      ],
      safety_score: 82
    }
  ],
  '-110_40': [
    {
      county_name: 'Salt Lake County',
      state_abbr: 'UT',
      fips_state_code: '49',
      fips_county_code: '035',
      lat: 40.7608,
      lng: -111.8910,
      crime_stats: [
        {
          county: 'Salt Lake County',
          state: 'Utah',
          violent_crime: 350,
          property_crime: 2400,
          homicide: 25,
          rape: 95,
          robbery: 120,
          aggravated_assault: 210,
          burglary: 650,
          larceny: 1500,
          motor_vehicle_theft: 250,
          arson: 12,
          year: 2022
        }
      ],
      safety_score: 72
    }
  ],
  '-120_35': [
    {
      county_name: 'Los Angeles County',
      state_abbr: 'CA',
      fips_state_code: '06',
      fips_county_code: '037',
      lat: 34.0522,
      lng: -118.2437,
      crime_stats: [
        {
          county: 'Los Angeles County',
          state: 'California',
          violent_crime: 650,
          property_crime: 3200,
          homicide: 45,
          rape: 150,
          robbery: 250,
          aggravated_assault: 350,
          burglary: 900,
          larceny: 1800,
          motor_vehicle_theft: 500,
          arson: 25,
          year: 2022
        }
      ],
      safety_score: 60
    }
  ]
};

// Function to get approximate region key from coordinates
const getRegionKey = (lat: number, lng: number): string => {
  const latRounded = Math.round(lat / 5) * 5;
  const lngRounded = Math.round(lng / 5) * 5;
  return `${lngRounded}_${latRounded}`;
};

// Throttled function to fetch crime data
export const fetchCrimeData = debounce(async (params: CrimeDataParams): Promise<CountyCrimeData[]> => {
  try {
    // For real implementation, uncomment this code and use the actual API
    // const response = await fetch(
    //   `${FBI_API_BASE_URL}/api/summarized/counties/${getStateFromLatLng(params.lat, params.lng)}/all?api_key=${API_KEY}`
    // );
    // if (!response.ok) throw new Error(`FBI API error: ${response.status}`);
    // const data = await response.json();
    // return processCrimeData(data, params);

    // Using mock data for development
    console.log("Fetching crime data for region around:", params.lat, params.lng);
    const regionKey = getRegionKey(params.lat, params.lng);
    
    // Simulate API response delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_CRIME_DATA[regionKey] || [];
  } catch (error) {
    console.error("Error fetching crime data:", error);
    return [];
  }
}, 1000); // Throttle to only make a request once per second

// Function to get crime data for a specific county by name
export const getCrimeDataForCounty = (countyName: string, stateAbbr: string, crimeData: CountyCrimeData[]): CountyCrimeData | undefined => {
  return crimeData.find(
    county => county.county_name.toLowerCase() === countyName.toLowerCase() && 
              county.state_abbr.toLowerCase() === stateAbbr.toLowerCase()
  );
};

// Process raw crime data into GeoJSON for map display
export const crimeDataToGeoJSON = (crimeData: CountyCrimeData[]) => {
  return {
    type: "FeatureCollection",
    features: crimeData.map(county => ({
      type: "Feature",
      properties: {
        name: county.county_name,
        state: county.state_abbr,
        safetyScore: county.safety_score,
        crimeStats: county.crime_stats[0],
      },
      geometry: {
        type: "Point",
        coordinates: [county.lng, county.lat]
      }
    }))
  };
};

// Get color based on safety score (0-100)
export const getSafetyColor = (score: number): string => {
  if (score >= 80) return "#10b981"; // Green - safe
  if (score >= 60) return "#f59e0b"; // Amber - moderate
  if (score >= 40) return "#f97316"; // Orange - caution
  return "#ef4444"; // Red - dangerous
};
