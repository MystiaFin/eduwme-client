import { Navigate, Outlet } from 'react-router';

const ProtectedRoute = () => {
  // Check if the token exists in localStorage
  const token = localStorage.getItem('token');

  // If there's no token, redirect the user to the login page
  if (!token) {
    // `replace` prevents the user from navigating back to the protected route
    return <Navigate to="/login" replace />;
  }

  // If the token exists, render the child route elements
  // <Outlet /> renders the nested routes defined within this route in main.tsx
  return <Outlet />;
};

export default ProtectedRoute;