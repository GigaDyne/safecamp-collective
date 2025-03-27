
/**
 * Creates a marker icon URL for navigation elements like user location
 */
export const createNavigationMarker = (
  type: 'user-location' | 'waypoint' | 'start' | 'end'
): string => {
  let color = '#3884FF'; // default blue
  let shape = 'circle';
  
  switch (type) {
    case 'user-location':
      color = '#3884FF'; // blue for user location
      shape = 'pulse';
      break;
    case 'waypoint':
      color = '#f43f5e'; // red for waypoints
      shape = 'square';
      break;
    case 'start':
      color = '#4ade80'; // green for start
      shape = 'triangle';
      break;
    case 'end':
      color = '#f43f5e'; // red for end
      shape = 'triangle';
      break;
  }
  
  let svg = '';
  
  if (shape === 'pulse') {
    // Pulsing location dot for user position
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `;
  } else if (shape === 'square') {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" fill="${color}" rx="4" stroke="white" stroke-width="2"/>
      </svg>
    `;
  } else if (shape === 'triangle') {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12,2 22,22 2,22" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `;
  } else {
    // Default circle
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `;
  }
  
  // Convert SVG to a data URL
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
