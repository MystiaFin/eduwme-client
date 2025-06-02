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
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-transparent z-50">
      {" "}
      <div className="mx-auto max-w-md px-4">
        {" "}
        <ul className="mb-5 p-4 flex flex-row justify-around items-center bg-[#CFB6FF] rounded-2xl border-4 border-[#374DB0] shadow-xl">
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100 transition-opacity"
              }
            >
              <img src={HomeIcon} alt="Home" className="w-7 h-7" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                isActive
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100 transition-opacity"
              }
            >
              <img src={TrophyIcon} alt="Leaderboard" className="w-8 h-8" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to={profileLink}
              className={({ isActive }) =>
                `transition-opacity ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`
              }
            >
              <img src={ProfileIcon} alt="Profile" className="w-8 h-8" />
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;
