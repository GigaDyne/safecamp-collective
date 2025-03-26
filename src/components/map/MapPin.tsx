
// Helper function to create a custom map pin element
export const createMapPinElement = (safetyRating: number) => {
  // Create the pin container
  const pinElement = document.createElement('div');
  pinElement.className = 'relative flex items-center justify-center';
  
  // Create the pin
  const pin = document.createElement('div');
  pin.className = 'w-10 h-10 flex items-center justify-center transform-gpu transition-all duration-300 hover:scale-110 cursor-pointer';
  
  // Determine pin color based on safety rating
  let pinColor: string;
  if (safetyRating >= 4) {
    pinColor = 'bg-safe';
  } else if (safetyRating >= 2.5) {
    pinColor = 'bg-caution';
  } else {
    pinColor = 'bg-danger';
  }
  
  // Apply pin styles with pulse effect
  pin.innerHTML = `
    <div class="relative">
      <div class="absolute -top-1 -left-1 w-8 h-8 ${pinColor} opacity-20 rounded-full pin-pulse"></div>
      <div class="w-6 h-6 ${pinColor} rounded-full flex items-center justify-center shadow-md">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    </div>
  `;
  
  pinElement.appendChild(pin);
  return pinElement;
};

export default createMapPinElement;
