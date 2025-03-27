
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "@/providers/AuthProvider";
import LoginPage from "@/pages/AuthPages/LoginPage";
import SignUpPage from "@/pages/AuthPages/SignUpPage";
import VerifyEmailPage from "@/pages/AuthPages/VerifyEmailPage";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import TripPlannerPage from "@/pages/TripPlannerPage";
import TripNavigationPage from "@/pages/TripNavigationPage";
import MapPage from "@/pages/MapPage";
import Index from "@/pages/Index"; // Using direct import for consistency
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SiteDetailPage from "@/pages/SiteDetailPage";
import NearbyPage from "@/pages/NearbyPage";
import FavoritesPage from "@/pages/FavoritesPage";
import MainLayout from "@/components/layout/MainLayout";
import AddSitePage from "@/pages/AddSitePage";
import ReviewPage from "@/pages/ReviewPage";
import CreatorProfilePage from "@/pages/CreatorProfilePage";
import MessagesPage from "@/pages/MessagesPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";
import CommunityHelpPage from "@/pages/CommunityHelpPage";
import SocialFeedPage from "@/pages/SocialFeedPage";
import FriendsPage from "@/pages/FriendsPage";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes that don't require authentication */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancel" element={<PaymentCancelPage />} />
          
          {/* Legacy auth routes redirect to new ones */}
          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
          <Route path="/auth/register" element={<Navigate to="/signup" replace />} />
          <Route path="/auth/verify" element={<Navigate to="/verify-email" replace />} />
          
          {/* Main app layout with optional auth requirements */}
          <Route path="/" element={<MainLayout />}>
            {/* Public routes within MainLayout */}
            <Route path="map" element={<MapPage />} />
            <Route path="site/:id" element={<SiteDetailPage />} />
            <Route path="search" element={<NearbyPage />} />
            <Route path="creator/:id" element={<CreatorProfilePage />} />
            <Route path="trip-planner" element={<TripPlannerPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="my-campsites" element={<FavoritesPage />} />
              <Route path="add-site" element={<AddSitePage />} />
              <Route path="review/:id" element={<ReviewPage />} />
              <Route path="planner" element={<TripPlannerPage />} />
              <Route path="navigation/:id" element={<TripNavigationPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="community-help" element={<CommunityHelpPage />} />
              <Route path="social" element={<SocialFeedPage />} />
              <Route path="friends" element={<FriendsPage />} />
            </Route>
          </Route>
          
          {/* Catch-all 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
