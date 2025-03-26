
import React from 'react';
import { TripStop } from '@/lib/trip-planner/types';

interface StopPopupContentProps {
  stop: TripStop;
  onAddToItinerary: (stop: TripStop) => void;
  isAlreadyAdded: boolean;
}

const StopPopupContent: React.FC<StopPopupContentProps> = ({ 
  stop, 
  onAddToItinerary, 
  isAlreadyAdded 
}) => {
  const renderTypeIcon = () => {
    let iconColor = 'bg-green-500';
    let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
    
    switch (stop.type) {
      case 'gas':
        iconColor = 'bg-red-500';
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2"/><rect width="8" height="5" x="7" y="5" rx="1"/><path d="M7 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><path d="M8 13v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>';
        break;
      case 'water':
        iconColor = 'bg-blue-500';
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z"/></svg>';
        break;
      case 'dump':
        iconColor = 'bg-amber-500';
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
        break;
      case 'walmart':
        iconColor = 'bg-blue-600';
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 10 5-6 5 6"/><path d="m18 10-5-6-5 6"/><path d="M12 10v6"/><path d="M2 14h12a2 2 0 0 1 2 2c0 1 .5 3 2 3a1 1 0 0 0 1-1"/></svg>';
        break;
      case 'propane':
        iconColor = 'bg-orange-500';
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c0-2.76-1.11-5.24-2.88-7L12 3l2.88 2c-1.77 1.76-2.88 4.24-2.88 7z"/><path d="M12 12c0 2.76 1.11 5.24 2.88 7L12 21l-2.88-2c1.77-1.76 2.88-4.24 2.88-7z"/><path d="M20 12h-4"/><path d="M4 12h4"/></svg>';
        break;
      case 'repair':
        iconColor = 'bg-zinc-700';
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
        break;
    }

    return {
      iconColor,
      iconSvg
    };
  };

  const { iconColor, iconSvg } = renderTypeIcon();

  // Function to create the popup content as a DOM element
  const createPopupContent = () => {
    const container = document.createElement('div');
    container.className = 'p-3 min-w-[200px]';
    
    // Title container with icon
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex items-center gap-2 mb-2';
    
    const iconContainer = document.createElement('div');
    iconContainer.className = `w-6 h-6 rounded-full ${iconColor} flex items-center justify-center text-white`;
    iconContainer.innerHTML = iconSvg;
    titleContainer.appendChild(iconContainer);
    
    const title = document.createElement('h3');
    title.className = 'font-semibold text-base';
    title.textContent = stop.name;
    titleContainer.appendChild(title);
    
    container.appendChild(titleContainer);
    
    // Details container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'space-y-2 mb-3';
    
    const typeTag = document.createElement('div');
    typeTag.className = 'inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mb-2';
    typeTag.textContent = stop.type.charAt(0).toUpperCase() + stop.type.slice(1);
    detailsContainer.appendChild(typeTag);
    
    const distance = document.createElement('p');
    distance.className = 'text-xs text-muted-foreground flex items-center gap-1';
    
    const infoIcon = document.createElement('span');
    infoIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
    distance.appendChild(infoIcon);
    
    const distanceText = document.createElement('span');
    distanceText.textContent = stop.distanceFromRoute 
      ? `${(stop.distanceFromRoute / 1609.34).toFixed(1)} mi from route` 
      : "On route";
    distance.appendChild(distanceText);
    
    detailsContainer.appendChild(distance);
    
    // Description and features if available
    if (stop.details && (stop.details.description || stop.details.features?.length)) {
      const description = document.createElement('p');
      description.className = 'text-xs mt-2';
      description.textContent = stop.details.description || '';
      detailsContainer.appendChild(description);
      
      if (stop.details.features?.length) {
        const features = document.createElement('div');
        features.className = 'flex flex-wrap gap-1 mt-1';
        
        stop.details.features.slice(0, 3).forEach(feature => {
          const featureTag = document.createElement('span');
          featureTag.className = 'text-xs bg-muted px-1.5 py-0.5 rounded-sm';
          featureTag.textContent = feature;
          features.appendChild(featureTag);
        });
        
        detailsContainer.appendChild(features);
      }
    }
    
    container.appendChild(detailsContainer);
    
    // Add button or "already added" text
    const addButtonContainer = document.createElement('div');
    addButtonContainer.className = 'flex justify-end mt-3';
    
    if (!isAlreadyAdded) {
      const addButton = document.createElement('button');
      addButton.className = 'px-2.5 py-1.5 bg-primary text-primary-foreground text-xs rounded-md flex items-center gap-1.5 font-medium hover:bg-primary/90 transition-colors';
      addButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add to Itinerary';
      
      addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        onAddToItinerary(stop);
      });
      
      addButtonContainer.appendChild(addButton);
    } else {
      const addedText = document.createElement('span');
      addedText.className = 'text-xs text-green-600 font-medium flex items-center gap-1';
      addedText.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Added to itinerary';
      addButtonContainer.appendChild(addedText);
    }
    
    container.appendChild(addButtonContainer);
    
    return container;
  };

  return { createPopupContent };
};

export default StopPopupContent;
