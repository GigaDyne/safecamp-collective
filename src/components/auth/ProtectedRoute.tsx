
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireVerification?: boolean;
}

const ProtectedRoute = ({ 
  requireAuth = true,
  requireVerification = true
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isEmailVerified, isOfflineMode } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email verification is required but user's email is not verified
  // Skip this check if user is in offline mode
  if (requireAuth && requireVerification && !isEmailVerified && !isOfflineMode) {
    return <Navigate to="/verify-email" replace />;
  }

  // If user is authenticated but tries to access login/signup pages
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
