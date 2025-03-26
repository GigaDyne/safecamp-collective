
import React from 'react';
import CampCard from './CampCard';

const RecentCampsites: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recent Campsites</h1>
      
      <CampCard 
        title="Secluded Riverbank"
        description="A quiet, hidden spot by the river. Great for a peaceful night's sleep. Good cell service here too!"
        author="Madison R"
        price={3.00}
        days={3}
        avatarSrc="https://i.pravatar.cc/150?img=25"
      />
      
      <CampCard 
        title="Mountain Meadow"
        description="A safe, open field with stunning mountain views. Stayed here last weekend."
        author="Luke H"
        price="Free"
        days={5}
        avatarSrc="https://i.pravatar.cc/150?img=52"
      />
    </div>
  );
};

export default RecentCampsites;
