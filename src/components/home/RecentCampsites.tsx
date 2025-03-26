
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CampCard from './CampCard';

const RecentCampsites: React.FC = () => {
  return (
    <Card className="border border-border/50 mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Recent Campsites</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CampCard 
          title="Secluded Riverbank"
          description="A quiet, hidden spot by the river. Great for a peaceful night's sleep. Good cell service here too!"
          author="Madison R"
          price={3.00}
          days={3}
          avatarSrc="https://i.pravatar.cc/150?img=25"
          image="https://images.unsplash.com/photo-1471115853179-bb1d604434e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        />
        
        <CampCard 
          title="Mountain Meadow"
          description="A safe, open field with stunning mountain views. Stayed here last weekend."
          author="Luke H"
          price="Free"
          days={5}
          avatarSrc="https://i.pravatar.cc/150?img=52"
          image="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        />
        
        <CampCard 
          title="Lakeside Paradise"
          description="Beautiful view of the lake, secluded but still accessible. Plenty of flat space for tents."
          author="Jamie T"
          price={5.00}
          days={1}
          avatarSrc="https://i.pravatar.cc/150?img=33"
          image="https://images.unsplash.com/photo-1533575770077-052fa2c609fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        />
      </CardContent>
    </Card>
  );
};

export default RecentCampsites;
