
export const createNavigationMarker = (type: string | undefined, isCurrentStop: boolean, index: number) => {
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.width = isCurrentStop ? '30px' : '20px';
  el.style.height = isCurrentStop ? '30px' : '20px';
  el.style.borderRadius = '50%';
  el.style.cursor = 'pointer';
  el.style.border = isCurrentStop ? '3px solid white' : '2px solid white';
  el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  
  switch (type) {
    case 'campsite':
      el.style.backgroundColor = '#16a34a';
      break;
    case 'gas':
      el.style.backgroundColor = '#ef4444';
      break;
    case 'water':
      el.style.backgroundColor = '#3b82f6';
      break;
    case 'dump':
      el.style.backgroundColor = '#f59e0b';
      break;
    case 'walmart':
      el.style.backgroundColor = '#2563eb';
      break;
    case 'propane':
      el.style.backgroundColor = '#f97316';
      break;
    case 'repair':
      el.style.backgroundColor = '#3f3f46';
      break;
    default:
      el.style.backgroundColor = '#6b7280';
  }
  
  if (isCurrentStop) {
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.color = 'white';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '12px';
    el.innerText = (index + 1).toString();
  }
  
  return el;
};
