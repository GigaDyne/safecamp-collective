
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Map, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const MonetizationSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Creator Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/50 p-3 rounded-md flex flex-col items-center">
              <Users className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xl font-semibold">24</span>
              <span className="text-xs text-muted-foreground">Subscribers</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-md flex flex-col items-center">
              <Map className="h-5 w-5 text-emerald-500 mb-1" />
              <span className="text-xl font-semibold">8</span>
              <span className="text-xs text-muted-foreground">Premium Spots</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-md flex flex-col items-center">
              <DollarSign className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-xl font-semibold">$132</span>
              <span className="text-xs text-muted-foreground">Earnings</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-md flex flex-col items-center">
              <Gift className="h-5 w-5 text-rose-500 mb-1" />
              <span className="text-xl font-semibold">12</span>
              <span className="text-xs text-muted-foreground">Donations</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">Manage Creator Account</Button>
        </CardContent>
      </Card>

      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Monetization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="group cursor-pointer">
            <div className="relative rounded-md overflow-hidden mb-2">
              <img 
                src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600" 
                alt="Share Your Spots" 
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <h3 className="text-white font-medium">Share Your Spots</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Post your top camping locations and earn from others unlocking them.</p>
          </div>
          
          <div className="group cursor-pointer">
            <div className="relative rounded-md overflow-hidden mb-2">
              <img 
                src="/lovable-uploads/e227a530-8933-42cb-94f2-a78a64261f5c.png" 
                alt="Subscribers" 
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <h3 className="text-white font-medium">Subscribers</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Share exclusive content with your subscribers for a monthly fee.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonetizationSection;
