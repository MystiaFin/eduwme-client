import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom";
=======
import { BrowserRouter, Routes, Route } from "react-router";
>>>>>>> edae90bef4601f5a3b9fe6c6699bb107f5c37252
import "./index.css";
import App from "./App.tsx";

// Layout Import
import MainLayout from "./pages/layout.tsx";
import AuthLayout from "./pages/auth/layout.tsx";

// Page Import
<<<<<<< HEAD
import LandingPage from "./pages/Landing.tsx";
=======
>>>>>>> edae90bef4601f5a3b9fe6c6699bb107f5c37252
import HomePage from "./pages/Home.tsx";
import LeaderboardPage from "./pages/Leaderboard.tsx";
import ProfilePage from "./pages/Profile.tsx";

// Auth Pages Import
import Register from "./pages/auth/register.tsx";
import Login from "./pages/auth/login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        {/* Tanpa layout, standalone */}
        <Route path="/" element={<App />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Dengan layout utama */}
=======
        <Route path="/" element={<App />} />
>>>>>>> edae90bef4601f5a3b9fe6c6699bb107f5c37252
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
<<<<<<< HEAD

        {/* Dengan layout auth */}
=======
>>>>>>> edae90bef4601f5a3b9fe6c6699bb107f5c37252
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
<<<<<<< HEAD
  </StrictMode>
=======
  </StrictMode>,
>>>>>>> edae90bef4601f5a3b9fe6c6699bb107f5c37252
);
