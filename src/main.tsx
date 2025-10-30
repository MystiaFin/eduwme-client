
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./styles/index.css";
import App from "./App.tsx";

// AuthContext import
import { AuthProvider } from "./AuthContext.tsx";
// Theme Provider import
import { ThemeProvider } from "./ThemeContext.tsx";

// Layout Import
import RootLayout from "./rootlayout.tsx";
import MainLayout from "./pages/layout.tsx";
import AuthLayout from "./pages/auth/layout.tsx";

// Page Import
import HomePage from "./pages/home.tsx";
import LeaderboardPage from "./pages/leaderboard.tsx";
import ProfilePage from "./pages/Profile.tsx";
import Courses from "./pages/Course.tsx";
import ExercisePage from "./pages/Exercise.tsx";
import Settings from "./pages/Settings.tsx";
import ShopPage from "./pages/Shop.tsx";

// Auth Pages Import
import Register from "./pages/auth/register.tsx";
import Login from "./pages/auth/login.tsx";
import { AuthGuard } from "./AuthGuard.tsx";
import { RequireAuth } from "./RequireAuth.tsx";
import AutoExercise from "./pages/AutoExercise.tsx";



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
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
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/courses/:courseId" element={<Courses />} />
                <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
                <Route path="/auto-exercise/:courseId" element={<AutoExercise />} />
=                <Route path="/settings" element={<Settings />} />
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
    </ThemeProvider>
  </StrictMode>,
);