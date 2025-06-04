import { NavLink } from "react-router-dom";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcon from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";
import SettingsIcon from "@src/assets/settings.svg"; // Import the settings icon
import { useAuth } from "@src/AuthContext";

const SideNavBar = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const profileLink = `/profile/${user?._id}`;

  return (
    <nav className="fixed left-0 top-0 h-full pt-20 pb-8 w-24 md:w-28 border-r border-[#374DB0]/20 bg-[#8bc3ff] dark:bg-[#1e3a5f] shadow-lg z-10">
      <div className="h-full flex flex-col justify-start">
        <ul className="flex flex-col items-center gap-8">
          {/* Home Link */}
          <li className="w-full flex justify-center">
            <NavLink to="/home">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-16 py-3 px-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-[#374DB0] text-white" 
                    : "text-[#374DB0] dark:text-white hover:bg-[#374DB0]/10"
                }`}>
                  <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                    <img src={HomeIcon} className="w-8 md:w-9 mx-auto" alt="Home" />
                    <span className="text-xs mt-1 font-medium text-center block">Home</span>
                  </div>
                  {/* Progress indicator bar - like Duolingo */}
                  <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <div className={`h-1 rounded-full transition-all ${
                      isActive ? "w-8 bg-yellow-400" : "w-0"
                    }`}></div>
                  </div>
                </div>
              )}
            </NavLink>
          </li>
          
          {/* Leaderboard Link */}
          <li className="w-full flex justify-center">
            <NavLink to="/leaderboard">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-16 py-3 px-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-[#374DB0] text-white" 
                    : "text-[#374DB0] dark:text-white hover:bg-[#374DB0]/10"
                }`}>
                  <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                    <img src={TrophyIcon} className="w-8 md:w-9 mx-auto" alt="Leaderboard" />
                    <span className="text-xs mt-1 font-medium text-center block">Ranks</span>
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <div className={`h-1 rounded-full transition-all ${
                      isActive ? "w-8 bg-yellow-400" : "w-0"
                    }`}></div>
                  </div>
                </div>
              )}
            </NavLink>
          </li>
          
          {/* Profile Link */}
          <li className="w-full flex justify-center">
            <NavLink to={profileLink}>
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-16 py-3 px-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-[#374DB0] text-white" 
                    : "text-[#374DB0] dark:text-white hover:bg-[#374DB0]/10"
                }`}>
                  <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                    <img src={ProfileIcon} className="w-8 md:w-9 mx-auto" alt="Profile" />
                    <span className="text-xs mt-1 font-medium text-center block">Profile</span>
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <div className={`h-1 rounded-full transition-all ${
                      isActive ? "w-8 bg-yellow-400" : "w-0"
                    }`}></div>
                  </div>
                </div>
              )}
            </NavLink>
          </li>

          {/* Settings Link - NEW */}
          <li className="w-full flex justify-center">
            <NavLink to="/settings">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-16 py-3 px-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-[#374DB0] text-white" 
                    : "text-[#374DB0] dark:text-white hover:bg-[#374DB0]/10"
                }`}>
                  <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                    <img src={SettingsIcon} className="w-8 md:w-9 mx-auto" alt="Settings" />
                    <span className="text-xs mt-1 font-medium text-center block">Settings</span>
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                    <div className={`h-1 rounded-full transition-all ${
                      isActive ? "w-8 bg-yellow-400" : "w-0"
                    }`}></div>
                  </div>
                </div>
              )}
            </NavLink>
          </li>

          {/* Streak display */}
          <li className="mt-auto w-full flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#374DB0]/10 dark:bg-[#374DB0]/30 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#374DB0] dark:text-white">7</span>
              <span className="text-xs text-[#374DB0] dark:text-white">days</span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SideNavBar;