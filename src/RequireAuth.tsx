import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// This component prevents unauthenticated users from accessing protected pages
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Case 1: Still checking authentication status
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Case 2: Not authenticated - redirect immediately using Navigate component
  if (!isAuthenticated) {
    // Using Navigate component for immediate redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 3: Authenticated - render protected content
  return <>{children}</>;
};