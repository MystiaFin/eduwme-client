import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import AuthLayout from "./pages/auth-layout.tsx";
import App from "./App.tsx";

// Layout Import
import MainLayout from "./pages/layout.tsx";

// Page Import
import HomePage from "./pages/Home.tsx";
import LeaderboardPage from "./pages/Leaderboard.tsx";
import ProfilePage from "./pages/Profile.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/auth" element={<AuthLayout />} />
        <Route path="/login" element={<AuthLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
