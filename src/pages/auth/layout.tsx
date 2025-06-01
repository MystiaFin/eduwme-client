import { Outlet, NavLink, useLocation } from "react-router";
import Logo from "@src/assets/logo.svg";

const headerStyle: string =
  "my-4 text-2xl font-bold text-center text-[#444444] drop-shadow-[0_1px_1px_rgba(255,255,255,1)]";

const AuthLayout = () => {
  const location = useLocation();
  const isSignIn = location.pathname === "/login";
  const isSignUp = location.pathname === "/register";

  return (
    <div>
      <img src={Logo} alt="EduWMe Logo" className="w-40 mx-auto mt-24" />
      <div className="flex justify-center">
        <h1
          className={headerStyle}
          style={{ display: isSignIn ? "none" : "flex" }}
        >
          Join Us Now!
        </h1>
        <h1
          className={headerStyle}
          style={{ display: isSignUp ? "none" : "flex" }}
        >
          Welcome Back!
        </h1>
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
