import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import AuthLayout from "./pages/auth-layout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout />} />
        <Route path="/login" element={<AuthLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
