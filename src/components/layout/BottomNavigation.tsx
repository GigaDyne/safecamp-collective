import React from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { Map, Tent, Search, Heart, User, HelpCircle } from "lucide-react";

export default function BottomNavigation() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-2">
      <div className="container max-w-md mx-auto">
        <div className="flex justify-between items-center">
          <Link
            to="/map"
            className={clsx(
              "flex flex-col items-center p-2 rounded-lg",
              location.pathname === "/map"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Map className="h-6 w-6" />
            <span className="text-xs mt-1">Map</span>
          </Link>
          
          <Link
            to="/search"
            className={clsx(
              "flex flex-col items-center p-2 rounded-lg",
              location.pathname === "/search"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          
          <Link
            to="/community-help"
            className={clsx(
              "flex flex-col items-center p-2 rounded-lg",
              location.pathname === "/community-help"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HelpCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Help</span>
          </Link>
          
          <Link
            to="/my-campsites"
            className={clsx(
              "flex flex-col items-center p-2 rounded-lg",
              location.pathname === "/my-campsites"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tent className="h-6 w-6" />
            <span className="text-xs mt-1">My Sites</span>
          </Link>
          
          <Link
            to="/profile"
            className={clsx(
              "flex flex-col items-center p-2 rounded-lg",
              location.pathname === "/profile"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
