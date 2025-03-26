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
  const { isAuthenticated, isLoading, isEmailVerified, isOfflineMode } = useAuth();
  const location = useLocation();

  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);
  
  if (isLoading && !isLoadingTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }

  if (isLoading && isLoadingTimeout) {
    console.log("Authentication loading timed out, continuing as guest");
    
    if (requireAuth) {
      return <Navigate to="/login" state={{ from: location, timeout: true }} replace />;
    }
    
    return <Outlet />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuth && requireVerification && !isEmailVerified && !isOfflineMode) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
