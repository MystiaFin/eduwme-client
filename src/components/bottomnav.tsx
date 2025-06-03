import { NavLink } from "react-router";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcon from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";

import { useAuth } from "@src/AuthContext.tsx";

const BottomNavBar = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  let profileLink = "/login";
  if (isAuthenticated && user && user._id) {
    profileLink = `/profile/${user._id}`;
  }

  return (
   <nav className="fixed bottom-0 w-full z-10">
      <div className="px-4 py-2">
        <ul className="mx-auto max-w-md mb-2 p-3 flex flex-row justify-around items-center bg-[#8bc3ff]/20 rounded-2xl border-2 border-[#374DB0]">
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
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;
