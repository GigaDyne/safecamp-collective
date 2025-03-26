
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import { MapPin, Map, Heart, User } from "lucide-react";

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("map");
  const location = useLocation();

  // Set the active tab based on the current route
  useState(() => {
    const path = location.pathname;
    if (path.includes("map")) {
      setActiveTab("map");
    } else if (path.includes("nearby")) {
      setActiveTab("nearby");
    } else if (path.includes("favorites")) {
      setActiveTab("favorites");
    } else if (path.includes("profile")) {
      setActiveTab("profile");
    } else {
      // If we're on the home page, don't show any tab as active
      setActiveTab("");
    }
  });

  const navItems = [
    { id: "map", label: "Map", icon: Map },
    { id: "nearby", label: "Nearby", icon: MapPin },
    { id: "favorites", label: "Saved", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  // Don't show the bottom nav on the index page
  const showBottomNav = location.pathname !== "/";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <main className="flex-1 relative overflow-auto">
        <Outlet context={{ activeTab }} />
      </main>
      {showBottomNav && (
        <BottomNavigation 
          items={navItems} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      )}
    </div>
  );
};

export default MainLayout;
