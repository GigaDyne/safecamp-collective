
export const createStopMarker = (type: string): string => {
  // This is a placeholder - in a real app, you would return different marker images
  // based on the stop type. For now, we'll return hard-coded URLs.
  
  switch (type) {
    case 'campsite':
      return '/markers/campsite.svg';
    case 'water':
      return '/markers/water.svg';
    case 'rest_area':
      return '/markers/rest-area.svg';
    case 'gas_station':
    case 'gas':
      return '/markers/gas.svg';
    case 'grocery':
      return '/markers/grocery.svg';
    case 'walmart':
      return '/markers/walmart.svg';
    case 'propane':
      return '/markers/propane.svg';
    case 'dump':
      return '/markers/dump.svg';
    case 'repair':
      return '/markers/repair.svg';
    case 'point_of_interest':
      return '/markers/poi.svg';
    default:
      // Default marker
      return '/markers/default.svg';
  }
};
