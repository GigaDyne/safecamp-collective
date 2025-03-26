
import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-border/50 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <svg 
              className="h-8 w-8 text-blue-500" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 21V3L12 12L21 3V21" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <span className="ml-2 text-xl font-bold">SafeCamp</span>
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link 
            to="/map"
            className={cn(
              "flex items-center text-muted-foreground hover:text-foreground",
            )}
          >
            <MapPin className="mr-1 h-4 w-4" />
            Discover
          </Link>
          <Link 
            to="/messages"
            className="text-muted-foreground hover:text-foreground"
          >
            Messages
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/map")}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/profile">
            <Avatar>
              <AvatarImage src="/lovable-uploads/e227a530-8933-42cb-94f2-a78a64261f5c.png" />
              <AvatarFallback>JW</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
