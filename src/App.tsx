
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import NearbyPage from "@/pages/NearbyPage";
import FavoritesPage from "@/pages/FavoritesPage";
import ProfilePage from "@/pages/ProfilePage";
import SiteDetailPage from "@/pages/SiteDetailPage";
import AddSitePage from "@/pages/AddSitePage";
import ReviewPage from "@/pages/ReviewPage";
import NotFound from "@/pages/NotFound";
import TripPlannerPage from "@/pages/TripPlannerPage";
import TripNavigationPage from "@/pages/TripNavigationPage";
import { Toaster } from "@/components/ui/toaster";
import IndexPage from "@/pages/IndexPage";
import MapPage from "@/pages/MapPage";

// Create ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  // Persist scroll position on route change
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<IndexPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="nearby" element={<NearbyPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="site/:id" element={<SiteDetailPage />} />
          <Route path="add-site" element={<AddSitePage />} />
          <Route path="review/:id" element={<ReviewPage />} />
          <Route path="trip-planner" element={<TripPlannerPage />} />
          <Route path="trip-navigation/:tripId" element={<TripNavigationPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
