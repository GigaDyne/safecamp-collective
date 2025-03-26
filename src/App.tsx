
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import LoginPage from "@/pages/AuthPages/LoginPage";
import SignUpPage from "@/pages/AuthPages/SignUpPage";
import VerifyEmailPage from "@/pages/AuthPages/VerifyEmailPage";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import TripPlannerPage from "@/pages/TripPlannerPage";
import TripNavigationPage from "@/pages/TripNavigationPage";
import MapPage from "@/pages/MapPage";
import IndexPage from "@/pages/IndexPage";
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<IndexPage />} />
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<SignUpPage />} />
          <Route path="verify" element={<VerifyEmailPage />} />
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route path="map" element={<MapPage />} />
          <Route path="site/:id" element={<SiteDetailPage />} />
          <Route path="profile" element={<ProtectedRoute />}>
            <Route index element={<ProfilePage />} />
          </Route>
          <Route path="search" element={<NearbyPage />} />
          <Route path="my-campsites" element={<ProtectedRoute />}>
            <Route index element={<FavoritesPage />} />
          </Route>
          <Route path="add-site" element={<ProtectedRoute />}>
            <Route index element={<AddSitePage />} />
          </Route>
          <Route path="review/:id" element={<ProtectedRoute />}>
            <Route index element={<ReviewPage />} />
          </Route>
          <Route path="planner" element={<ProtectedRoute />}>
            <Route index element={<TripPlannerPage />} />
          </Route>
          <Route path="navigation/:id" element={<ProtectedRoute />}>
            <Route index element={<TripNavigationPage />} />
          </Route>
          <Route path="creator/:id" element={<CreatorProfilePage />} />
          <Route path="messages" element={<ProtectedRoute />}>
            <Route index element={<MessagesPage />} />
          </Route>
          <Route path="community-help" element={<CommunityHelpPage />} />
        </Route>
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancel" element={<PaymentCancelPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
