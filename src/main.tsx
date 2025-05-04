import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Correct the import path for react-router-dom
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import AuthLayout from "./pages/auth-layout.tsx";
// Import the Home component
import Home from "./component/home.tsx";
import ProtectedRoute from "./component/protectedRoute.tsx";
import CourseDetail from "./component/courseDetail.tsx";
// Import the simplified layout if needed for other routes
// import SharedLayout from "./pages/layout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/auth" element={<AuthLayout />} />
        <Route path="/login" element={<AuthLayout />} />

          {/* --- Protected Routes --- */}
        {/* Use ProtectedRoute as a layout route */}
        <Route element={<ProtectedRoute />}>
          {/* Routes nested inside will only be accessible if token exists */}
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<Home />} />
          <Route path="/leaderboard" element={<Home />} />
          <Route path="/shop" element={<Home />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          {/* Add any other routes that require login here */}
        </Route>
        {/* --- End Protected Routes --- */}


        {/* Landing Page Route (Optional - using original App.tsx) */}
        {/* Redirect root to /dashboard if logged in, or a landing page if not */}
        {/* Simple redirect for now, add auth check later */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
    </BrowserRouter>
  </StrictMode>,
);