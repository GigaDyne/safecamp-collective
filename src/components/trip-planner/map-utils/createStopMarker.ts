
import mapboxgl from 'mapbox-gl';
import { TripStop } from '@/lib/trip-planner/types';

export const createStopMarker = (type: string, safetyRating = 3, isSelected = false) => {
  const el = document.createElement('div');
  el.className = 'marker-element';
  
  if (isSelected) {
    el.classList.add('selected-stop');
  }
  
  // Determine icon and color based on type
  let iconColor: string;
  let iconSvg: string;
  
  switch (type) {
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
    case 'campsite':
      iconColor = 'bg-green-600';
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 6 8 12H4l8-12z"/><path d="M4.18 15 2 22"/><path d="m14 20 4-1"/><path d="m14 5 6-1"/></svg>';
      break;
    default:
      iconColor = 'bg-green-500';
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  }
  
  el.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 rounded-full ${iconColor} text-white shadow-md border-2 ${isSelected ? 'border-yellow-400 scale-125' : 'border-white'}">
      ${iconSvg}
    </div>
  `;
  
  return el;
};
