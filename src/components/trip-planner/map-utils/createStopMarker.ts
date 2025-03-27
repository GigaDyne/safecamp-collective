
/**
 * Creates a marker icon URL for a stop based on its type and safety rating
 */
export const createStopMarker = (
  stopType: string = 'campsite', 
  safetyRating?: number, 
  isActive: boolean = false
): string => {
  // Choose color based on stop type
  let color = '#3884FF'; // default blue
  
  switch (stopType) {
    case 'campsite':
      color = '#4ade80'; // green
      break;
    case 'water':
      color = '#60a5fa'; // blue
      break;
    case 'rest_area':
      color = '#a78bfa'; // purple
      break;
    case 'gas_station':
    case 'gas':
      color = '#f43f5e'; // red
      break;
    case 'grocery':
    case 'walmart':
      color = '#8b5cf6'; // purple
      break;
    case 'propane':
      color = '#fb923c'; // orange
      break;
    case 'dump':
      color = '#78716c'; // brown
      break;
    case 'repair':
      color = '#71717a'; // gray
      break;
    case 'point_of_interest':
      color = '#fbbf24'; // yellow
      break;
  }
  
  // If this is the current active stop in navigation, make it more prominent
  const strokeWidth = isActive ? 3 : 1;
  const scale = isActive ? 1.2 : 1;
  
  // Create an SVG marker
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${24 * scale}" height="${36 * scale}" viewBox="0 0 24 36">
      <path 
        fill="${color}" 
        stroke="white" 
        stroke-width="${strokeWidth}"
        d="M12 0C5.383 0 0 5.383 0 12c0 3.912 2.167 7.721 6.124 11.427a30.021 30.021 0 0 0 5.296 3.333c.155.07.324.105.493.105.17 0 .34-.035.493-.105a30.034 30.034 0 0 0 5.296-3.333C21.833 19.721 24 15.912 24 12c0-6.617-5.383-12-12-12zm0 16c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"
      />
    </svg>
  `;
  
  // Convert SVG to a data URL
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
