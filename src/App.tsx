
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import MapView from "./components/map/MapView";
import NearbyPage from "./pages/NearbyPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import SiteDetailPage from "./pages/SiteDetailPage";
import AddSitePage from "./pages/AddSitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence>
          <Routes>
            {/* Main tabs in the bottom nav */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<MapView />} />
              <Route path="nearby" element={<NearbyPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Standalone routes (full screen) */}
            <Route path="/site/:id" element={<SiteDetailPage />} />
            <Route path="/add-site" element={<AddSitePage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
