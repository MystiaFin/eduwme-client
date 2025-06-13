import { Outlet, useLocation } from "react-router";
import Logo from "@src/assets/logo.svg";

const AuthLayout = () => {
  const location = useLocation();
  const isSignIn = location.pathname === "/login";

  return (
    <div className="min-h-screen mt-[2vh] flex flex-col items-center px-4 py-6 md:py-10">
      {/* Logo - reduced margin on laptop */}
      <img 
        src={Logo} 
        alt="EduWMe Logo" 
        className="w-36 md:w-44 mx-auto mt-10 md:mt-6" 
      />
      
      {/* Title with responsive text size */}
      <div className="flex justify-center my-4 md:my-6">
        {isSignIn ? (
          <h1 className="text-2xl md:text-3xl font-bold text-center text-[#444444] drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
            Welcome Back!
          </h1>
        ) : (
          <h1 className="text-2xl md:text-3xl font-bold text-center text-[#444444] drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
            Join Us Now!
          </h1>
        )}
      </div>
      
      {/* Container to center and constrain form width */}
      <div className="w-full max-w-md mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;