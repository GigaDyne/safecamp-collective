import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";
import { Toaster } from "@/components/ui/toaster";
import IndexPage from "@/pages/IndexPage";
import MapPage from "@/pages/MapPage";
import MessagesPage from "@/pages/MessagesPage";
import LoginPage from "@/pages/AuthPages/LoginPage";
import SignUpPage from "@/pages/AuthPages/SignUpPage";
import VerifyEmailPage from "@/pages/AuthPages/VerifyEmailPage";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CommunityHelpPage from "./pages/CommunityHelpPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<ProtectedRoute requireAuth={false} />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>
          
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancel" element={<PaymentCancelPage />} />
          
          <Route path="/" element={<IndexPage />} />
          
          <Route path="/messages" element={<MessagesPage />} />
          
          <Route element={<ProtectedRoute requireVerification={false} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          <Route element={<ProtectedRoute requireAuth={true} requireVerification={true} />}>
            <Route element={<MainLayout />}>
              <Route path="map" element={<MapPage />} />
              <Route path="nearby" element={<NearbyPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="site/:id" element={<SiteDetailPage />} />
              <Route path="add-site" element={<AddSitePage />} />
              <Route path="review/:id" element={<ReviewPage />} />
              <Route path="trip-planner" element={<TripPlannerPage />} />
              <Route path="trip-navigation/:tripId" element={<TripNavigationPage />} />
            </Route>
          </Route>
          
          <Route path="/community-help" element={
            <MainLayout>
              <CommunityHelpPage />
            </MainLayout>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
