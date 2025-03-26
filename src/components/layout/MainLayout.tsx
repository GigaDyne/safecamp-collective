
import { useState } from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import { MapPin, Map, Heart, User } from "lucide-react";

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("map");

  const navItems = [
    { id: "map", label: "Map", icon: Map },
    { id: "nearby", label: "Nearby", icon: MapPin },
    { id: "favorites", label: "Saved", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <main className="flex-1 relative overflow-hidden">
        <Outlet context={{ activeTab }} />
      </main>
      <BottomNavigation 
        items={navItems} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </div>
  );
};

export default MainLayout;
