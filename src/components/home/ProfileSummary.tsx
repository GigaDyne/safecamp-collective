
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";

const ProfileSummary: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Card className="border border-border/50">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="flex flex-col items-center justify-center mb-3 w-full pt-2">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarImage src="/lovable-uploads/e227a530-8933-42cb-94f2-a78a64261f5c.png" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          
          <h2 className="text-lg font-semibold">Sarah Connor</h2>
          <p className="text-sm text-muted-foreground">Camp Explorer</p>
        </div>
        
        <div className="w-full pt-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-sm font-medium">12</p>
              <p className="text-xs text-muted-foreground">Campsites</p>
            </div>
            <div>
              <p className="text-sm font-medium">45</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="w-full pt-3 mt-3">
          <Link 
            to="/profile" 
            className="text-sm text-primary hover:underline block text-center"
          >
            View Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;
