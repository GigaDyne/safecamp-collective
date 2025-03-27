
import React from 'react';

interface ViewportIndicatorProps {
  isLoading: boolean;
  campsiteCount: number;
}

const ViewportIndicator = ({ isLoading, campsiteCount }: ViewportIndicatorProps) => {
  return (
    <div className="absolute top-20 left-4 bg-background/90 text-sm py-1 px-3 rounded-full shadow-sm border border-border z-20">
      {isLoading ? 'Loading campsites in view...' : `${campsiteCount} campsites in current view`}
    </div>
  );
};

export default ViewportIndicator;
