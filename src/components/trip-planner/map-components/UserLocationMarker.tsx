
import React from 'react';

interface UserLocationMarkerProps {
  isVisible: boolean;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-20 left-4 z-10 bg-primary/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
      <span>Your location is being tracked</span>
    </div>
  );
};

export default UserLocationMarker;
