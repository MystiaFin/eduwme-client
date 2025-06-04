import { NavLink } from "react-router-dom";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcon from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";
import SettingsIcon from "@src/assets/settings.svg"; // Import the settings icon

import { useAuth } from "@src/AuthContext.tsx";

const BottomNavBar = () => {
  const { user } = useAuth();

  const profileLink = `/profile/${user?._id}`;

  return (
   <nav className="fixed bottom-0 w-full z-10">
      <div className="px-4 py-2">
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
              to="/settings"
              className={({ isActive }) =>
                isActive ? "scale-110" : "opacity-70 hover:opacity-100 transition-transform"
              }
            >
              <img src={SettingsIcon} className="w-8 h-8" alt="Settings" />
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;