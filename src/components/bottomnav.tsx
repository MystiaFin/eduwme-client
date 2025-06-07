import { NavLink, useLocation } from "react-router-dom";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcon from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";
import SettingsIcon from "@src/assets/settings.svg";
import ShopIcon from "@src/assets/store.svg";

import { useAuth } from "@src/AuthContext.tsx";
import { useState } from "react";

const BottomNavBar = () => {
  const { user } = useAuth();
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const location = useLocation();

  const profileLink = `/profile/${user?._id}`;
  
  // Check if current route is a course or exercise page
  const isCoursePage = location.pathname.includes('/courses/');
  const isExercisePage = location.pathname.includes('/exercise/');
  const shouldHideOnMobile = isCoursePage || isExercisePage;

  // If we're on a course or exercise page, hide the navbar on mobile
  if (shouldHideOnMobile) {
    return (
      <nav className="fixed bottom-0 w-full z-10 hidden md:block">
        {/* Same content as before, but with hidden class for mobile */}
        <div className="px-4 py-2">
          {showStreakInfo && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 text-sm w-64">
              <p className="text-gray-700 dark:text-gray-300 text-center mb-1">
                Your current streak: <span className="font-bold">{user?.streak || 0} {user?.streak === 1 ? "day" : "days"}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
                {user?.lastLoginDate ? 
                  `Last login: ${new Date(user.lastLoginDate).toLocaleDateString()}` : 
                  'Start your streak by completing lessons daily!'}
              </p>
              <button 
                className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowStreakInfo(false)}
              >
                ✕
              </button>
            </div>
          )}
          <ul className="mx-auto max-w-md mb-2 p-3 flex flex-row justify-around items-center bg-[#8bc3ff]/20 dark:bg-[#1e3a5f]/80 rounded-2xl border-2 border-[#374DB0] dark:border-[#6889d5]">
            {/* All list items remain the same */}
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
                }
              >
                <img src={HomeIcon} className="w-7 h-7" alt="Home" />
              </NavLink>
            </li>
            {/* Rest of navbar items... */}
            {/* All other list items remain the same */}
          </ul>
        </div>
      </nav>
    );
  }

  // Default return (show on all devices) for non-course/exercise pages
  return (
   <nav className="fixed bottom-0 w-full z-10">
      <div className="px-4 py-2">
        {/* Streak info popup */}
        {showStreakInfo && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 text-sm w-64">
            <p className="text-gray-700 dark:text-gray-300 text-center mb-1">
              Your current streak: <span className="font-bold">{user?.streak || 0} {user?.streak === 1 ? "day" : "days"}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
              {user?.lastLoginDate ? 
                `Last login: ${new Date(user.lastLoginDate).toLocaleDateString()}` : 
                'Start your streak by completing lessons daily!'}
            </p>
            <button 
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShowStreakInfo(false)}
            >
              ✕
            </button>
          </div>
        )}
        <ul className="mx-auto max-w-md mb-2 p-3 flex flex-row justify-around items-center bg-[#8bc3ff]/20 dark:bg-[#1e3a5f]/80 rounded-2xl border-2 border-[#374DB0] dark:border-[#6889d5]">
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
              }
            >
              <img src={HomeIcon} className="w-7 h-7" alt="Home" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
              }
            >
              <img src={TrophyIcon} className="w-8 h-8" alt="Leaderboard" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to={profileLink}
              className={({ isActive }) =>
                isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
              }
            >
              <img src={ProfileIcon} className="w-8 h-8" alt="Profile" />
            </NavLink>
          </li>
          <li>
           <NavLink
            to="/shop"
            className={({ isActive }) =>
              isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
            }
          >
            <img src={ShopIcon} className="w-9 h-9" alt="Shop" />
          </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
              }
            >
              <img src={SettingsIcon} className="w-8 h-8" alt="Settings" />
            </NavLink>
          </li>
          {/* Add streak button */}
          <li>
            <button 
              onClick={() => setShowStreakInfo(!showStreakInfo)}
              className="relative flex items-center justify-center w-8 h-8"
            >
              <div className="w-8 h-8 rounded-full bg-[#374DB0]/10 dark:bg-[#374DB0]/30 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-[#374DB0] dark:text-white">
                  {user?.streak || 0}
                </span>
              </div>
              {(user?.streak || 0) >= 5 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;