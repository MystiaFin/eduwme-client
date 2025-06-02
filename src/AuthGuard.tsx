import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// This component prevents authenticated users from accessing auth pages
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Case 1: Still checking authentication status
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Case 2: User is authenticated - redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Case 3: Not authenticated - render the children (auth pages)
  return <>{children}</>;
};