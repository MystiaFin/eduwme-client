import React from "react";
import { useLocation } from "react-router-dom"; // ini diperbaiki
import Register from "./register.tsx";
import Login from "./login.tsx";
import ellipseBg from "../../assets/ellipse-bg.svg";
import Icon from "../../assets/Icon.svg";

const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#8FE1FF] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8">
        <img
          src={ellipseBg}
          alt="ellipse"
          className="absolute bottom-[-40vw] left-0 w-[50vw] md:w-[30vw] opacity-50 translate-x-[-60%]"
        />

        <img
          src={Icon}
          alt="GoGo Math"
          className="block mx-auto w-32 mt-10 md:w-40"
        />

        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            style={{
              WebkitTextStroke: "1px white",
            }}
          >
            {isLogin ? "Welcome Back!" : "Join Us!"}
          </h2>
        </div>

        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default AuthLayout;
