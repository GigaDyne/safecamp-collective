
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

const MainLayout = () => {
  const location = useLocation();

  // Don't show the bottom nav on the index page
  const showBottomNav = location.pathname !== "/";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <main className="flex-1 relative overflow-auto">
        <Outlet />
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
