
import React from 'react';
import MonetizationCard from './MonetizationCard';

const MonetizationSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Monetization</h2>
      
      <MonetizationCard 
        title="Share Your Spots"
        description="Post your top camping locations and earn from others unlocking them."
        image="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600"
      />
      
      <MonetizationCard 
        title="Subscribers"
        description="Share exclusive content with your subscribers for a monthly fee."
        image="/lovable-uploads/e227a530-8933-42cb-94f2-a78a64261f5c.png"
      />
      
      <MonetizationCard 
        title="Request Aid"
        description="Reach out to the community for support when you need it."
        image="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=600"
      />
    </div>
  );
};

export default MonetizationSection;
