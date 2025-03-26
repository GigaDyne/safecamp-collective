
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const { isAuthenticated, isLoading, isEmailVerified, isOfflineMode, user } = useAuth();
  const location = useLocation();

  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 3000); // 3 seconds timeout for auth loading
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsLoadingTimeout(false);
    }
  }, [isLoading]);
  
  // For debugging
  useEffect(() => {
    console.log(`Protected route status:
      - path: ${location.pathname}
      - isLoading: ${isLoading}
      - isAuthenticated: ${isAuthenticated}
      - isEmailVerified: ${isEmailVerified}
      - isOfflineMode: ${isOfflineMode}
      - user: ${user ? 'logged in' : 'not logged in'}
    `);
  }, [location.pathname, isLoading, isAuthenticated, isEmailVerified, isOfflineMode, user]);

  // Show loading spinner while auth is being checked
  if (isLoading && !isLoadingTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }

  // If loading takes too long, prevent blocking the user
  if (isLoading && isLoadingTimeout) {
    console.log("Authentication loading timed out, continuing with best effort");
    
    if (requireAuth && !user) {
      return <Navigate to="/login" state={{ from: location, timeout: true }} replace />;
    }
    
    return <Outlet />;
  }

  // Not authenticated but required
  if (requireAuth && !isAuthenticated) {
    console.log("Not authenticated, redirecting to login", { from: location.pathname });
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but email not verified (when required)
  if (requireAuth && requireVerification && !isEmailVerified && !isOfflineMode) {
    console.log("Email not verified, redirecting to verification page");
    return <Navigate to="/verify-email" replace />;
  }

  // Authenticated but accessing auth pages
  if (!requireAuth && isAuthenticated) {
    console.log("Already authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // All checks passed
  return <Outlet />;
};

export default ProtectedRoute;
