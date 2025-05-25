import React from "react";
import { useLocation } from "react-router";
import Register from "./register.tsx";
import Login from "./login.tsx";
import ellipseBg from "../../assets/ellipse-bg.svg";
import Icon from "../../assets/Icon.svg";

const AuthLayout = () => {
  // const navigate = useNavigate();
  const location = useLocation();
  // const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const isLogin = location.pathname === "/login";

  // Fungsi toggleForm dikomentari karena tidak dipakai saat ini
  // const toggleForm = () => {
  //   setIsLogin(!isLogin);
  //   navigate(isLogin ? "/register" : "/login");
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#8FE1FF] py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8">
        <img
          src={ellipseBg}
          alt="ellipse"
          className="absolute bottom-0 left-0 w-[50vw] md:w-[30vw] opacity-50 translate-x-[-60%] translate-y-[50%]"
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

          {/* Bagian tombol toggle form juga dikomentari */}
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleForm}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p> */}
        </div>

        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default AuthLayout;
