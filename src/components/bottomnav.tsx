import { NavLink } from "react-router";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcom from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";

const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 w-full border-gray-200 shadow-lg">
      <div className="">
        <ul className="mx-8 mb-5 p-5 flex flex-row justify-around items-center bg-[#CFB6FF] rounded-2xl border-4 border-[#374DB0]">
          <li>
            <NavLink to="/home">
              <img src={HomeIcom} className="w-9" />
            </NavLink>
          </li>
          <li>
            <NavLink to="leaderboard">
              <img src={TrophyIcon} className="w-10" />
            </NavLink>
          </li>
          <li>
            <NavLink to="profile">
              <img src={ProfileIcon} className="w-10" />
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;
