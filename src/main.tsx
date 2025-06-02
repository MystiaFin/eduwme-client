import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

// AuthContext import
import { AuthProvider } from "./AuthContext.tsx";

// Layout Import
import RootLayout from "./rootlayout.tsx";
import MainLayout from "./pages/layout.tsx";
import AuthLayout from "./pages/auth/layout.tsx";

// Page Import
import HomePage from "./pages/Home.tsx";
import LeaderboardPage from "./pages/Leaderboard.tsx";
import ProfilePage from "./pages/Profile.tsx";
import Courses from "./pages/Courses.tsx";

// Auth Pages Import
import Register from "./pages/auth/register.tsx";
import Login from "./pages/auth/login.tsx";
import { AuthGuard } from "./AuthGuard.tsx";
import { RequireAuth } from "./RequireAuth.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Tanpa layout, standalone */}
            <Route path="/" element={<App />} />

              {/* Protected routes - Require authentication */}
            <Route element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/courses/:categoryId" element={<Courses />} />
            </Route>

            {/* Dengan layout auth */}
              <Route element={<AuthGuard><AuthLayout /></AuthGuard>}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);

